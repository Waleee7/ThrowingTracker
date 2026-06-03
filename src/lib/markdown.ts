// Tiny, dependency-free markdown → safe HTML renderer for coach replies.
// We escape first, THEN apply a small whitelist of formatting, so the output is
// XSS-safe even though it's injected via dangerouslySetInnerHTML. Supports just
// what the coach actually emits: **bold**, `code`, bullet/numbered lists, simple
// headings, and paragraphs.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

export function miniMarkdownToHtml(src: string): string {
  const escaped = escapeHtml(src ?? '');
  const lines = escaped.split('\n');
  const out: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    const heading = line.match(/^\s*#{1,4}\s+(.*)$/);

    if (bullet) {
      if (listType !== 'ul') {
        closeList();
        out.push('<ul>');
        listType = 'ul';
      }
      out.push(`<li>${inline(bullet[1])}</li>`);
    } else if (numbered) {
      if (listType !== 'ol') {
        closeList();
        out.push('<ol>');
        listType = 'ol';
      }
      out.push(`<li>${inline(numbered[1])}</li>`);
    } else if (heading) {
      closeList();
      out.push(`<p class="coach-h"><strong>${inline(heading[1])}</strong></p>`);
    } else if (line.trim() === '') {
      closeList();
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join('');
}
