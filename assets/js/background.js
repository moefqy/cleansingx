// BrowserAPI compatibility check for browser.*/chrome.*
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Single initialization listener
browserAPI.runtime.onInstalled.addListener(() => {
  // Initialize default settings
  browserAPI.storage.local.get([
    'hideWords', 'blockWords',
    'hideURL', 'blockURL',
    'hideUsername', 'blockUsernames'
  ])
  .then((result) => {
    if (!result.hideWords && !result.blockWords) {
      browserAPI.storage.local.set({
        hideWords: result.hideWords || false,
        blockWords: result.blockWords || [],
        hideURL: result.hideURL || false,
        blockURL: result.blockURL || [],
        hideUsername: result.hideUsername || false,
        blockUsernames: result.blockUsernames || [],
      });
    }
  });
  console.log('CleansingX: Extension initialized');
});

// Listen for tab updates
browserAPI.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('CleansingX: Tab updated:', tab.url);
    
    // Get stored filters
    browserAPI.storage.local.get([
      'hideWords', 
      'blockWords',
      'hideURL',
      'blockURL',
      'hideUsername',
      'blockUsernames'
    ])
    .then((result) => {
      // Send message to content script
      return browserAPI.tabs.sendMessage(tabId, {
        hideWords: result.hideWords || false,
        blockWords: result.blockWords || [],
        hideURL: result.hideURL || false,
        blockURL: result.blockURL || [],
        hideUsername: result.hideUsername || false,
        blockUsernames: result.blockUsernames || [],
        type: 'filterUpdate'
      });
    })
    .catch((error) => {
      console.error('CleansingX: Error in background script:', error);
    });
}
});

// Listen for filter updates from popup
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Broadcast to all tabs
  browserAPI.tabs.query({})
    .then(tabs => {
      tabs.forEach(tab => {
        browserAPI.tabs.sendMessage(tab.id, {
          hideWords: message.hideWords,
          blockWords: message.blockWords,
          hideURL: message.hideURL,
          blockURL: message.blockURL,
          hideUsername: message.hideUsername,
          blockUsernames: message.blockUsernames,
          type: 'filterUpdate'
        }).catch(() => {
          // Ignore errors for inactive tabs
        });
      });
    });
});

// Establish connection with content script
browserAPI.runtime.onConnect.addListener((port) => {
  console.log('CleansingX: Connection established with content script');
});