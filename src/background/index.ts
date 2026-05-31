// In development, reload open YouTube tabs whenever the extension reloads
// so the updated content script is re-injected automatically.
if (import.meta.env.DEV) {
  self.addEventListener('activate', () => {
    chrome.tabs.query({ url: '*://www.youtube.com/*' }).then((tabs) => {
      for (const tab of tabs) {
        if (tab.id !== undefined) chrome.tabs.reload(tab.id);
      }
    });
  });
}
