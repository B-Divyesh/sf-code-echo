import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: '.',
  manifest: {
    name: 'Code Echo',
    description: 'Hear selected code one syntax part at a time, without sending it away.',
    version: '1.0.0',
    permissions: ['storage', 'contextMenus', 'activeTab'],
    host_permissions: ['https://api.sociobot.in/*'],
    commands: {
      'read-selection': {
        suggested_key: { default: 'Alt+Shift+E' },
        description: 'Read the current selection'
      },
      'replay-latest': {
        suggested_key: { default: 'Ctrl+Shift+Y', mac: 'MacCtrl+Shift+Y' },
        description: 'Replay the latest selection'
      }
    },
    action: { default_title: 'Open Code Echo' },
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png'
    }
  }
});
