// Auto Formatter Pro - Popup JavaScript
// Main controller for popup UI and interactions

// State management
let currentHistory = [];
let currentHistoryIndex = -1;
let currentSettings = {};
let isResizing = false;

// DOM Elements
const inputEditor = document.getElementById('inputEditor');
const outputEditor = document.getElementById('outputEditor');
const detectedFormat = document.getElementById('detectedFormat');
const errorDisplay = document.getElementById('errorDisplay');
const editorContainer = document.getElementById('editorContainer');

// Buttons
const beautifyBtn = document.getElementById('beautifyBtn');
const minifyBtn = document.getElementById('minifyBtn');
const clearInput = document.getElementById('clearInput');
const copyOutput = document.getElementById('copyOutput');
const viewToggle = document.getElementById('viewToggle');
const settingsBtn = document.getElementById('settingsBtn');
const helpBtn = document.getElementById('helpBtn');
const codeThemeSelect = document.getElementById('codeTheme');

// History
const historyPrev = document.getElementById('historyPrev');
const historyNext = document.getElementById('historyNext');
const historyBtn = document.getElementById('historyBtn');
const historyMenu = document.getElementById('historyMenu');
const historyList = document.getElementById('historyList');

// Dropdowns
const convertBtn = document.getElementById('convertBtn');
const convertMenu = document.getElementById('convertMenu');
const exportBtn = document.getElementById('exportBtn');
const exportMenu = document.getElementById('exportMenu');
const shareBtn = document.getElementById('shareBtn');
const shareMenu = document.getElementById('shareMenu');

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    await loadHistory();
    await checkForSelectedText();
    setupEventListeners();
    setupResizeHandle();
    applyTheme();
});

// Load settings from storage
async function loadSettings() {
    const result = await chrome.storage.local.get(['settings']);
    currentSettings = result.settings || {
        theme: 'light',
        indentation: 2,
        contextMenuEnabled: true,
        githubToken: '',
        defaultView: 'dual'
    };
}

// Load history from storage
async function loadHistory() {
    const result = await chrome.storage.local.get(['history']);
    currentHistory = result.history || [];
    updateHistoryUI();
}

// Check for selected text from context menu
async function checkForSelectedText() {
    const result = await chrome.storage.local.get(['selectedText', 'autoFormat']);

    if (result.selectedText && result.autoFormat) {
        inputEditor.value = result.selectedText;
        await beautify();

        // Clear the flags
        await chrome.storage.local.remove(['selectedText', 'autoFormat']);
    }
}

// Apply theme
function applyTheme() {
    document.body.setAttribute('data-theme', currentSettings.theme);
}

