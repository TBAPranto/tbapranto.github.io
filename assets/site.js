(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('has-js');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const themeButton = document.querySelector('[data-theme-toggle]');
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function updateAppearance() {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : prefersDark.matches;
    themeButton?.setAttribute('aria-pressed', String(dark));
    if (themeColor) themeColor.content = dark ? '#14211e' : '#f5f3ed';
    return dark;
  }

  updateAppearance();
  prefersDark.addEventListener('change', updateAppearance);
  themeButton?.addEventListener('click', () => {
    const theme = updateAppearance() ? 'light' : 'dark';
    root.dataset.theme = theme;
    try {
      localStorage.setItem('talal-theme', theme);
    } catch {
      // The choice still applies for the rest of the page visit.
    }
    updateAppearance();
  });

  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('#main-nav');
  if (menuButton && menu) {
    function setMenu(open) {
      menuButton.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    }

    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'false';
      setMenu(open);
      if (open) menu.querySelector('a')?.focus();
    });
    menu.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link || menuButton.getAttribute('aria-expanded') !== 'true') return;
      setMenu(false);
      if (!link.getAttribute('href').startsWith('#')) return;
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenu(false);
        menuButton.focus();
      }
    });
    document.addEventListener('click', event => {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
    });
    window.matchMedia('(min-width: 721px)').addEventListener('change', () => setMenu(false));
  }

  const filters = document.querySelectorAll('[data-filter]');
  const projectGrid = document.querySelector('.project-grid');
  const cards = projectGrid?.querySelectorAll('[data-category]');
  const filterStatus = document.getElementById('filter-status');
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    const category = button.dataset.filter;
    if (!projectGrid || !cards) return;
    projectGrid.dataset.activeFilter = category;
    let count = 0;
    cards.forEach(card => {
      const show = category === 'all' || card.dataset.category.split(' ').includes(category);
      card.hidden = !show;
      if (show) count += 1;
    });
    projectGrid.querySelectorAll('[data-period]').forEach(period => {
      const visibleCards = period.querySelectorAll('[data-category]:not([hidden])');
      period.hidden = visibleCards.length === 0;
      period.querySelector('.period-gallery').classList.toggle('single', visibleCards.length === 1);
    });
    if (filterStatus) filterStatus.textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown`;
  }));

  document.querySelectorAll('[data-walkthrough]').forEach(walkthrough => {
    const controls = walkthrough.querySelector('[data-walk-controls]');
    const steps = [...controls.querySelectorAll('[data-walk-tab]')].map(tab => ({
      tab,
      panel: document.getElementById(tab.getAttribute('aria-controls'))
    }));
    if (!steps.length || steps.some(({ panel }) => !panel)) return;

    function selectStep(index) {
      steps.forEach(({ tab, panel }, i) => {
        const selected = i === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panel.hidden = !selected;
      });
    }

    function selectHashStep() {
      const index = steps.findIndex(({ panel }) => '#' + panel.id === location.hash);
      if (index !== -1) selectStep(index);
    }

    controls.setAttribute('role', 'tablist');
    steps.forEach(({ tab, panel }, index) => {
      tab.setAttribute('role', 'tab');
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      tab.addEventListener('click', () => selectStep(index));
      tab.addEventListener('keydown', event => {
        const last = steps.length - 1;
        const target = {
          ArrowLeft: index === 0 ? last : index - 1,
          ArrowRight: index === last ? 0 : index + 1,
          Home: 0,
          End: last
        }[event.key];
        if (typeof target !== 'number') return;
        event.preventDefault();
        selectStep(target);
        steps[target].tab.focus();
      });
    });
    selectStep(0);
    selectHashStep();
    window.addEventListener('hashchange', selectHashStep);
    controls.hidden = false;
  });

  const contents = [...document.querySelectorAll('.contents a[href^="#"]')];
  if (contents.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.find(entry => entry.isIntersecting);
      if (!visible) return;
      contents.forEach(link => {
        if (link.hash === '#' + visible.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-18% 0px -62% 0px' });
    contents.forEach(link => {
      const section = document.getElementById(link.hash.slice(1));
      if (section) observer.observe(section);
    });
  }

  const dialog = document.getElementById('image-viewer');
  if (dialog && typeof dialog.showModal === 'function') {
    const preview = dialog.querySelector('img');
    const title = dialog.querySelector('#viewer-title');
    const caption = dialog.querySelector('figcaption');
    const close = dialog.querySelector('[data-close-dialog]');
    let trigger;

    function closeViewer() {
      dialog.close();
      trigger?.focus({ preventScroll: true });
      trigger = null;
    }

    document.querySelectorAll('[data-lightbox]').forEach(link => link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || dialog.open) return;
      event.preventDefault();
      trigger = link;
      title.textContent = link.dataset.title;
      caption.textContent = link.dataset.caption;
      preview.src = link.href;
      preview.alt = link.querySelector('img')?.alt || link.dataset.title;
      dialog.showModal();
      close.focus();
    }));
    close.addEventListener('click', closeViewer);
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      closeViewer();
    });
    dialog.addEventListener('keydown', event => {
      // Close is the image viewer's only interactive control.
      if (event.key === 'Tab') {
        event.preventDefault();
        close.focus();
      }
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) closeViewer();
    });
  }

  const publicEmail = String(window.TALAL_CONTACT?.email || '').trim();
  if (/^[\w.+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(publicEmail)) {
    document.querySelectorAll('[data-public-email]').forEach(link => {
      link.href = `mailto:${publicEmail}`;
      link.hidden = false;
    });
  }
})();
