import create from 'zustand';
import fp from 'lodash/fp';

import { 
  DeckState, 
  DeckMode, 
  DeckModeCallback, 
  SlideState, 
  Dimensions, 
} from '../types';
import { toHash, navigate } from '../utils';

const useDeck = create<DeckState>((set, get) => ({
  ready: false,
  setTitle: (title: string) => set(fp.set('title')(title)),
  setSlug: (slug: string) => set(fp.set('slug')(slug)),
  setDate: (date: Date) => set(fp.set('date')(date)),
  initializeStates: (elm: HTMLElement, fragmentsBySlide: number[]) => {
    set(fp.flow(
      fp.set('ready')(true),
      fp.set('_rootElm')(elm),
      fp.set('_fragmentsBySlide')(fragmentsBySlide),
    ));
  },
  mode: undefined,
  setMode: (modeOrCallback: DeckMode | DeckModeCallback) => {
    // get the deck state
    const { ready, mode, slideState } = get();

    // don't allow interfacing if not ready
    if (!ready) return;

    // calculate the new mode from user payload
    let newMode: DeckMode | undefined;
    if (typeof modeOrCallback !== 'function') {
      newMode = modeOrCallback;
    } else {
      newMode = (
        typeof mode === 'undefined' 
        ? undefined
        : modeOrCallback(mode)
      );
    }

    // perform different operations depending mode state
    if (newMode === DeckMode.Present) {
      // if we are presenting, go to the slide state (or default)
      if (slideState) {
        set(fp.set('mode')(newMode));
        navigate(toHash(newMode, slideState));
      } else {
        const newSlideState = { indexh: 0, indexf: -1 };
        set(fp.flow(
          fp.set('mode')(newMode),
          fp.set('slideState')(newSlideState)
        ));
        navigate(toHash(newMode, newSlideState));
      }
    } else if (newMode === DeckMode.Print) {
      // if we are printing, 
      set(fp.set('mode')(newMode));
      // @ts-ignore
      navigate(toHash(newMode, slideState));
    }
  },
  slideState: undefined,
  setSlideState: ({ indexf, indexh }: SlideState) => {
    // get the state
    const { ready, _fragmentsBySlide, mode } = get();

    // don't change slide state if in print mode or not ready
    if ((mode !== DeckMode.Present) || !ready || !_fragmentsBySlide) return;

    // change the state to something legal
    if (indexh >= _fragmentsBySlide.length) {
      // if we are at too large a slide, make it the last slide and last fragment
      const lastIndexH = _fragmentsBySlide.length - 1;
      if (lastIndexH >= 0) {
        const lastIndexF = _fragmentsBySlide[lastIndexH] - 1;
        const newSlideState = { indexh: lastIndexH, indexf: lastIndexF };
        set(fp.set('slideState')(newSlideState));
        navigate(toHash(mode, newSlideState));
      } else {
        const newSlideState = { indexh: 0, indexf: -1 };
        set(fp.set('slideState')(newSlideState));
        navigate(toHash(mode, newSlideState));
      }
    } else if (indexh < 0) {
      // if we are at a negative slide, make it the initial slide and fragment
      const newSlideState = { indexh: 0, indexf: -1 };
      set(fp.set('slideState')(newSlideState));
      navigate(toHash(mode, newSlideState));
    } else {
      // if we are at an appropriate slide, clamp the fragment
      const lastIndexF = _fragmentsBySlide[indexh] - 1;
      const newIndexF = Math.max(-1, Math.min(indexf, lastIndexF));
      const newSlideState = { indexh, indexf: newIndexF };
      set(fp.set('slideState')(newSlideState));
      navigate(toHash(mode, newSlideState));
    }
  },
  next: () => {
    // parse the current slide state and its fragments to see if we increase fragment or slide
    const { ready, slideState, setSlideState, _fragmentsBySlide } = get();

    // if not ready, no effect
    if (!ready || !slideState || !_fragmentsBySlide) return;

    // go to the next slide state
    const { indexh, indexf } = slideState;
    if (indexf === _fragmentsBySlide[indexh] - 1) {
      if (indexh === _fragmentsBySlide.length - 1) return;
      setSlideState({ indexh: indexh + 1, indexf: -1 });
    } else {
      setSlideState({ indexh, indexf: indexf + 1 });
    }
  },
  previous: () => {
    // parse the current slide state and its fragments to see if we decrease fragment or slide
    const { ready, slideState, setSlideState, _fragmentsBySlide } = get();

    // if not ready, no effect
    if (!ready || !slideState || !_fragmentsBySlide) return;

    // go to the previous slide state
    const { indexh, indexf } = slideState;
    if (indexf === -1) {
      if (indexh === 0) return;
      const lastIndexF = _fragmentsBySlide[indexh-1] - 1;
      setSlideState({ indexh: indexh - 1, indexf: lastIndexF });
    } else {
      setSlideState({ indexh, indexf: indexf - 1 });
    }
  },
  dimensions: undefined,
  setDimensions: (dimensions: Dimensions) => set(fp.set('dimensions')(dimensions)),
  getParentSlide: (elm: HTMLElement) => {
    const { ready, _rootElm } = get();
    if (!ready || typeof _rootElm === 'undefined') {
      return undefined;
    } else {
      let slideIndex: number | undefined = undefined;
      let offsetIndex = 0;
      _rootElm.childNodes.forEach((slide, index) => {
        if (typeof slideIndex === 'number') return;
        if (slide.nodeName === '#text') offsetIndex++;
        if (slide.contains(elm)) slideIndex = index - offsetIndex;
      });
      return slideIndex;
    }
  },
  _rootElm: undefined,
  _fragmentsBySlide: undefined,
}));

export default useDeck;

