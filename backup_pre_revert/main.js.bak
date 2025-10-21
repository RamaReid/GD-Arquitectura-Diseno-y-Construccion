document.addEventListener('DOMContentLoaded', () => {
  const loader = document.querySelector('.loader-overlay');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 500);
    });
  }

  const yearSpan = document.querySelector('[data-current-year]');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
