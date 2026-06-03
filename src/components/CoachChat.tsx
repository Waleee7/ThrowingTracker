'use client';

// AI Coach Brain (W10) — chat UI. Builds the athlete context from local state,
// streams replies from /api/coach, and renders them as markdown bubbles. The
// opening greeting is generated locally (instant, no API call) so the screen is
// personalized the moment it loads.

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import {
  buildAthleteContext,
  coachGreeting,
  suggestedQuestions,
  COACH_DISCLAIMER,
  type CoachMessage,
} from '@/lib/coach';
import { miniMarkdownToHtml } from '@/lib/markdown';
import { CoachIcon } from '@/components/Icons';

export default function CoachChat() {
  const app = useApp();
  const context = useMemo(
    () => buildAthleteContext(app.profile, app.sessions),
    [app.profile, app.sessions],
  );

  const [greeting] = useState(() => coachGreeting(context));
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<'live' | 'fallback' | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const suggestions = useMemo(() => suggestedQuestions(context), [context]);

  // Follow the stream by scrolling the app's main scroll container — but only if
  // the user is already near the bottom, so scrolling up to re-read isn't hijacked.
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return;
    const nearBottom = main.scrollHeight - main.scrollTop - main.clientHeight < 200;
    if (nearBottom) main.scrollTop = main.scrollHeight;
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const history: CoachMessage[] = [...messages, { role: 'user', content: trimmed }];
      // Append the user turn + an empty assistant turn we'll stream into.
      setMessages([...history, { role: 'assistant', content: '' }]);
      setInput('');
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history, context }),
          signal: controller.signal,
        });

        setMode(res.headers.get('x-coach-mode') === 'fallback' ? 'fallback' : 'live');

        if (!res.ok || !res.body) throw new Error(`Coach request failed (${res.status})`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = '';
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const next = prev.slice();
            next[next.length - 1] = { role: 'assistant', content: acc };
            return next;
          });
        }
      } catch (err) {
        const aborted = err instanceof DOMException && err.name === 'AbortError';
        setMessages((prev) => {
          const next = prev.slice();
          const last = next[next.length - 1];
          if (last && last.role === 'assistant' && last.content === '') {
            next[next.length - 1] = {
              role: 'assistant',
              content: aborted
                ? '_(stopped)_'
                : "Hmm, I couldn't reach the coaching engine just now. Give it another shot in a sec.",
            };
          }
          return next;
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, context, isStreaming],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const showSuggestions = messages.length === 0 && !isStreaming;
  const lastMsg = messages[messages.length - 1];
  const showTyping = isStreaming && lastMsg?.role === 'assistant' && lastMsg.content === '';

  return (
    <div className="coach">
      <div className="coach-hero">
        <div className="coach-hero-icon">
          <CoachIcon size={26} />
        </div>
        <div className="coach-hero-text">
          <h2 className="coach-hero-title">Coach Brain</h2>
          <p className="coach-hero-sub">Your AI throws coach — trained on the playbook, tuned to your data</p>
        </div>
        {mode && (
          <span className={`coach-mode-badge ${mode}`}>
            {mode === 'live' ? 'Live · Claude' : 'Offline demo'}
          </span>
        )}
      </div>

      <div className="coach-stream">
        <div className="coach-msg assistant">
          <div
            className="coach-bubble"
            dangerouslySetInnerHTML={{ __html: miniMarkdownToHtml(greeting) }}
          />
        </div>

        {messages.map((m, i) => (
          <div key={i} className={`coach-msg ${m.role}`}>
            {m.role === 'assistant' ? (
              <div
                className="coach-bubble"
                dangerouslySetInnerHTML={{ __html: miniMarkdownToHtml(m.content) }}
              />
            ) : (
              <div className="coach-bubble">{m.content}</div>
            )}
          </div>
        ))}

        {showTyping && (
          <div className="coach-msg assistant">
            <div className="coach-bubble coach-typing">
              <span /> <span /> <span />
            </div>
          </div>
        )}
      </div>

      {showSuggestions && (
        <div className="coach-suggestions">
          {suggestions.map((q) => (
            <button key={q} className="coach-chip" onClick={() => send(q)}>
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        className="coach-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <textarea
          className="coach-input"
          placeholder="Ask your coach anything…"
          value={input}
          rows={1}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isStreaming}
        />
        {isStreaming ? (
          <button type="button" className="coach-stop" onClick={stop} title="Stop">
            <span className="coach-stop-square" />
          </button>
        ) : (
          <button type="submit" className="coach-send" disabled={!input.trim()} title="Send">
            <SendArrow />
          </button>
        )}
      </form>

      <p className="coach-disclaimer">{COACH_DISCLAIMER}</p>
    </div>
  );
}

function SendArrow() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12L20 4L13 20L11 13L4 12Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
