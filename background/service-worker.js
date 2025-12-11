// Service Worker for Auto Formatter Pro
// Handles context menu, storage, and background tasks

// Initialize context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
  initializeDefaultSettings();
});

// Create context menu
async function createContextMenu() {
  const settings = await getSettings();
  
  if (settings.contextMenuEnabled) {
    chrome.contextMenus.create({
      id: 'format-selection',
      title: 'Format Selection with Auto Formatter Pro',
      contexts: ['selection']
    });
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'format-selection') {
    // Store selected text and open popup
    chrome.storage.local.set({
      selectedText: info.selectionText,
      autoFormat: true
    }, () => {
      chrome.action.openPopup();
    });
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  chrome.storage.local.set({ command: command });
});

// Initialize default settings
async function initializeDefaultSettings() {
  const settings = await getSettings();
  
  if (!settings.initialized) {
    await chrome.storage.local.set({
      settings: {
        initialized: true,
        theme: 'light',
        indentation: 2,
        contextMenuEnabled: true,
        githubToken: '',
        defaultView: 'dual'
      },
      history: []
    });
  }
}

// Helper function to get settings
async function getSettings() {
  const result = await chrome.storage.local.get(['settings']);
  return result.settings || {};
}

// Listen for settings changes to update context menu
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.settings) {
    const newSettings = changes.settings.newValue;
    
    // Update context menu based on settings
    if (newSettings.contextMenuEnabled) {
      createContextMenu();
    } else {
      chrome.contextMenus.removeAll();
    }
  }
});

// Handle messages from popup/options
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadFile') {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename,
      saveAs: true
    }, (downloadId) => {
      sendResponse({ success: true, downloadId });
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'createGist') {
    createGithubGist(request.data)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Create GitHub Gist
async function createGithubGist(data) {
  const settings = await getSettings();
  
  if (!settings.githubToken) {
    throw new Error('GitHub token not configured');
  }
  
  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Authorization': `token ${settings.githubToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: data.description || 'Formatted code from Auto Formatter Pro',
      public: true,
      files: {
        [data.filename]: {
          content: data.content
        }
      }
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create Gist');
  }
  
  return await response.json();
}
