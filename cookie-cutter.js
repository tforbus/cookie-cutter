// Local storage Key ID.
const COOKIE_JAR_ID = 'bf2b15a7912-cookie-cutter-cookie-jar';

// Script to run on the page to retrieve the cookie.
const getCookieFn = () => {
  return '(() => { return document.cookie; })();';
};

// Script to run to set the cookie for the page.
// Returns a string representation of an IIFE which sets the cookie.
const setCookieFn = (cookieString) => {
  const str = [];
  cookieString.split(';').forEach(pair => {
    const trimmed = pair.trim();
    str.push(`document.cookie = "${trimmed}";`);
  });

  const result = str.join(' ');
  return `(() => { ${result} })();`;
};

const cookie2Json = (cookieString) => {
  return cookieString.split(';').reduce((hash, pair) => {
    const [key, value] = pair.split('=');
    return Object.assign({}, hash, { [key.trim()]: value });
  }, {});
};

// Runs a function to get the current tab's document.cookie
// and stores in the extension's local storage.
const copyCookie = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    const cookieFn = getCookieFn();
    chrome.tabs.executeScript(tab.id, { code: getCookieFn() }, (cookieString) => {
      window.localStorage.setItem(COOKIE_JAR_ID, cookieString);
    });
  });

};

const pasteCookie = () => {
  const cookieString = window.localStorage.getItem(COOKIE_JAR_ID);
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    chrome.tabs.executeScript(tab.id, { code: setCookieFn(cookieString) });
  });
};

// Chrome setup
const contextMenuIds = {
  root: 'cookie-cutter-context-root',
  copy: 'cookie-cutter-context-root-copy',
  paste: 'cookie-cutter-context-root-paste'
};

const rootMenu = chrome.contextMenus.create({
  id: contextMenuIds.root,
  title: 'Cookie Cutter'
});

const copy = chrome.contextMenus.create({
  parentId: contextMenuIds.root,
  id: contextMenuIds.copy,
  title: 'Yank',
  onclick: copyCookie
});

const paste = chrome.contextMenus.create({
  parentId: contextMenuIds.root,
  id: contextMenuIds.paste,
  title: 'Inject',
  onclick: pasteCookie
});
