import type { ScanResult } from '@/types';

const STORAGE_KEY = 'fishlens_scan_history';
const MAX_HISTORY = 50;

export function getScanHistory(): ScanResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScanResult[];
  } catch {
    return [];
  }
}

export function saveScan(result: ScanResult): void {
  const history = getScanHistory();
  history.unshift(result);
  const trimmed = history.slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(trimmed.slice(0, 10))
    );
  }
}

export function clearScanHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function deleteScan(id: string): ScanResult[] {
  const history = getScanHistory().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return history;
}
