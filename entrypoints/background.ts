import { defineBackground } from 'wxt/utils/define-background';

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'code-echo-read',
        title: 'Read selection with Code Echo',
        contexts: ['selection']
      });
    });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== 'code-echo-read' || !tab?.id) return;
    chrome.tabs.sendMessage(tab.id, { type: 'echo:read', text: info.selectionText }).catch(() => undefined);
  });

  chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    const type = command === 'replay-latest' ? 'echo:replay' : 'echo:read-selection';
    chrome.tabs.sendMessage(tab.id, { type }).catch(() => undefined);
  });
});
