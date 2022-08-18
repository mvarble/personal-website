import type { Node, PluginOptions } from 'gatsby';

export interface Options extends PluginOptions {
  sourceDir: string,
  layoutPath: string,
}

export function defaultOptions(options: Partial<Options>): Options {
  const themeOptions = Object.assign({}, options);
  if (!themeOptions.sourceDir) {
    themeOptions.sourceDir = './content/presentations';
  }
  if (!themeOptions.layoutPath) {
    themeOptions.layoutPath = './src/layouts/presentation.tsx';
  }
  return themeOptions as Options;
}

export interface MdxNode extends Node {
  frontmatter: Frontmatter
  body: string,
  parent: string,
};

interface Frontmatter {
  title: string;
  slug: string;
  date: unknown;
  width?: number;
  height?: number;
}

export interface SlideState {
  indexh: number;
  indexf: number;
}

export enum DeckMode {
  Present,
  Print,
}

export type DeckModeCallback = (mode: DeckMode) => DeckMode;

export interface Dimensions {
  width: number;
  height: number;
};

export interface DeckState {
  /**
   * API
   */
  // if the deck is *ready*, which is to say there is a DOM element attached
  ready: boolean;
  // frontmatter of the deck
  title?: string;
  setTitle: (title: string) => void;
  slug?: string;
  setSlug: (slug: string) => void;
  date?: Date;
  setDate: (date: Date) => void;
  // this initializes the deck states; only ran once, when deck is established
  initializeStates: (elm: HTMLElement, fragmentsBySlide: number[]) => void;
  // different visual modes are available
  mode?: DeckMode;
  setMode: (modeOrCallback: DeckMode | DeckModeCallback) => void,
  // this is the slide+fragment state
  slideState?: SlideState;
  setSlideState: (slideState: SlideState) => void;
  previous: () => void;
  next: () => void;
  // this contains the visual dimensions of a slide
  dimensions?: Dimensions;
  setDimensions: (dimensions: Dimensions) => void;
  // this returns the `SlideState` that the `HTMLElement` exists within
  getParentSlide: (elm: HTMLElement) => (number | undefined);
  /**
   * Internal
   */
  // this is a reference to the deck dom element
  _rootElm?: HTMLElement;
  // this contains the information associated with how many fragments are in a slide
  _fragmentsBySlide?: number[];
}
