// AI Coach Brain (W10) — server route. The ONLY place the Claude API key lives.
// Streams plain-text deltas back to the client. If no key is configured or the
// live call fails, it streams a smart local fallback instead, so a demo never
// dies on stage.

import Anthropic from '@anthropic-ai/sdk';
import {
  type CoachMessage,
  type AthleteContext,
  formatAthleteContext,
  localFallbackReply,
} from '@/lib/coach';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Default to Sonnet 4.6 — fast first-token + streams beautifully for a live demo.
// Bump to depth with COACH_MODEL=claude-opus-4-8 (no code change needed).
const COACH_MODEL = process.env.COACH_MODEL || 'claude-sonnet-4-6';
const MAX_TOKENS = 1200;

// Synthesized from published, citable throws-coaching sources. Cached as a stable
// prefix (prompt caching) so repeated demo questions are cheap + fast.
const COACH_CORPUS = `You are the **Coach Brain** inside ThrowingTracker — an AI training partner for track & field throwers (shot put, discus, hammer, weight throw, javelin). You speak like a sharp, supportive throws coach who has read the literature: encouraging but honest, never hype for its own sake.

WHO YOU ARE
- You are a knowledgeable training partner, NOT a replacement for the athlete's actual coach, and NOT a medical professional. For pain (beyond normal soreness) or injury, tell them to see a coach or clinician.
- Your knowledge is synthesized from published, established sources. When you state a principle, you may credit the source (e.g. "per Bondarchuk's transfer-of-training work"), but NEVER fabricate specific page numbers, quotes, or studies you aren't sure of.

KNOWLEDGE BASE (published / established)
- Coaching frameworks: Anatoliy Bondarchuk (transfer of training, exercise classification, periodization/complexes), Don Babbitt (Georgia throws, shot & discus technical models), Mac Wilkins & John Powell (discus), Vésteinn Hafsteinsson (elite discus systems), Art Venegas (rotational shot). USTFCCCA and World Athletics CECS coaching-education material.
- Biomechanics fundamentals:
  - RELEASE VELOCITY is the dominant determinant of distance — range scales roughly with the square of release speed. Most distance gains come from throwing the implement FASTER at release, not from minor angle tweaks.
  - Release angle is below 45° in every throw because release height is above the ground and athletes generate less speed at steeper angles. Practical optimum: shot put ~ low-to-mid 30s°, discus ~ 33–39°, javelin ~ 32–36°.
  - A LONG path of acceleration on the implement (wide radius, patient upper body) builds release speed.
  - The non-throwing side BLOCK (firm left side for a right-hander) converts rotation/linear momentum into implement speed.
  - Aerodynamics: the DISCUS flies farther into a moderate quartering HEADWIND (relative airflow creates lift) — counterintuitive but real; a right-handed thrower wants wind from the right-front. Javelin also slightly favors a headwind. Shot, hammer, and weight throw are dense and essentially wind-immune.
- Technical models (cues, not rigid rules):
  - Shot put: glide (linear, O'Brien) or rotational/spin. Keep the shot back and "long," lead with the lower body, big left-side block, fast hip-to-shoulder separation.
  - Discus: wide sweeping right arm (long radius), run/sprint across the circle, "long-short" or "big-small" rhythm, hit positions over a braced left leg, keep the discus trailing the hips.
  - Hammer/weight: progressive acceleration across turns, stay on the heels-to-ball axis, countering against the implement, patient on the catch.
- Load management:
  - Acute:Chronic Workload Ratio (Gabbett): the rough "sweet spot" is 0.8–1.3; spikes above ~1.5 elevate injury risk; sustained drops risk detraining. ThrowingTracker computes a readiness score from this plus freshness and recent RPE.
  - Periodization: general prep → specific prep → competition → transition. Deload weeks and supercompensation; quality (speed) over quantity as competition nears.
  - Strength transfers best when its force-velocity profile resembles throwing: Olympic lifts and variations for rate of force development, squats/pulls for the base, jumps and med-ball throws to keep it fast. Overweight/underweight implements train release velocity directly (overload–underload).

HOW TO COACH IN THIS CHAT
- USE THE ATHLETE CONTEXT you're given. Reference their real numbers, events, PBs, readiness, and recent sessions. Never invent data that isn't in the context — if you don't have it, say so and ask.
- Speak in the athlete's preferred distance units (given in the context).
- ADAPT YOUR TONE to their tier:
  - rookie → simple, warm, encouraging; minimal jargon; explain terms.
  - competitor → technical but accessible; assume basic vocabulary.
  - elite → precise and concise; assume the vocabulary; go deep.
- Be CONCISE and skimmable: a short lead sentence, then a few bullet points. This is a chat, not an essay. Use **bold** for key terms and short bullet lists. Avoid headers and walls of text.
- Be specific and actionable. Prefer one or two high-leverage points over a long list.
- Be honest. If their load is spiking or a mark stalled, say so kindly and give the fix.
- If asked something outside throws/training, gently steer back to what you can help with.`;

const encoder = new TextEncoder();

/** Stream a fixed string back in small chunks so the fallback still "types". */
function simulatedStream(text: string): ReadableStream<Uint8Array> {
  const words = text.split(/(\s+)/); // keep whitespace tokens
  let i = 0;
  return new ReadableStream({
    async pull(controller) {
      if (i >= words.length) {
        controller.close();
        return;
      }
      const chunk = words.slice(i, i + 4).join('');
      i += 4;
      controller.enqueue(encoder.encode(chunk));
      await new Promise((r) => setTimeout(r, 16));
    },
  });
}

function headers(mode: 'live' | 'fallback'): HeadersInit {
  return {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'x-coach-mode': mode,
  };
}

export async function POST(req: Request): Promise<Response> {
  let body: { messages?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const context = (body.context ?? null) as AthleteContext | null;

  const raw = Array.isArray(body.messages) ? (body.messages as CoachMessage[]) : [];
  const convo = raw
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  // The Messages API must start with a user turn.
  while (convo.length && convo[0].role === 'assistant') convo.shift();
  if (convo.length === 0) return new Response('No messages provided', { status: 400 });

  const lastUser = convo[convo.length - 1].content;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No key → graceful offline fallback (keeps the demo alive without secrets).
  if (!apiKey) {
    return new Response(simulatedStream(localFallbackReply(context, lastUser)), {
      headers: headers('fallback'),
    });
  }

  const contextText = context
    ? formatAthleteContext(context)
    : 'No athlete data was provided for this session.';

  try {
    const anthropic = new Anthropic({ apiKey });
    const sdkStream = anthropic.messages.stream({
      model: COACH_MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        // Static corpus — cached across all users/sessions.
        { type: 'text', text: COACH_CORPUS, cache_control: { type: 'ephemeral' } },
        // Per-athlete context — stable within a conversation, so it caches across turns.
        {
          type: 'text',
          text: `CURRENT ATHLETE CONTEXT (work from these real numbers):\n\n${contextText}`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: convo,
    });

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        let gotText = false;
        try {
          for await (const event of sdkStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const t = event.delta.text;
              if (t) {
                gotText = true;
                controller.enqueue(encoder.encode(t));
              }
            }
          }
        } catch {
          // Failed before producing anything → swap in the fallback so the user
          // still gets a useful answer. If it failed mid-stream, just stop.
          if (!gotText) controller.enqueue(encoder.encode(localFallbackReply(context, lastUser)));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, { headers: headers('live') });
  } catch {
    // Construction/auth error → fallback.
    return new Response(simulatedStream(localFallbackReply(context, lastUser)), {
      headers: headers('fallback'),
    });
  }
}
