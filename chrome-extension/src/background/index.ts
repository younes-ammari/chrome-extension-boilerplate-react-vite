import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

async function getLovableSessionId(): Promise<string> {
  const promise = await new Promise<string>((resolve, reject) => {
    if (!chrome.cookies) {
      reject(new Error('chrome.cookies API is not available'));
      return;
    }
    chrome.cookies.get({ url: 'https://lovable.dev', name: 'lovable-session-id.id' }, cookie => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      if (!cookie) {
        reject(new Error('lovable-session-id.id cookie not found'));
        return;
      }
      resolve(cookie.value);
    });
  });

  console.log('getLovableSessionId', promise);
  return promise;
}

// Example: respond to a message from your popup/content script
// Listen for requests from content scripts:
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_SESSION_ID') {
    console.log('get session id request received');
    getLovableSessionId()
      .then(token => sendResponse({ success: true, token }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // keep the message channel open for async response
  }
  return false; // handle unmatched message types
});

// Listen to display notifications

const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: 'Injecting content script error',
  message: 'You cannot inject script here!',
} as const;

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'NOTIFY') {
    const { title, message } = msg;
    const options = {
      ...notificationOptions,
      title: title || 'Notification',
      message: message || 'You have a new notification!',
    };
    chrome.notifications.create(
      '',
      {
        ...options,
      },
      notificationId => {
        if (chrome.runtime.lastError) {
          console.error('Error creating notification:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log('Notification created with ID:', notificationId);
          sendResponse({ success: true, notificationId });
        }
      },
    );
    return true; // keep the message channel open for async response
  }
  return false; // handle unmatched message types
});
