export interface ValidationStats {
  weird: number;
  ok: number;
  skip: number;
}

// Add interface for validation history
export interface ValidationHistory {
  rowIndex: number;
  mark: 'weird' | 'ok' | 'skip';
}