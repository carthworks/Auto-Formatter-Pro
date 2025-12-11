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
    case 'whatsapp':
      // Share via WhatsApp Web
      const whatsappText = encodeURIComponent('*Formatted ' + format + ' Code*\n\n```\n' + content + '\n```');
      const whatsappUrl = 'https://web.whatsapp.com/send?text=' + whatsappText;
      window.open(whatsappUrl, '_blank');
      break;

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

  if (codeThemeSelect) {
    codeThemeSelect.value = theme;
  }

  // Apply theme to editors
  const inputEd = document.getElementById('inputEditor');
  const outputEd = document.getElementById('outputEditor');

  if (theme === 'default') {
    if (inputEd) inputEd.removeAttribute('data-theme');
    if (outputEd) outputEd.removeAttribute('data-theme');
  } else {
    if (inputEd) inputEd.setAttribute('data-theme', theme);
    if (outputEd) outputEd.setAttribute('data-theme', theme);
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

// ===== NEW FEATURES =====

// Feature 1: Line Numbers
let currentFontSize = 13;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 24;

function updateLineNumbers(editor, lineNumbersElement) {
  const text = editor.value || editor.textContent || '';
  const lines = text.split('\n');
  const lineCount = lines.length;

  let lineNumbersHTML = '';
  for (let i = 1; i <= lineCount; i++) {
    lineNumbersHTML += i + '\n';
  }

  lineNumbersElement.textContent = lineNumbersHTML;

  // Sync scroll
  lineNumbersElement.scrollTop = editor.scrollTop;
}

function toggleLineNumbers(show) {
  const inputLineNumbers = document.getElementById('inputLineNumbers');
  const outputLineNumbers = document.getElementById('outputLineNumbers');

  if (show) {
    inputLineNumbers.classList.remove('hidden');
    outputLineNumbers.classList.remove('hidden');
    updateLineNumbers(inputEditor, inputLineNumbers);
    updateLineNumbers(document.getElementById('outputEditor'), outputLineNumbers);
  } else {
    inputLineNumbers.classList.add('hidden');
    outputLineNumbers.classList.add('hidden');
  }
}

// Feature 2: Font Size Control
function changeFontSize(delta) {
  currentFontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, currentFontSize + delta));

  inputEditor.style.fontSize = currentFontSize + 'px';
  document.getElementById('outputEditor').style.fontSize = currentFontSize + 'px';
  document.getElementById('fontSizeDisplay').textContent = currentFontSize + 'px';

  // Update line numbers font size too
  document.getElementById('inputLineNumbers').style.fontSize = currentFontSize + 'px';
  document.getElementById('outputLineNumbers').style.fontSize = currentFontSize + 'px';

  // Save preference
  chrome.storage.local.set({ fontSize: currentFontSize });
}

// Feature 3: Word Wrap Toggle
function toggleWordWrap(enabled) {
  if (enabled) {
    inputEditor.classList.add('word-wrap');
    document.getElementById('outputEditor').classList.add('word-wrap');
  } else {
    inputEditor.classList.remove('word-wrap');
    document.getElementById('outputEditor').classList.remove('word-wrap');
  }

  // Save preference
  chrome.storage.local.set({ wordWrap: enabled });
}

// Feature 4: Format on Paste
async function handlePaste(event) {
  const formatOnPasteEnabled = document.getElementById('formatOnPaste').checked;

  if (formatOnPasteEnabled) {
    event.preventDefault();

    const pastedText = (event.clipboardData || window.clipboardData).getData('text');

    // Insert pasted text
    const start = inputEditor.selectionStart;
    const end = inputEditor.selectionEnd;
    const currentValue = inputEditor.value;
    inputEditor.value = currentValue.substring(0, start) + pastedText + currentValue.substring(end);

    // Set cursor position
    inputEditor.selectionStart = inputEditor.selectionEnd = start + pastedText.length;

    // Auto-format after a short delay
    setTimeout(() => {
      beautify();
    }, 100);
  }
}