// Setup event listeners
function setupEventListeners() {
    // Main actions
    beautifyBtn.addEventListener('click', beautify);
    minifyBtn.addEventListener('click', minify);
    clearInput.addEventListener('click', () => {
        inputEditor.value = '';
        outputEditor.textContent = '';
        errorDisplay.classList.add('hidden');
        detectedFormat.textContent = 'Unknown';
    });
    copyOutput.addEventListener('click', copyToClipboard);

    // View toggle
    viewToggle.addEventListener('click', toggleView);

    // Settings
    settingsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    // History navigation
    historyPrev.addEventListener('click', navigateHistory.bind(null, -1));
    historyNext.addEventListener('click', navigateHistory.bind(null, 1));

    // Dropdowns
    setupDropdown(convertBtn, convertMenu);
    setupDropdown(exportBtn, exportMenu);
    setupDropdown(shareBtn, shareMenu);
    setupDropdown(historyBtn, historyMenu);

    // Convert actions
    document.querySelectorAll('[data-convert]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.dataset.convert;
            convert(type);
            convertMenu.classList.remove('show');
        });
    });

    // Export actions
    document.querySelectorAll('[data-export]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const format = e.target.dataset.export;
            exportFile(format);
            exportMenu.classList.remove('show');
        });
    });

    // Share actions
    document.querySelectorAll('[data-share]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const platform = e.target.dataset.share;
            share(platform);
            shareMenu.classList.remove('show');
        });
    });

    // Input change detection
    inputEditor.addEventListener('input', () => {
        const format = detectFormat(inputEditor.value);
        updateFormatBadge(format);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Setup dropdown toggle
function setupDropdown(button, menu) {
    button.addEventListener('click', (e) => {
        e.stopPropagation();

        // Close other dropdowns
        document.querySelectorAll('.dropdown-menu').forEach(m => {
            if (m !== menu) m.classList.remove('show');
        });

        menu.classList.toggle('show');
    });

    // Close on outside click
    document.addEventListener('click', () => {
        menu.classList.remove('show');
    });

    menu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Beautify function
async function beautify() {
    const input = inputEditor.value.trim();

    if (!input) {
        showError('Please enter some text to format');
        return;
    }

    const format = detectFormat(input);
    updateFormatBadge(format);

    try {
        const result = formatCode(input, format, currentSettings.indentation);

        if (result.error) {
            showError(result.error, result.suggestion);
            setOutputText(input); // Show original on error
        } else {
            setOutputWithHighlighting(result.formatted, format);
            errorDisplay.classList.add('hidden');

            // Add to history
            await addToHistory({
                format: format,
                input: input,
                output: result.formatted,
                timestamp: Date.now()
            });
        }
    } catch (error) {
        showError(`Formatting error: ${error.message}`);
    }
}

// Minify function
function minify() {
    const input = inputEditor.value.trim();

    if (!input) {
        showError('Please enter some text to minify');
        return;
    }

    const format = detectFormat(input);

    try {
        const result = minifyCode(input, format);

        if (result.error) {
            showError(result.error);
        } else {
            setOutputWithHighlighting(result.minified, format);
            errorDisplay.classList.add('hidden');
        }
    } catch (error) {
        showError(`Minify error: ${error.message}`);
    }
}

// Convert function
function convert(type) {
    const input = inputEditor.value.trim();

    if (!input) {
        showError('Please enter some text to convert');
        return;
    }

    try {
        const result = convertFormat(input, type);

        if (result.error) {
            showError(result.error);
        } else {
            setOutputWithHighlighting(result.converted, result.targetFormat);
            updateFormatBadge(result.targetFormat);
            errorDisplay.classList.add('hidden');
        }
    } catch (error) {
        showError(`Conversion error: ${error.message}`);
    }
}

// Export file
function exportFile(format) {
    const content = getOutputText() || inputEditor.value;

    if (!content) {
        showError('No content to export');
        return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const filename = `formatted-${Date.now()}.${format}`;

    chrome.runtime.sendMessage({
        action: 'downloadFile',
        url: url,
        filename: filename
    }, (response) => {
        if (response.success) {
            console.log('File exported successfully');
        }
    });
}

// Share function
async function share(platform) {
    const content = getOutputText() || inputEditor.value;

    if (!content) {
        showError('No content to share');
        return;
    }

    const format = detectedFormat.textContent;

    switch (platform) {
        case 'slack':
            // Open Slack with prefilled message
            const slackUrl = `https://slack.com/intl/en-in/help/articles/202009646-Share-messages-in-Slack`;
            window.open(slackUrl, '_blank');
            // Copy content to clipboard for easy pasting
            await navigator.clipboard.writeText(content);
            break;

        case 'gmail':
            const subject = encodeURIComponent(`Formatted ${format} Code`);
            const body = encodeURIComponent(content);
            const gmailUrl = `mailto:?subject=${subject}&body=${body}`;
            window.open(gmailUrl, '_blank');
            break;

        case 'gist':
            if (!currentSettings.githubToken) {
                showError('Please configure GitHub token in settings');
                return;
            }

            chrome.runtime.sendMessage({
                action: 'createGist',
                data: {
                    description: `Formatted ${format} code`,
                    filename: `code.${format.toLowerCase()}`,
                    content: content
                }
            }, (response) => {
                if (response.success) {
                    window.open(response.data.html_url, '_blank');
                } else {
                    showError(`Failed to create Gist: ${response.error}`);
                }
            });
            break;
    }
}

// Copy to clipboard
async function copyToClipboard() {
    const content = getOutputText();

    if (!content) {
        showError('No output to copy');
        return;
    }

    try {
        await navigator.clipboard.writeText(content);

        // Visual feedback
        const originalText = copyOutput.textContent;
        copyOutput.textContent = 'Copied!';
        setTimeout(() => {
            copyOutput.textContent = originalText;
        }, 1500);
    } catch (error) {
        showError('Failed to copy to clipboard');
    }
}

// Toggle view mode
function toggleView() {
    if (editorContainer.classList.contains('dual-view')) {
        editorContainer.classList.remove('dual-view');
        editorContainer.classList.add('single-view');
    } else {
        editorContainer.classList.remove('single-view');
        editorContainer.classList.add('dual-view');
    }
}

// Add to history
async function addToHistory(item) {
    currentHistory.unshift(item);

    // Keep only last 5 items
    if (currentHistory.length > 5) {
        currentHistory = currentHistory.slice(0, 5);
    }

    currentHistoryIndex = 0;

    await chrome.storage.local.set({ history: currentHistory });
    updateHistoryUI();
}

// Navigate history
function navigateHistory(direction) {
    const newIndex = currentHistoryIndex + direction;

    if (newIndex >= 0 && newIndex < currentHistory.length) {
        currentHistoryIndex = newIndex;
        const item = currentHistory[currentHistoryIndex];

        inputEditor.value = item.input;
        setOutputWithHighlighting(item.output, item.format);
        updateFormatBadge(item.format);

        updateHistoryButtons();
    }
}

// Update history UI
function updateHistoryUI() {
    updateHistoryButtons();
    updateHistoryList();
}

// Update history buttons
function updateHistoryButtons() {
    historyPrev.disabled = currentHistoryIndex >= currentHistory.length - 1;
    historyNext.disabled = currentHistoryIndex <= 0;
}

// Update history list
function updateHistoryList() {
    if (currentHistory.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No history yet</div>';
        return;
    }

    historyList.innerHTML = currentHistory.map((item, index) => {
        const preview = item.output.substring(0, 50).replace(/\n/g, ' ');
        const time = new Date(item.timestamp).toLocaleTimeString();

        return `
      <div class="history-item" data-index="${index}">
        <div class="history-item-format">${item.format}</div>
        <div class="history-item-preview">${preview}...</div>
        <div class="history-item-time">${time}</div>
      </div>
    `;
    }).join('');

    // Add click handlers
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            currentHistoryIndex = index;
            const historyItem = currentHistory[index];

            inputEditor.value = historyItem.input;
            setOutputWithHighlighting(historyItem.output, historyItem.format);
            updateFormatBadge(historyItem.format);

            historyMenu.classList.remove('show');
            updateHistoryButtons();
        });
    });
}

