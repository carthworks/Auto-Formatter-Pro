// Syntax Highlighter Utility
// Adds color syntax highlighting to formatted code

function highlightCode(code, format) {
    if (!code) return '';

    switch (format) {
        case 'JSON':
            return highlightJSON(code);
        case 'XML':
        case 'HTML':
            return highlightXML(code);
        case 'JavaScript':
            return highlightJavaScript(code);
        case 'CSS':
            return highlightCSS(code);
        case 'SQL':
            return highlightSQL(code);
        default:
            return escapeHtml(code);
    }
}

// Highlight JSON
function highlightJSON(code) {
    return code
        .replace(/("(?:\\.|[^"\\])*")\s*:/g, '<span class="json-key">$1</span>:')
        .replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span class="json-string">$1</span>')
        .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
        .replace(/:\s*(true|false|null)/g, ': <span class="json-boolean">$1</span>')
        .replace(/([{}\[\],])/g, '<span class="json-punctuation">$1</span>');
}

// Highlight XML/HTML
function highlightXML(code) {
    return code
        .replace(/(&lt;\?xml[^?]*\?&gt;)/g, '<span class="xml-declaration">$1</span>')
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="xml-comment">$1</span>')
        .replace(/(&lt;\/?)(\w+)/g, '$1<span class="xml-tag">$2</span>')
        .replace(/(\w+)=/g, '<span class="xml-attribute">$1</span>=')
        .replace(/=("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, '=<span class="xml-value">$1</span>');
}

// Highlight JavaScript
function highlightJavaScript(code) {
    const keywords = /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|class|extends|import|export|async|await|try|catch|throw|new|this|typeof|instanceof)\b/g;
    const strings = /(["'`])(?:\\.|(?!\1)[^\\\r\n])*\1/g;
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
    const numbers = /\b(\d+\.?\d*)\b/g;

    return code
        .replace(comments, '<span class="js-comment">$1</span>')
        .replace(strings, '<span class="js-string">$&</span>')
        .replace(keywords, '<span class="js-keyword">$&</span>')
        .replace(numbers, '<span class="js-number">$&</span>');
}

// Highlight CSS
function highlightCSS(code) {
    return code
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="css-comment">$1</span>')
        .replace(/([.#]?[\w-]+)\s*\{/g, '<span class="css-selector">$1</span> {')
        .replace(/([\w-]+)\s*:/g, '<span class="css-property">$1</span>:')
        .replace(/:\s*([^;]+);/g, ': <span class="css-value">$1</span>;');
}

// Highlight SQL
function highlightSQL(code) {
    const keywords = /\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|AS|AND|OR|NOT|NULL|TRUE|FALSE)\b/gi;
    const strings = /(["'])(?:\\.|(?!\1)[^\\\r\n])*\1/g;
    const numbers = /\b(\d+\.?\d*)\b/g;

    return code
        .replace(strings, '<span class="sql-string">$&</span>')
        .replace(keywords, '<span class="sql-keyword">$&</span>')
        .replace(numbers, '<span class="sql-number">$&</span>');
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Apply syntax highlighting to element
function applySyntaxHighlighting(element, code, format) {
    const highlighted = highlightCode(escapeHtml(code), format);
    element.innerHTML = highlighted;
    element.classList.add('syntax-highlighted');
}
