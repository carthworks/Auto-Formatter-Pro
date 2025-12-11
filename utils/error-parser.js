// Error Parser Utility
// Detects and provides suggestions for common formatting errors

function parseError(text, format) {
    switch (format) {
        case 'JSON':
            return parseJSONErrors(text);
        case 'XML':
        case 'HTML':
            return parseXMLErrors(text);
        case 'SQL':
            return parseSQLErrors(text);
        default:
            return { errors: [], suggestions: [] };
    }
}

// Parse JSON errors
function parseJSONErrors(text) {
    const errors = [];
    const suggestions = [];

    try {
        JSON.parse(text);
        return { errors, suggestions };
    } catch (error) {
        const message = error.message;

        // Extract position
        const posMatch = message.match(/position (\d+)/);
        let position = posMatch ? parseInt(posMatch[1]) : 0;

        // Calculate line and column
        const lines = text.substring(0, position).split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;

        errors.push({
            line,
            column,
            message: message,
            type: 'SyntaxError'
        });

        // Provide specific suggestions
        if (message.includes('Unexpected token')) {
            // Check for single quotes
            if (text.includes("'")) {
                suggestions.push({
                    issue: 'Single quotes detected',
                    fix: 'Replace all single quotes (\') with double quotes (")',
                    severity: 'high'
                });
            }

            // Check for trailing commas
            if (/,\s*[}\]]/.test(text)) {
                suggestions.push({
                    issue: 'Trailing comma found',
                    fix: 'Remove commas before closing brackets ] or braces }',
                    severity: 'high'
                });
            }

            // Check for missing commas
            const context = text.substring(Math.max(0, position - 30), position);
            if (/"[^"]*"\s*"/.test(context)) {
                suggestions.push({
                    issue: 'Missing comma between properties',
                    fix: 'Add comma after the previous property',
                    severity: 'high'
                });
            }
        }

        if (message.includes('Unexpected end')) {
            suggestions.push({
                issue: 'Unexpected end of JSON',
                fix: 'Add missing closing bracket ] or brace }',
                severity: 'critical'
            });

            // Count brackets
            const openBraces = (text.match(/\{/g) || []).length;
            const closeBraces = (text.match(/\}/g) || []).length;
            const openBrackets = (text.match(/\[/g) || []).length;
            const closeBrackets = (text.match(/\]/g) || []).length;

            if (openBraces > closeBraces) {
                suggestions.push({
                    issue: `Missing ${openBraces - closeBraces} closing brace(s)`,
                    fix: 'Add } at the end',
                    severity: 'critical'
                });
            }

            if (openBrackets > closeBrackets) {
                suggestions.push({
                    issue: `Missing ${openBrackets - closeBrackets} closing bracket(s)`,
                    fix: 'Add ] at the end',
                    severity: 'critical'
                });
            }
        }

        // Check for unescaped quotes
        if (/"[^"]*"[^,:}\]]*"/.test(text)) {
            suggestions.push({
                issue: 'Unescaped quotes in string',
                fix: 'Escape internal quotes with backslash: \\"',
                severity: 'medium'
            });
        }

        // Check for comments (not allowed in JSON)
        if (/\/\/|\/\*/.test(text)) {
            suggestions.push({
                issue: 'Comments found in JSON',
                fix: 'Remove all comments (// or /* */)',
                severity: 'high'
            });
        }
    }

    return { errors, suggestions };
}

