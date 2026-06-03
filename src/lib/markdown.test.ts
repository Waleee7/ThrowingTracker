import { describe, it, expect } from 'vitest';
import { miniMarkdownToHtml } from './markdown';

describe('markdown: miniMarkdownToHtml', () => {
  it('escapes HTML before formatting (XSS-safe)', () => {
    const html = miniMarkdownToHtml('a <script>alert(1)</script> b');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('renders bold and inline code', () => {
    expect(miniMarkdownToHtml('**bold**')).toContain('<strong>bold</strong>');
    expect(miniMarkdownToHtml('use `npm test`')).toContain('<code>npm test</code>');
  });

  it('groups bullet lines into a <ul>', () => {
    const html = miniMarkdownToHtml('- one\n- two');
    expect(html).toContain('<ul>');
    expect((html.match(/<li>/g) ?? []).length).toBe(2);
  });

  it('groups numbered lines into an <ol>', () => {
    const html = miniMarkdownToHtml('1. first\n2. second');
    expect(html).toContain('<ol>');
    expect((html.match(/<li>/g) ?? []).length).toBe(2);
  });

  it('wraps plain text in paragraphs', () => {
    expect(miniMarkdownToHtml('hello world')).toBe('<p>hello world</p>');
  });
});
