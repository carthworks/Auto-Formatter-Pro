// Formatter Utility
// Formats and beautifies code in various formats

function formatCode(text, format, indentation = 2) {
    try {
        switch (format) {
            case 'JSON':
                return formatJSON(text, indentation);
            case 'XML':
            case 'HTML':
                return formatXML(text, indentation);
            case 'SQL':
                return formatSQL(text);
            case 'CSS':
                return formatCSS(text, indentation);
            case 'JavaScript':
                return formatJavaScript(text, indentation);
            case 'YAML':
                return { formatted: text, error: null }; // YAML is already formatted
            default:
                return { formatted: text, error: null };
        }
    } catch (error) {
        return { formatted: null, error: error.message };
    }
}

// Format JSON
function formatJSON(text, indentation) {
    try {
        const parsed = JSON.parse(text);
        const formatted = JSON.stringify(parsed, null, indentation);
        return { formatted, error: null };
    } catch (error) {
        const errorInfo = parseJSONError(text, error);
        return {
            formatted: null,
            error: errorInfo.message,
            suggestion: errorInfo.suggestion
        };
    }
}

// Format XML/HTML
function formatXML(text, indentation) {
    try {
        const formatted = formatXMLString(text, indentation);
        return { formatted, error: null };
    } catch (error) {
        return {
            formatted: null,
            error: `XML formatting error: ${error.message}`,
            suggestion: 'Check for unclosed tags or invalid nesting'
        };
    }
}

// Simple XML formatter
function formatXMLString(xml, indentation) {
    let formatted = '';
    let indent = 0;
    const tab = ' '.repeat(indentation);

    xml.split(/>\s*</).forEach((node) => {
        if (node.match(/^\/\w/)) indent--; // Closing tag
        formatted += tab.repeat(indent) + '<' + node + '>\n';
        if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?')) indent++; // Opening tag
    });

    return formatted.substring(1, formatted.length - 2);
}

// Format SQL
function formatSQL(text) {
    const keywords = [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
        'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
        'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
        'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE'
    ];

    let formatted = text;

    // Add line breaks before major keywords
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, `\n${keyword}`);
    });

    // Clean up extra whitespace
    formatted = formatted
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');

    return { formatted, error: null };
}

// Format CSS
function formatCSS(text, indentation) {
    const tab = ' '.repeat(indentation);
    let formatted = text;

    // Add line breaks and indentation
    formatted = formatted
        .replace(/\{/g, ' {\n')
        .replace(/\}/g, '\n}\n')
        .replace(/;/g, ';\n')
        .split('\n')
        .map(line => {
            line = line.trim();
            if (line.endsWith('{')) {
                return line;
            } else if (line === '}') {
                return line;
            } else if (line.includes(':')) {
                return tab + line;
            }
            return line;
        })
        .filter(line => line.length > 0)
        .join('\n');

    return { formatted, error: null };
}

// Format JavaScript
function formatJavaScript(text, indentation) {
    const tab = ' '.repeat(indentation);
    let formatted = text;
    let indentLevel = 0;

    // Simple formatting (basic implementation)
    formatted = formatted
        .replace(/\{/g, ' {\n')
        .replace(/\}/g, '\n}\n')
        .replace(/;/g, ';\n')
        .split('\n')
        .map(line => {
            line = line.trim();

            if (line.endsWith('{')) {
                const result = tab.repeat(indentLevel) + line;
                indentLevel++;
                return result;
            } else if (line.startsWith('}')) {
                indentLevel = Math.max(0, indentLevel - 1);
                return tab.repeat(indentLevel) + line;
            } else if (line.length > 0) {
                return tab.repeat(indentLevel) + line;
            }
            return '';
        })
        .filter(line => line.length > 0)
        .join('\n');

    return { formatted, error: null };
}

// Minify code
function minifyCode(text, format) {
    try {
        switch (format) {
            case 'JSON':
                return minifyJSON(text);
            case 'CSS':
                return minifyCSS(text);
            case 'JavaScript':
                return minifyJavaScript(text);
            case 'HTML':
            case 'XML':
                return minifyXML(text);
            default:
                return { minified: text.replace(/\s+/g, ' ').trim(), error: null };
        }
    } catch (error) {
        return { minified: null, error: error.message };
    }
}

// Minify JSON
function minifyJSON(text) {
    try {
        const parsed = JSON.parse(text);
        const minified = JSON.stringify(parsed);
        return { minified, error: null };
    } catch (error) {
        return { minified: null, error: 'Invalid JSON' };
    }
}

// Minify CSS
function minifyCSS(text) {
    const minified = text
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ')              // Collapse whitespace
        .replace(/\s*{\s*/g, '{')          // Remove space around braces
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*:\s*/g, ':')          // Remove space around colons
        .replace(/\s*;\s*/g, ';')          // Remove space around semicolons
        .trim();

    return { minified, error: null };
}

// Minify JavaScript
function minifyJavaScript(text) {
    const minified = text
        .replace(/\/\/.*$/gm, '')          // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove multi-line comments
        .replace(/\s+/g, ' ')              // Collapse whitespace
        .replace(/\s*([{}();,:])\s*/g, '$1') // Remove space around operators
        .trim();

    return { minified, error: null };
}

// Minify XML/HTML
function minifyXML(text) {
    const minified = text
        .replace(/>\s+</g, '><')           // Remove whitespace between tags
        .replace(/\s+/g, ' ')              // Collapse whitespace
        .trim();

    return { minified, error: null };
}

// Parse JSON errors
function parseJSONError(text, error) {
    const message = error.message;
    let suggestion = '';

    // Extract position from error message
    const posMatch = message.match(/position (\d+)/);
    if (posMatch) {
        const pos = parseInt(posMatch[1]);
        const context = text.substring(Math.max(0, pos - 20), Math.min(text.length, pos + 20));

        // Common JSON errors
        if (message.includes('Unexpected token')) {
            suggestion = 'Check for missing commas, quotes, or brackets near the error position';
        } else if (message.includes('Unexpected end')) {
            suggestion = 'Missing closing bracket or brace at the end';
        } else if (message.includes('Unexpected string')) {
            suggestion = 'Missing comma before this property';
        }
    }

    // Check for common mistakes
    if (text.includes("'")) {
        suggestion = 'JSON requires double quotes ("), not single quotes (\')';
    } else if (/,\s*[}\]]/.test(text)) {
        suggestion = 'Remove trailing commas before closing brackets';
    }

    return {
        message: `JSON Error: ${message}`,
        suggestion: suggestion || 'Check JSON syntax'
    };
}
