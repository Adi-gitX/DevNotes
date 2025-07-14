import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-html';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';

export function highlightCode(code: string, language: string): string {
  if (!Prism.languages[language]) {
    return code;
  }
  
  return Prism.highlight(code, Prism.languages[language], language);
}

export function detectLanguage(code: string): string {
  // Simple language detection based on common patterns
  const patterns = [
    { pattern: /\b(function|const|let|var|=>|import|export)\b/, lang: 'javascript' },
    { pattern: /\b(interface|type|as|implements|extends)\b/, lang: 'typescript' },
    { pattern: /\b(def|class|import|from|print|if __name__)\b/, lang: 'python' },
    { pattern: /<[^>]+>/, lang: 'html' },
    { pattern: /\{[^}]*\}/, lang: 'css' },
    { pattern: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)\b/i, lang: 'sql' },
    { pattern: /^\s*[\{\[]/, lang: 'json' },
  ];

  for (const { pattern, lang } of patterns) {
    if (pattern.test(code)) {
      return lang;
    }
  }

  return 'text';
}