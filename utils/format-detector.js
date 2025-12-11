// Format Detector Utility
// Automatically detects the format of input text

function detectFormat(text) {
    if (!text || !text.trim()) {
        return 'Unknown';
    }

    const trimmed = text.trim();

    // JSON detection
    if (isJSON(trimmed)) {
        return 'JSON';
    }

    // XML detection
    if (isXML(trimmed)) {
        return 'XML';
    }

    // HTML detection
    if (isHTML(trimmed)) {
        return 'HTML';
    }

    // SQL detection
    if (isSQL(trimmed)) {
        return 'SQL';
    }

    // CSV detection
    if (isCSV(trimmed)) {
        return 'CSV';
    }

    // YAML detection
    if (isYAML(trimmed)) {
        return 'YAML';
    }

    // Markdown detection
    if (isMarkdown(trimmed)) {
        return 'Markdown';
    }

    // JavaScript detection
    if (isJavaScript(trimmed)) {
        return 'JavaScript';
    }

    // CSS detection
    if (isCSS(trimmed)) {
        return 'CSS';
    }

    return 'Plain Text';
}

// JSON detection
function isJSON(text) {
    try {
        const parsed = JSON.parse(text);
        return typeof parsed === 'object';
    } catch {
        return false;
    }
}

// XML detection
function isXML(text) {
    const xmlPattern = /^\s*<\?xml|^\s*<[a-zA-Z][\w:-]*(\s+[\w:-]+\s*=\s*["'][^"']*["'])*\s*>/;
    return xmlPattern.test(text) || (text.startsWith('<') && text.endsWith('>') && text.includes('</'));
}

// HTML detection
function isHTML(text) {
    const htmlPattern = /<!DOCTYPE html>|<html|<head|<body|<div|<span|<p>|<table/i;
    return htmlPattern.test(text);
}

// SQL detection
function isSQL(text) {
    const sqlPattern = /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE)\s+/i;
    return sqlPattern.test(text);
}

// CSV detection
function isCSV(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return false;

    // Check if lines have consistent comma-separated values
    const firstLineCommas = (lines[0].match(/,/g) || []).length;
    if (firstLineCommas === 0) return false;

    return lines.slice(1, 3).every(line => {
        const commas = (line.match(/,/g) || []).length;
        return commas === firstLineCommas;
    });
}

// YAML detection
function isYAML(text) {
    const yamlPattern = /^[\w-]+:\s*.+$/m;
    const hasColonSeparator = yamlPattern.test(text);
    const hasListItems = /^\s*-\s+/m.test(text);
    const noJsonBraces = !text.trim().startsWith('{') && !text.trim().startsWith('[');

    return (hasColonSeparator || hasListItems) && noJsonBraces;
}

// Markdown detection
function isMarkdown(text) {
    const mdPatterns = [
        /^#{1,6}\s+/m,           // Headers
        /\*\*.*\*\*/,            // Bold
        /_.*_/,                  // Italic
        /\[.*\]\(.*\)/,          // Links
        /^\s*[-*+]\s+/m,         // Lists
        /```[\s\S]*```/,         // Code blocks
        /^\|.*\|.*\|$/m          // Tables
    ];

    return mdPatterns.some(pattern => pattern.test(text));
}

// JavaScript detection
function isJavaScript(text) {
    const jsPatterns = [
        /\b(function|const|let|var|class|import|export|async|await)\b/,
        /=>\s*{/,
        /console\.(log|error|warn)/,
        /\b(if|else|for|while|switch|case)\s*\(/
    ];

    return jsPatterns.some(pattern => pattern.test(text));
}

// CSS detection
function isCSS(text) {
    const cssPattern = /[.#]?[\w-]+\s*{[^}]*}/;
    const hasSelector = /^[.#]?[\w-]+\s*{/m.test(text);
    const hasProperties = /[\w-]+\s*:\s*[^;]+;/m.test(text);

    return cssPattern.test(text) || (hasSelector && hasProperties);
}