// Parse XML errors
function parseXMLErrors(text) {
    const errors = [];
    const suggestions = [];

    // Check for unclosed tags
    const tagPattern = /<(\w+)[^>]*>/g;
    const closePattern = /<\/(\w+)>/g;

    const openTags = [];
    const closeTags = [];

    let match;
    while ((match = tagPattern.exec(text)) !== null) {
        // Skip self-closing tags
        if (!match[0].endsWith('/>')) {
            openTags.push({ name: match[1], position: match.index });
        }
    }

    while ((match = closePattern.exec(text)) !== null) {
        closeTags.push({ name: match[1], position: match.index });
    }

    // Find unclosed tags
    const tagStack = [];
    let textPos = 0;

    openTags.forEach(tag => {
        tagStack.push(tag);
    });

    closeTags.forEach(closeTag => {
        const lastOpen = tagStack[tagStack.length - 1];

        if (!lastOpen) {
            errors.push({
                line: getLineNumber(text, closeTag.position),
                column: 0,
                message: `Unexpected closing tag </${closeTag.name}>`,
                type: 'XMLError'
            });
        } else if (lastOpen.name !== closeTag.name) {
            errors.push({
                line: getLineNumber(text, closeTag.position),
                column: 0,
                message: `Mismatched tag: expected </${lastOpen.name}>, found </${closeTag.name}>`,
                type: 'XMLError'
            });

            suggestions.push({
                issue: `Tag mismatch: <${lastOpen.name}> closed with </${closeTag.name}>`,
                fix: `Change </${closeTag.name}> to </${lastOpen.name}>`,
                severity: 'high'
            });
        } else {
            tagStack.pop();
        }
    });

    // Report unclosed tags
    tagStack.forEach(tag => {
        errors.push({
            line: getLineNumber(text, tag.position),
            column: 0,
            message: `Unclosed tag <${tag.name}>`,
            type: 'XMLError'
        });

        suggestions.push({
            issue: `Tag <${tag.name}> is not closed`,
            fix: `Add </${tag.name}> before the end of the document`,
            severity: 'critical'
        });
    });

    return { errors, suggestions };
}

// Parse SQL errors
function parseSQLErrors(text) {
    const errors = [];
    const suggestions = [];

    // Check for common SQL mistakes
    const lines = text.split('\n');

    lines.forEach((line, index) => {
        const trimmed = line.trim().toUpperCase();

        // Missing semicolon at end of statement
        if (trimmed.match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/) &&
            !trimmed.endsWith(';') &&
            index < lines.length - 1) {
            suggestions.push({
                issue: `Missing semicolon at line ${index + 1}`,
                fix: 'Add ; at the end of the statement',
                severity: 'medium'
            });
        }

        // Missing FROM in SELECT
        if (trimmed.startsWith('SELECT') && !trimmed.includes('FROM')) {
            errors.push({
                line: index + 1,
                column: 0,
                message: 'SELECT statement missing FROM clause',
                type: 'SQLError'
            });

            suggestions.push({
                issue: 'Incomplete SELECT statement',
                fix: 'Add FROM table_name',
                severity: 'high'
            });
        }

        // Missing VALUES in INSERT
        if (trimmed.startsWith('INSERT') && !trimmed.includes('VALUES')) {
            errors.push({
                line: index + 1,
                column: 0,
                message: 'INSERT statement missing VALUES clause',
                type: 'SQLError'
            });

            suggestions.push({
                issue: 'Incomplete INSERT statement',
                fix: 'Add VALUES (...)',
                severity: 'high'
            });
        }
    });

    return { errors, suggestions };
}

// Helper function to get line number from position
function getLineNumber(text, position) {
    return text.substring(0, position).split('\n').length;
}

// Format error display
function formatErrorDisplay(errors, suggestions) {
    let display = '';

    if (errors.length > 0) {
        display += '<div class="error-title">Errors Found:</div>';
        errors.forEach(error => {
            display += `<div class="error-message">`;
            display += `Line ${error.line}, Column ${error.column}: ${error.message}`;
            display += `</div>`;
        });
    }

    if (suggestions.length > 0) {
        suggestions.forEach(suggestion => {
            const icon = suggestion.severity === 'critical' ? '🔴' :
                suggestion.severity === 'high' ? '🟡' : '🔵';

            display += `<div class="error-suggestion">`;
            display += `${icon} <strong>${suggestion.issue}</strong><br>`;
            display += `💡 ${suggestion.fix}`;
            display += `</div>`;
        });
    }

    return display;
}
