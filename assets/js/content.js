let filters = {
  hideWords: false,
  blockWords: [],
  hideURL: false,
  blockURL: [],
  hideUsername: false,
  blockUsername: [],
};

function matchWord(words, pattern) {
  try {
    // Normalize word and pattern
    const normalizedWord = words.toLowerCase().trim();
    const normalizedPattern = pattern.toLowerCase().trim().replace(/\*+/g, '*');
    
    const wordMatch = normalizedWord.split(/[\s\n\r\t]+/).filter(word => word.length > 0);
    
    // Log for debugging
    console.log('CleansingX: Matching word pattern:', normalizedPattern);
    console.log('CleansingX: Found words:', wordMatch.length);
    console.log('CleansingX: First 5 words:', wordMatch.slice(0, 5));

    // Handle different wildcard patterns
    if (normalizedPattern.startsWith('*') && normalizedPattern.endsWith('*')) {
      const core = normalizedPattern.slice(1, -1);
      return wordMatch.some(word => word.includes(core));
    }
    if (normalizedPattern.startsWith('*')) {
      const core = normalizedPattern.slice(1);
      return wordMatch.some(word => word.endsWith(core));
    } 
    if (normalizedPattern.endsWith('*')) {
      const core = normalizedPattern.slice(0, -1);
      return wordMatch.some(word => word.startsWith(core));
    }
    return wordMatch.some(word => word === normalizedPattern);
  
  } catch (error) {
    console.error('CleansingX: Error in matchWord:', error);
    return false;
  }
}

function matchURL(urls, pattern) {
  try {
    // Normalize url and pattern
    const normalizedUrl = urls;
    const normalizedPattern = pattern.toLowerCase().trim().replace(/\*+/g, '*');

    // Log for debugging
    console.log('CleansingX: Matching url pattern:', normalizedPattern);
    console.log('CleansingX: First 5 url:', normalizedUrl.slice(0, 5));

    // Filter url to keep only http/https url
    const urlOnly = urls.filter(url => url.startsWith('http://') || url.startsWith('https://'));

    if (urlOnly.length === 0) {
      return false;
    }
    // Clean url by removing protocols and www
    const urlMatch = urlOnly.map(url => 
      url.replace(/^https?:\/\/(www\.)?/i, '')
    );

    console.log('CleansingX: Cleaned URLs:', urlMatch);

    // Handle different wildcard patterns
    if (normalizedPattern.startsWith('*') && normalizedPattern.endsWith('*')) {
      const core = normalizedPattern.slice(1, -1);
      return urlMatch.some(user => user.includes(core));
    }
    if (normalizedPattern.startsWith('*')) {
      const core = normalizedPattern.slice(1);
      return urlMatch.some(user => user.endsWith(core));
    }
    if (normalizedPattern.endsWith('*')) {
      const core = normalizedPattern.slice(0, -1);
      return urlMatch.some(user => user.startsWith(core));
    }
    return urlMatch.some(user => user === normalizedPattern);

  } catch (error) {
    console.error('CleansingX: Error in matchUsername:', error);
    return false;
  }
}

function matchUsername(usernames, pattern) {
  try {
    // Normalize usernames and pattern
    const normalizedUsername = usernames
    const normalizedPattern = pattern.toLowerCase().trim()

    // Log for debugging
    console.log('CleansingX: Matching username pattern:', normalizedPattern);
    console.log('CleansingX: Found usernames:', normalizedUsername.length);
    console.log('CleansingX: First 5 username:', normalizedUsername.slice(0, 5));

    // Handle username and url matching
    const usernameMatch = normalizedUsername.some(username => username === normalizedPattern);
    
    if (!usernameMatch) {
      return false;
    }
 
    // Convert @username to https://x.com/username
    const normalizedPatternUrl = normalizedPattern.replace('@', 'https://x.com/');
     
    // Log for debugging
    console.log('CleansingX: Generated pattern URL:', normalizedPatternUrl);
     
    // Check if url exists in usernames array
    const urlMatch = normalizedUsername.some(username => username === normalizedPatternUrl);
    return urlMatch;
    
  } catch (error) {
    console.error('CleansingX: Error in matchUsername:', error);
    return false;
  }
}

