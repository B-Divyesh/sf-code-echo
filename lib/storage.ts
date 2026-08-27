import { DEFAULT_SETTINGS, type EchoHistoryItem, type EchoSettings, type LicenseState } from './types';

const SETTINGS_KEY = 'echoSettings';
const HISTORY_KEY = 'echoHistory';
const LICENSE_KEY = 'echoLicense';

export async function loadSettings(): Promise<EchoSettings> {
  const local = await chrome.storage.local.get(SETTINGS_KEY);
  const localSettings = { ...DEFAULT_SETTINGS, ...(local[SETTINGS_KEY] as Partial<EchoSettings> | undefined) };
  if (!localSettings.syncEnabled) return localSettings;
  const synced: Record<string, unknown> = await chrome.storage.sync.get(SETTINGS_KEY).catch(() => ({}));
  return { ...localSettings, ...(synced[SETTINGS_KEY] as Partial<EchoSettings> | undefined), syncEnabled: true };
}

export async function saveSettings(settings: EchoSettings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  if (settings.syncEnabled) await chrome.storage.sync.set({ [SETTINGS_KEY]: settings }).catch(() => undefined);
}

export async function loadHistory(): Promise<EchoHistoryItem[]> {
  const result = await chrome.storage.local.get(HISTORY_KEY);
  return (result[HISTORY_KEY] as EchoHistoryItem[] | undefined) ?? [];
}

export async function addHistory(text: string): Promise<void> {
  const previous = await loadHistory();
  const duplicateFree = previous.filter((item) => item.text !== text);
  const next = [{ id: crypto.randomUUID(), text, createdAt: Date.now() }, ...duplicateFree].slice(0, 10);
  await chrome.storage.local.set({ [HISTORY_KEY]: next });
}

export async function clearHistory(): Promise<void> {
  await chrome.storage.local.remove(HISTORY_KEY);
}

export async function loadLicense(): Promise<LicenseState> {
  const result = await chrome.storage.local.get(LICENSE_KEY);
  return (result[LICENSE_KEY] as LicenseState | undefined) ?? { valid: false, checkedAt: 0 };
}

export async function saveLicense(state: LicenseState): Promise<void> {
  await chrome.storage.local.set({ [LICENSE_KEY]: state });
}
