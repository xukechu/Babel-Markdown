import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

const markdownRenderer = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const allowedTags = Array.from(
  new Set([
    ...sanitizeHtml.defaults.allowedTags,
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'img',
    'figure',
    'figcaption',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'pre',
    'code',
  ]),
);

const allowedAttributes: sanitizeHtml.IOptions['allowedAttributes'] = {
  ...sanitizeHtml.defaults.allowedAttributes,
  a: ['href', 'name', 'target', 'rel', 'title'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  code: ['class'],
};

const allowedSchemes = Array.from(new Set([...sanitizeHtml.defaults.allowedSchemes, 'mailto']));

const baseAllowedSchemesByTag = sanitizeHtml.defaults.allowedSchemesByTag ?? {};

const allowedSchemesByTag: sanitizeHtml.IOptions['allowedSchemesByTag'] = {
  ...baseAllowedSchemesByTag,
  img: ['http', 'https', 'data'],
};

export function renderMarkdownToHtml(markdown: string): string {
  const rendered = markdownRenderer.render(markdown);

  return sanitizeHtml(rendered, {
    allowedTags,
    allowedAttributes,
    allowedSchemes,
    allowedSchemesByTag,
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer',
        target: '_blank',
      }),
    },
  });
}