// Feature 5: Statistics Panel
function updateStatistics() {
  const text = document.getElementById('outputEditor').textContent || '';

  // Lines
  const lines = text.split('\n').length;
  document.getElementById('statLines').textContent = lines;

  // Characters
  const chars = text.length;
  document.getElementById('statChars').textContent = chars.toLocaleString();

  // Words
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById('statWords').textContent = words.toLocaleString();

  // Size
  const bytes = new Blob([text]).size;
  let sizeText;
  if (bytes < 1024) {
    sizeText = bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    sizeText = (bytes / 1024).toFixed(2) + ' KB';
  } else {
    sizeText = (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
  document.getElementById('statSize').textContent = sizeText;
}

// Initialize new features
document.addEventListener('DOMContentLoaded', () => {
  // Line Numbers Toggle
  const lineNumbersToggle = document.getElementById('lineNumbersToggle');
  if (lineNumbersToggle) {
    lineNumbersToggle.addEventListener('change', (e) => {
      toggleLineNumbers(e.target.checked);
    });

    // Initialize
    toggleLineNumbers(lineNumbersToggle.checked);
  }

  // Font Size Controls
  const fontSizeIncrease = document.getElementById('fontSizeIncrease');
  const fontSizeDecrease = document.getElementById('fontSizeDecrease');

  if (fontSizeIncrease) {
    fontSizeIncrease.addEventListener('click', () => changeFontSize(1));
  }

  if (fontSizeDecrease) {
    fontSizeDecrease.addEventListener('click', () => changeFontSize(-1));
  }

  // Load saved font size
  chrome.storage.local.get(['fontSize'], (result) => {
    if (result.fontSize) {
      currentFontSize = result.fontSize;
      changeFontSize(0); // Apply saved size
    }
  });

  // Word Wrap Toggle
  const wordWrapToggle = document.getElementById('wordWrapToggle');
  if (wordWrapToggle) {
    wordWrapToggle.addEventListener('change', (e) => {
      toggleWordWrap(e.target.checked);
    });

    // Load saved preference
    chrome.storage.local.get(['wordWrap'], (result) => {
      if (result.wordWrap !== undefined) {
        wordWrapToggle.checked = result.wordWrap;
        toggleWordWrap(result.wordWrap);
      }
    });
  }

  // Format on Paste
  if (inputEditor) {
    inputEditor.addEventListener('paste', handlePaste);
  }

  // Update line numbers on input
  if (inputEditor) {
    inputEditor.addEventListener('input', () => {
      updateLineNumbers(inputEditor, document.getElementById('inputLineNumbers'));
      updateStatistics();
    });

    inputEditor.addEventListener('scroll', () => {
      document.getElementById('inputLineNumbers').scrollTop = inputEditor.scrollTop;
    });
  }

  // Update statistics when output changes
  const outputEditor = document.getElementById('outputEditor');
  if (outputEditor) {
    const observer = new MutationObserver(() => {
      updateLineNumbers(outputEditor, document.getElementById('outputLineNumbers'));
      updateStatistics();
    });

    observer.observe(outputEditor, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  // Initial statistics
  updateStatistics();
});

// ===== DIFF VIEW FEATURE =====

let isDiffViewActive = false;
let currentDiffData = null;

function toggleDiffView() {
  isDiffViewActive = !isDiffViewActive;

  const editorContainer = document.getElementById('editorContainer');
  const diffContainer = document.getElementById('diffContainer');
  const diffToggleBtn = document.getElementById('diffViewToggle');

  if (isDiffViewActive) {
    // Show diff view
    editorContainer.classList.add('hidden');
    diffContainer.classList.remove('hidden');
    diffToggleBtn.classList.add('active');

    // Generate diff if we have data
    if (currentDiffData) {
      showDiff(currentDiffData.original, currentDiffData.formatted);
    }
  } else {
    // Show normal view
    editorContainer.classList.remove('hidden');
    diffContainer.classList.add('hidden');
    diffToggleBtn.classList.remove('active');
  }
}

function showDiff(original, formatted) {
  const diff = computeDiff(original, formatted);
  const { originalHTML, formattedHTML } = generateDiffHTML(diff);
  const stats = getDiffStats(diff);

  // Update diff panels
  document.getElementById('diffOriginal').innerHTML = originalHTML;
  document.getElementById('diffFormatted').innerHTML = formattedHTML;

  // Update stats
  document.getElementById('diffAdded').textContent = stats.added;
  document.getElementById('diffRemoved').textContent = stats.removed;
  document.getElementById('diffModified').textContent = stats.modified;

  // Store current diff data
  currentDiffData = { original, formatted };
}

// Initialize diff view
document.addEventListener('DOMContentLoaded', () => {
  const diffToggleBtn = document.getElementById('diffViewToggle');

  if (diffToggleBtn) {
    diffToggleBtn.addEventListener('click', toggleDiffView);
  }
});

// Update beautify to store diff data
const originalBeautifyFunc = beautify;
beautify = async function () {
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
      setOutputText(input);
    } else {
      setOutputWithHighlighting(result.formatted, format);
      errorDisplay.classList.add('hidden');

      // Store for diff view
      currentDiffData = {
        original: input,
        formatted: result.formatted
      };

      // Update diff if active
      if (isDiffViewActive) {
        showDiff(input, result.formatted);
      }

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
};

// ===== CLOSE BUTTON & PREVENT AUTO-CLOSE =====

// Close button handler
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('closeBtn');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.close();
    });
  }
});

// Prevent popup from closing when opening external links
// Store data in chrome.storage.local to persist across popup reopens
async function saveCurrentState() {
  const state = {
    inputValue: inputEditor.value,
    outputValue: getOutputText(),
    format: detectedFormat.textContent,
    timestamp: Date.now()
  };
  
  await chrome.storage.local.set({ popupState: state });
}

// Restore state when popup reopens
async function restoreState() {
  const result = await chrome.storage.local.get(['popupState']);
  
  if (result.popupState) {
    const state = result.popupState;
    
    // Only restore if less than 5 minutes old
    if (Date.now() - state.timestamp < 5 * 60 * 1000) {
      inputEditor.value = state.inputValue || '';
      
      if (state.outputValue) {
        const format = state.format || 'Unknown';
        setOutputWithHighlighting(state.outputValue, format);
        updateFormatBadge(format);
      }
      
      // Update line numbers and stats
      updateLineNumbers(inputEditor, document.getElementById('inputLineNumbers'));
      updateStatistics();
    }
  }
}

// Save state before export/share actions
const originalExportFile = exportFile;
exportFile = function(format) {
  saveCurrentState();
  originalExportFile(format);
};

const originalShare = share;
share = async function(platform) {
  await saveCurrentState();
  await originalShare(platform);
};

// Restore state on popup load
document.addEventListener('DOMContentLoaded', () => {
  restoreState();
});

// Auto-save state periodically
setInterval(() => {
  if (inputEditor.value || getOutputText()) {
    saveCurrentState();
  }
}, 10000); // Every 10 seconds
