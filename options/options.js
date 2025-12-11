// Auto Formatter Pro - Options Page JavaScript
// Settings management and persistence

// DOM Elements
const themeSelect = document.getElementById('themeSelect');
const indentationSelect = document.getElementById('indentationSelect');
const defaultViewSelect = document.getElementById('defaultViewSelect');
const contextMenuToggle = document.getElementById('contextMenuToggle');
const githubToken = document.getElementById('githubToken');
const toggleToken = document.getElementById('toggleToken');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const statusMessage = document.getElementById('statusMessage');

// Default settings
const defaultSettings = {
    theme: 'light',
    indentation: 2,
    defaultView: 'dual',
    contextMenuEnabled: true,
    githubToken: ''
};

// Load settings on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    setupEventListeners();
    applyTheme();
});

// Load settings from storage
async function loadSettings() {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || defaultSettings;

    // Apply settings to UI
    themeSelect.value = settings.theme || 'light';
    indentationSelect.value = settings.indentation || 2;
    defaultViewSelect.value = settings.defaultView || 'dual';
    contextMenuToggle.checked = settings.contextMenuEnabled !== false;
    githubToken.value = settings.githubToken || '';
}

// Setup event listeners
function setupEventListeners() {
    // Theme change
    themeSelect.addEventListener('change', () => {
        applyTheme();
    });

    // Save button
    saveBtn.addEventListener('click', saveSettings);

    // Reset button
    resetBtn.addEventListener('click', resetSettings);

    // Toggle token visibility
    toggleToken.addEventListener('click', () => {
        if (githubToken.type === 'password') {
            githubToken.type = 'text';
            toggleToken.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke-width="2"/>
          <line x1="1" y1="1" x2="23" y2="23" stroke-width="2"/>
        </svg>
      `;
        } else {
            githubToken.type = 'password';
            toggleToken.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
          <circle cx="12" cy="12" r="3" stroke-width="2"/>
        </svg>
      `;
        }
    });

    // Auto-save on change (optional)
    const autoSaveElements = [themeSelect, indentationSelect, defaultViewSelect, contextMenuToggle];
    autoSaveElements.forEach(element => {
        element.addEventListener('change', () => {
            // Show unsaved indicator
            saveBtn.style.background = '#f59e0b';
            saveBtn.textContent = '💾 Save Changes';
        });
    });
}

// Apply theme
function applyTheme() {
    const theme = themeSelect.value;
    document.body.setAttribute('data-theme', theme);
}

// Save settings
async function saveSettings() {
    const settings = {
        theme: themeSelect.value,
        indentation: parseInt(indentationSelect.value) || indentationSelect.value,
        defaultView: defaultViewSelect.value,
        contextMenuEnabled: contextMenuToggle.checked,
        githubToken: githubToken.value.trim(),
        initialized: true
    };

    try {
        await chrome.storage.local.set({ settings });

        // Show success message
        showStatus('Settings saved successfully! ✓', 'success');

        // Reset save button
        saveBtn.style.background = '';
        saveBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-width="2"/>
        <polyline points="17 21 17 13 7 13 7 21" stroke-width="2"/>
        <polyline points="7 3 7 8 15 8" stroke-width="2"/>
      </svg>
      Save Settings
    `;

        // Notify background script to update context menu
        chrome.runtime.sendMessage({ action: 'settingsUpdated', settings });

    } catch (error) {
        showStatus('Failed to save settings: ' + error.message, 'error');
    }
}

// Reset settings
async function resetSettings() {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) {
        return;
    }

    try {
        await chrome.storage.local.set({ settings: defaultSettings });
        await loadSettings();
        applyTheme();

        showStatus('Settings reset to defaults ✓', 'success');

    } catch (error) {
        showStatus('Failed to reset settings: ' + error.message, 'error');
    }
}

// Show status message
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;

    // Auto-hide after 3 seconds
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 3000);
}

// Calculate extension size (approximate)
async function calculateExtensionSize() {
    try {
        const sizeElement = document.getElementById('extensionSize');

        // Get storage usage
        const bytesInUse = await chrome.storage.local.getBytesInUse();

        // Approximate extension size (manifest + files)
        const approxSize = bytesInUse + (500 * 1024); // ~500KB for extension files

        const sizeInKB = (approxSize / 1024).toFixed(2);
        const sizeInMB = (approxSize / (1024 * 1024)).toFixed(2);

        if (approxSize < 1024 * 1024) {
            sizeElement.textContent = `${sizeInKB} KB`;
        } else {
            sizeElement.textContent = `${sizeInMB} MB`;
        }
    } catch (error) {
        console.error('Failed to calculate size:', error);
    }
}

// Calculate size on load
calculateExtensionSize();
