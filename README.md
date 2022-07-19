# Personal website

This is a Gatsby implementation of my personal website, which I intend to ultimately include the following functionality.

- [ ] **Posts.** mdx files will produce `Post` nodes which render to a template which displays the following data for a given post.
  - simple metadata: title, tags, creation/modification date.
  - related posts: posts that are deemed similar.
- [ ] **Presentations.** mdx files will produce `Presentation` nodes which  render to a template which displays a presentation deck; functionality including the following.
  - _runtime._ API for switching deck slides and preventing default behavior for animations.
  - _configuration._ each deck can have its own dimension, theme, etc.
  - _scalable UI._ no matter what the shape of the viewport, the entire deck fits
- [ ] **Books.** collections of mdx files will be grouped and ordered in their own namespace to be read as a consecutive sequence of posts. 

Important website data associated with this content includes the following.

- [ ] **Results.** Want to have _results_, in the sense of internal mdx content to be referenced between pages. 
  Two display strategies must exist.
  - _Direct display._ mdx content from one post may be directly copied into another post.
  - _Dynamic display._ an anchor will render, which opens up a side panel with the relevent MDX content, along with metadata (e.g. referent/all references).
