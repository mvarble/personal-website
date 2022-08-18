export enum Theme {
  Light,
  Dark,
}

export function updateClass() {
  if (getTheme() === Theme.Dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function getTheme(): Theme {
  if (
    typeof localStorage !== 'undefined'
    && (
      Number(localStorage.theme) as Theme === Theme.Dark
      || (
        !('theme' in localStorage) 
        && window.matchMedia('(prefers-color-scheme: dark)').matches
      )
    )
  ) {
    return Theme.Dark;
  } else {
    return Theme.Light;
  }
}
