/* Set a saved appearance before the style sheet paints. */
try {
  const savedTheme = localStorage.getItem('talal-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.dataset.theme = savedTheme;
  }
} catch {
  // CSS still follows the system appearance.
}
