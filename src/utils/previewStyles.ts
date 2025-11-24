type PreviewStyleOptions = {
  theme: 'light' | 'dark';
  background: string;
  foreground: string;
  border: string;
};

export function buildPreviewStyles(options: PreviewStyleOptions): string {
  const { theme, background, foreground, border } = options;
  const surface = theme === 'dark' ? '#252526' : '#ffffff';
  const subtle = theme === 'dark' ? '#9ca3af' : '#4b5563';
  const blockquoteBorder = theme === 'dark' ? '#4f46e5' : '#2563eb';
  const codeBg = theme === 'dark' ? '#1f2937' : '#f5f7fa';
  const tableBorder = theme === 'dark' ? '#374151' : '#e5e7eb';
  const hrColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const link = theme === 'dark' ? '#93c5fd' : '#1d4ed8';

  return `
    :root {
      color-scheme: ${theme};
    }

    body {
      background: ${background};
      color: ${foreground};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 24px;
      line-height: 1.65;
    }

    main {
      max-width: 960px;
      margin: 0 auto;
      background: ${surface};
      border: 1px solid ${border};
      border-radius: 8px;
      padding: 24px;
      box-shadow: ${theme === 'dark' ? 'none' : '0 10px 24px rgba(15, 23, 42, 0.08)'};
    }

    header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 16px;
      color: ${subtle};
      font-size: 0.95rem;
    }

    h1, h2, h3, h4, h5, h6 {
      font-weight: 600;
      line-height: 1.3;
      color: ${foreground};
      margin: 1.2em 0 0.6em;
    }

    h1 { font-size: 1.8em; }
    h2 { font-size: 1.6em; }
    h3 { font-size: 1.35em; }
    h4 { font-size: 1.2em; }
    h5 { font-size: 1.1em; }
    h6 { font-size: 1em; color: ${subtle}; }

    p {
      margin: 0.6em 0;
    }

    ul, ol {
      margin: 0.6em 0 0.6em 1.4em;
      padding: 0 0 0 0.2em;
    }

    li + li {
      margin-top: 0.3em;
    }

    blockquote {
      border-left: 4px solid ${blockquoteBorder};
      padding-left: 12px;
      margin: 0.8em 0;
      color: ${subtle};
      background: ${theme === 'dark' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(37, 99, 235, 0.08)'};
    }

    pre {
      background: ${codeBg};
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.95em;
    }

    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.95em;
      background: ${codeBg};
      padding: 2px 4px;
      border-radius: 4px;
    }

    pre code {
      background: transparent;
      padding: 0;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 0.8em 0;
      font-size: 0.95em;
    }

    th,
    td {
      border: 1px solid ${tableBorder};
      padding: 8px 10px;
      text-align: left;
    }

    hr {
      border: none;
      border-top: 1px solid ${hrColor};
      margin: 1em 0;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0.6em 0;
    }

    a {
      color: ${link};
      text-decoration: none;
    }

    a:hover, a:focus {
      text-decoration: underline;
    }
  `;
}
