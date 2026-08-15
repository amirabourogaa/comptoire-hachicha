import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'span',
  'div',
  'ul',
  'ol',
  'li',
  'a',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'img',
  'u',
  's',
  'sub',
  'sup',
] as const;

const ALLOWED_ATTR = ['style', 'href', 'src', 'alt', 'class', 'target', 'rel', 'title'] as const;

let hooksInstalled = false;

function decodeHtmlEntities(input: string) {
  if (!input) return '';
  if (typeof window === 'undefined' || !input.includes('&')) return input;

  const textarea = document.createElement('textarea');
  let decoded = input;

  // Handle multi-escaped content (&amp;lt;p&amp;gt;...) without over-processing.
  for (let i = 0; i < 3; i += 1) {
    textarea.innerHTML = decoded;
    const next = textarea.value;
    if (next === decoded) break;
    decoded = next;
  }

  return decoded;
}

function sanitizeInlineStyle(style: string) {
  // Keep only safe inline color styling (needed for the editor use-case)
  const declarations = style
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean);

  const kept: string[] = [];

  for (const decl of declarations) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;

    const prop = decl.slice(0, idx).trim().toLowerCase();
    const value = decl.slice(idx + 1).trim();

    if (prop !== 'color') continue;

    const isSafeColor =
      /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ||
      /^rgb(a)?\(/i.test(value) ||
      /^hsl(a)?\(/i.test(value) ||
      /^[a-z]+$/i.test(value);

    if (isSafeColor) kept.push(`color: ${value}`);
  }

  return kept.join('; ');
}

export function sanitizeRichTextHtml(dirty: string) {
  const decoded = decodeHtmlEntities(dirty);

  if (!hooksInstalled && typeof window !== 'undefined') {
    DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
      if (data.attrName === 'style') {
        const filtered = sanitizeInlineStyle(String(data.attrValue ?? ''));
        if (filtered) data.attrValue = filtered;
        else data.keepAttr = false;
      }
    });

    hooksInstalled = true;
  }

  return DOMPurify.sanitize(decoded, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: [...ALLOWED_ATTR],
  });
}