// Filter articles based on blockWords, blockURL, and blockUsername
function filterArticles() {
  try {
    const articles = document.getElementsByTagName('article');
    console.log('CleansingX: Found articles:', articles.length);

    for (const article of articles) {
      if (!article?.textContent) continue;
      
      let shouldHide = false;

      // Word check
      if (!shouldHide && filters.hideWords && filters.blockWords.length > 0) {
        const words = Array.from(article.getElementsByTagName('span'))
          .map(el => el.textContent)
          .join(' ');
          
          shouldHide = shouldHide || filters.blockWords.some(word => matchWord(words, word));
      }

      // Username check
      if (filters.hideURL && filters.blockURL.length > 0) {
        const urls = Array.from(article.getElementsByTagName('a'))
          .map(el => (el.textContent || el.href).toLowerCase().trim())
          .filter(text => text.length > 0);
        
          shouldHide = shouldHide || filters.blockURL.some(user => matchURL(urls, user));
      }

      // Username check
      if (filters.hideUsername && filters.blockUsername.length > 0) {
        const usernames = Array.from(article.getElementsByTagName('a'))
          .map(el => (el.textContent || el.href).toLowerCase().trim())
          .filter(text => text.length > 0);
        
          shouldHide = shouldHide || filters.blockUsername.some(user => matchUsername(usernames, user));
      }
      
      article.style.display = shouldHide ? 'none' : '';
    }
  } catch (error) {
    console.error('CleansingX: Error in filterArticles:', error);
  }
}

// Update filters based on message
function updateFilters(message) {
  try {
    const filterUpdates = {
      hideWords: [message.hideWords, 'hideWords'],
      blockWords: [message.blockWords, 'blockWords'],
      hideURL: [message.hideURL, 'hideURL'],
      blockURL: [message.blockURL, 'blockURL'],
      hideUsername: [message.hideUsername, 'hideUsername'],
      blockUsername: [message.blockUsername, 'blockUsername']
    };

    Object.entries(filterUpdates).forEach(([key, [value, logKey]]) => {
      if (message.hasOwnProperty(key)) {
        filters[key] = Array.isArray(value) ? value || [] : value;
        console.log(`CleansingX: ${logKey} set to:`, filters[key]);
      }
    });

    debouncedFilterArticles();
  } catch (error) {
    console.error('CleansingX: Error in updateFilters:', error);
  }
}

function initializeFilters() {
  try {
    browser.storage.local.get(['hideWords', 'blockWords', 'hideURL', 'blockURL', 'hideUsername', 'blockUsername'])
      .then((result) => {
        console.log('CleansingX: Storage result:', result);
        filters.hideWords = result.hideWords || false;
        filters.blockWords = result.savedBlockWords || [];
        filters.hideURL = result.hideURL || false; 
        filters.blockURL = result.blockURL || [];
        filters.hideUsername = result.hideUsername || false;
        filters.blockUsername = result.blockUsername || [];
        console.log('CleansingX: Initial state:', filters);

        if (filters.hideWords) {
          debouncedFilterArticles();
        }
      });
  } catch (error) {
    console.error('CleansingX: Error in initializeFilters:', error);
  }
}

// Add debouncing utility
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// DOM Observer
function startObserver() {
  try {
    const targetNode = document.body;
    const config = { 
      childList: true, 
      subtree: true 
    };
    observer.observe(targetNode, config);
  } catch (error) {
    console.error('CleansingX: Error starting observer:', error);
  }
}

// Create debounced version of filterArticles
const debouncedFilterArticles = debounce(filterArticles, 100);

// Update observer to use debounced function
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      debouncedFilterArticles();
    }
  });
});

// Start observing as early as possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startObserver);
} else {
  startObserver();
}

// Listen for messages from background script
browser.runtime.onMessage.addListener((message) => {
  console.log('CleansingX: Received message:', message);
  updateFilters(message);
});

// Call initialization
initializeFilters();