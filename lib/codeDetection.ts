export function detectAndHighlightCode(text: string): boolean {
  // Common code patterns
  const codePatterns = [
    // JavaScript/TypeScript
    /\b(function|const|let|var|class|interface|type|import|export|async|await)\b/,
    // Python
    /\b(def|class|import|from|if __name__|print|return)\b/,
    // HTML/XML
    /<[^>]+>/,
    // CSS
    /\{[^}]*:[^}]*\}/,
    // SQL
    /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP)\b/i,
    // Common programming constructs
    /\b(if|else|for|while|switch|case|try|catch|finally)\b/,
    // Brackets and semicolons (common in many languages)
    /[(){}\[\];].*[(){}\[\];]/,
    // JSON
    /^\s*[\{\[]/,
    // Code blocks
    /```/,
    // Function calls
    /\w+\([^)]*\)/,
  ];

  // Check if text contains multiple code indicators
  const matches = codePatterns.filter(pattern => pattern.test(text));
  
  // If it has multiple indicators or is clearly structured code, treat as code
  return matches.length >= 2 || 
         text.includes('```') || 
         (text.split('\n').length > 3 && matches.length >= 1) ||
         text.length > 50 && matches.length >= 1;
}

export function processCodeKeywords(line: string): boolean {
  const codeKeywords = [
    '#code', '#js', '#javascript', '#ts', '#typescript',
    '#python', '#py', '#java', '#cpp', '#c++', '#csharp', '#c#',
    '#html', '#css', '#scss', '#sql', '#bash', '#shell',
    '#json', '#xml', '#yaml', '#yml', '#markdown', '#md',
    '#php', '#ruby', '#go', '#rust', '#swift', '#kotlin',
    '#react', '#vue', '#angular', '#node', '#express'
  ];
  
  const trimmedLine = line.trim().toLowerCase();
  return codeKeywords.some(keyword => trimmedLine.includes(keyword));
}

export function formatCodeBlock(code: string, language: string = ''): string {
  // Clean up the code
  const cleanCode = code.trim();
  
  // Auto-detect language if not provided
  if (!language) {
    language = detectLanguageFromCode(cleanCode);
  }
  
  return `\`\`\`${language}\n${cleanCode}\n\`\`\``;
}

export function detectLanguageFromCode(code: string): string {
  const patterns = [
    { pattern: /\b(interface|type|as|implements|extends|namespace|TSX?)\b/i, lang: 'typescript' },
    { pattern: /\b(function|const|let|var|=>|import|export|console\.log|React|useState|useEffect)\b/, lang: 'javascript' },
    { pattern: /\b(def|class|import|from|print|if __name__|lambda|pip|python)\b/i, lang: 'python' },
    { pattern: /\b(public|private|class|static|void|String|int|System\.out|main)\b/, lang: 'java' },
    { pattern: /\b(using|namespace|public|private|class|static|void|string|int|Console)\b/, lang: 'csharp' },
    { pattern: /\b(#include|iostream|std::|cout|cin|int main|vector|string)\b/, lang: 'cpp' },
    { pattern: /<[^>]+>.*<\/[^>]+>|<!DOCTYPE|<html|<div|<span/, lang: 'html' },
    { pattern: /\{[^}]*:[^}]*\}|@media|\.class|#id/, lang: 'css' },
    { pattern: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|TABLE|DATABASE)\b/i, lang: 'sql' },
    { pattern: /\b(echo|ls|cd|mkdir|rm|grep|awk|sed|bash|sh)\b/, lang: 'bash' },
    { pattern: /^\s*[\{\[]|"[^"]*":\s*[^,}]+/, lang: 'json' },
    { pattern: /\$[a-zA-Z_][a-zA-Z0-9_]*|<\?php/, lang: 'php' },
    { pattern: /\b(func|var|package|import|fmt\.Println|go)\b/, lang: 'go' },
    { pattern: /\b(fn|let|mut|struct|impl|use|cargo)\b/, lang: 'rust' },
    { pattern: /\b(func|var|let|class|struct|import|swift)\b/, lang: 'swift' },
    { pattern: /\b(fun|val|var|class|object|kotlin)\b/, lang: 'kotlin' },
  ];

  for (const { pattern, lang } of patterns) {
    if (pattern.test(code)) {
      return lang;
    }
  }

  return 'text';
}

export function wrapCodeBlock(code: string, language: string = ''): string {
  return formatCodeBlock(code, language);
}