// Update format badge
function updateFormatBadge(format) {
    detectedFormat.textContent = format;

    // Color coding
    const colors = {
        'JSON': '#6366f1',
        'XML': '#8b5cf6',
        'SQL': '#ec4899',
        'CSV': '#10b981',
        'YAML': '#f59e0b',
        'HTML': '#ef4444',
        'Markdown': '#06b6d4',
        'JavaScript': '#eab308',
        'CSS': '#3b82f6'
    };

    detectedFormat.style.background = colors[format] || '#64748b';
}

// Show error
function showError(message, suggestion = null) {
    errorDisplay.classList.remove('hidden');

    let html = `<div class="error-title">Error</div>`;
    html += `<div class="error-message">${message}</div>`;

    if (suggestion) {
        html += `<div class="error-suggestion">💡 Suggestion: ${suggestion}</div>`;
    }

    errorDisplay.innerHTML = html;
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        beautify();
    } else if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        minify();
    } else if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        copyToClipboard();
    }
}

// Setup resize handle
function setupResizeHandle() {
    const resizeHandle = document.querySelector('.resize-handle');
    const inputPanel = document.querySelector('.input-panel');

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const containerRect = editorContainer.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;
        const percentage = (newWidth / containerRect.width) * 100;

        if (percentage > 20 && percentage < 80) {
            inputPanel.style.flex = `0 0 ${percentage}%`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

// Apply code theme
async function applyCodeTheme() {
  const result = await chrome.storage.local.get(['codeTheme']);
  const theme = result.codeTheme || 'default';
  
  codeThemeSelect.value = theme;
  
  // Apply theme to editors
  if (theme === 'default') {
    inputEditor.removeAttribute('data-theme');
    outputEditor.removeAttribute('data-theme');
  } else {
    inputEditor.setAttribute('data-theme', theme);
    outputEditor.setAttribute('data-theme', theme);
  }
}

// Setup help modal
document.addEventListener('DOMContentLoaded', () => {
  const helpModal = document.getElementById('helpModal');
  const closeHelp = document.getElementById('closeHelp');
  const closeHelpBtn = document.getElementById('closeHelpBtn');
  const modalOverlay = document.querySelector('.modal-overlay');
  
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      helpModal.classList.remove('hidden');
    });
  }
  
  if (closeHelp) {
    closeHelp.addEventListener('click', () => {
      helpModal.classList.add('hidden');
    });
  }
  
  if (closeHelpBtn) {
    closeHelpBtn.addEventListener('click', () => {
      helpModal.classList.add('hidden');
    });
  }
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', () => {
      helpModal.classList.add('hidden');
    });
  }
  
  // Code theme selector
  if (codeThemeSelect) {
    codeThemeSelect.addEventListener('change', async () => {
      const theme = codeThemeSelect.value;
      await chrome.storage.local.set({ codeTheme: theme });
      applyCodeTheme();
    });
  }
  
  // Load and apply code theme on startup
  applyCodeTheme();
});


// Helper functions for syntax highlighting
function setOutputWithHighlighting(text, format) {
  const outputEditor = document.getElementById('outputEditor');
  
  // Remove placeholder
  const placeholder = outputEditor.querySelector('.placeholder');
  if (placeholder) {
    placeholder.remove();
  }
  
  // Apply syntax highlighting
  if (typeof highlightCode === 'function') {
    const highlighted = highlightCode(text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), format);
    outputEditor.innerHTML = highlighted;
    outputEditor.classList.add('syntax-highlighted');
  } else {
    outputEditor.textContent = text;
  }
}

function setOutputText(text) {
  const outputEditor = document.getElementById('outputEditor');
  outputEditor.textContent = text;
  outputEditor.classList.remove('syntax-highlighted');
}

function getOutputText() {
  const outputEditor = document.getElementById('outputEditor');
  return outputEditor.textContent || outputEditor.innerText || '';
}
