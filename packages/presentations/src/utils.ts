import { DeckMode, SlideState } from './types';

export function isNonnegativeInteger(x: number): boolean {
  return Number.isFinite(x) && Math.floor(x) === x && x >= 0;
}

export function toHash(mode: DeckMode, slideState: SlideState): string {
  return (
    mode === DeckMode.Print
    ? '#/print'
    : `#/${slideState.indexh}/${slideState.indexf}`
  );
}

export function navigate(hash: string) {
  if (window) window.history.replaceState(null, '', hash);
}
