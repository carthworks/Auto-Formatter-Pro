// Diff View Utility
// Shows differences between original and formatted code

function computeDiff(original, formatted) {
    const originalLines = original.split('\n');
    const formattedLines = formatted.split('\n');

    const diff = [];
    const maxLen = Math.max(originalLines.length, formattedLines.length);

    for (let i = 0; i < maxLen; i++) {
        const origLine = originalLines[i] || '';
        const formLine = formattedLines[i] || '';

        if (origLine === formLine) {
            diff.push({
                type: 'unchanged',
                original: origLine,
                formatted: formLine,
                lineNum: i + 1
            });
        } else if (!origLine && formLine) {
            diff.push({
                type: 'added',
                original: '',
                formatted: formLine,
                lineNum: i + 1
            });
        } else if (origLine && !formLine) {
            diff.push({
                type: 'removed',
                original: origLine,
                formatted: '',
                lineNum: i + 1
            });
        } else {
            diff.push({
                type: 'modified',
                original: origLine,
                formatted: formLine,
                lineNum: i + 1
            });
        }
    }

    return diff;
}

function generateDiffHTML(diff) {
    let originalHTML = '';
    let formattedHTML = '';

    diff.forEach(item => {
        const lineClass = `diff-line diff-${item.type}`;

        // Original side
        if (item.type === 'added') {
            originalHTML += `<div class="diff-line diff-empty"></div>`;
        } else {
            originalHTML += `<div class="${lineClass}">`;
            originalHTML += `<span class="diff-line-number">${item.lineNum}</span>`;
            originalHTML += `<span class="diff-content">${escapeHtml(item.original)}</span>`;
            originalHTML += `</div>`;
        }

        // Formatted side
        if (item.type === 'removed') {
            formattedHTML += `<div class="diff-line diff-empty"></div>`;
        } else {
            formattedHTML += `<div class="${lineClass}">`;
            formattedHTML += `<span class="diff-line-number">${item.lineNum}</span>`;
            formattedHTML += `<span class="diff-content">${escapeHtml(item.formatted)}</span>`;
            formattedHTML += `</div>`;
        }
    });

    return { originalHTML, formattedHTML };
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getDiffStats(diff) {
    const stats = {
        added: 0,
        removed: 0,
        modified: 0,
        unchanged: 0
    };

    diff.forEach(item => {
        stats[item.type]++;
    });

    return stats;
}
