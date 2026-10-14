/* V2 interactions. Classic script; local assets; no fetch, modules or backend. */
(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  // Appearance is the only preference persisted. Storage is optional.
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  function setTheme(theme) {
    root.dataset.theme = theme;
    themeButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('aria-label', theme === 'dark' ? 'Use light appearance' : 'Use dark appearance');
      button.querySelector('span').textContent = theme === 'dark' ? 'Light' : 'Dark';
    });
    const color = document.querySelector('meta[name="theme-color"]');
    if (color) color.content = theme === 'dark' ? '#14211e' : '#f5f3ed';
  }
  let preferred = 'light';
  try { preferred = localStorage.getItem('talal-theme') || 'light'; } catch (_) { /* Session-only appearance. */ }
  setTheme(preferred === 'dark' ? 'dark' : 'light');
  themeButtons.forEach(button => button.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('talal-theme', next); } catch (_) { /* Session-only appearance. */ }
  }));

  // Mobile navigation is a disclosure, not a modal dialog.
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('#main-nav');
  function closeMenu() {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  }
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      closeMenu();
      const href = link.getAttribute('href');
      if (!href.startsWith('#')) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      // Move keyboard focus out of the menu that has just closed.
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
        menuButton.focus();
      }
    });
    document.addEventListener('click', event => {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }

  // Filtering never removes links or content from the source HTML.
  const filters = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-category]');
  filters.forEach(button => button.addEventListener('click', () => {
    const value = button.dataset.filter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    let count = 0;
    cards.forEach(card => {
      const show = value === 'all' || card.dataset.category.split(' ').includes(value);
      card.hidden = !show;
      if (show) count++;
    });
    const status = document.querySelector('#filter-status');
    if (status) status.textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown`;
  }));

  const skillButtons = document.querySelectorAll('[data-skill-tab]');
  const skillPanels = document.querySelectorAll('[data-skill-panel]');
  function selectSkills(id) {
    skillButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.skillTab === id)));
    skillPanels.forEach(panel => { panel.hidden = panel.dataset.skillPanel !== id; });
  }
  if (skillPanels.length) selectSkills('practical');
  skillButtons.forEach(button => button.addEventListener('click', () => selectSkills(button.dataset.skillTab)));

  // Native dialog supplies focus containment and Escape behaviour.
  const dialog = document.querySelector('#image-viewer');
  let imageTrigger;
  document.querySelectorAll('[data-lightbox]').forEach(link => link.addEventListener('click', event => {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    imageTrigger = link;
    dialog.querySelector('#viewer-title').textContent = link.dataset.viewerTitle || 'Actual project screenshot';
    const image = dialog.querySelector('img');
    image.src = link.href;
    image.alt = link.dataset.caption || 'Actual project screenshot';
    dialog.querySelector('figcaption').textContent = link.dataset.caption || '';
    dialog.showModal();
  }));
  if (dialog) {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { if (imageTrigger) imageTrigger.focus(); });
  }

  // This only explains a new illustrative example. It does not run AI inference.
  const pipeline = [
    {
      title: 'Read the image',
      text: 'EasyOCR finds visible labels and positions. Phrase grouping brings fragmented words together before node text is separated from flow labels.',
      code: 'text: "Check request"\nposition: [x, y, width, height]',
      active: 'ocr'
    },
    {
      title: 'Identify the pieces',
      text: 'The fine-tuned Qwen classifier assigns entity, process and data-store types. YOLO11 locates arrow regions for the next geometric stage.',
      code: 'node: { id: "p1", type: "process" }\narrow: { region: [x1, y1, x2, y2] }',
      active: 'classify'
    },
    {
      title: 'Recover the relationships',
      text: 'Geometry estimates the arrow head and tail. Linking assigns source and destination nodes; nearby flow labels are attached and unrelated text is pruned.',
      code: 'edge: { source: "e1", target: "p1" }\nlabel: "request"',
      active: 'link'
    },
    {
      title: 'Export a readable structure',
      text: 'The graph is exported as JSON. Stage images and tables let a researcher inspect the intermediate results before relying on a final explanation.',
      code: '{\n  "nodes": ["e1", "p1", "d1"],\n  "edges": [\n    { "source": "e1", "target": "p1", "label": "request" },\n    { "source": "p1", "target": "d1", "label": "record" }\n  ]\n}',
      active: 'export'
    }
  ];
  document.querySelectorAll('[data-pipeline-step]').forEach(button => button.addEventListener('click', () => {
    const step = pipeline[Number(button.dataset.pipelineStep)];
    if (!step) return;
    document.querySelectorAll('[data-pipeline-step]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('#pipeline-title').textContent = step.title;
    document.querySelector('#pipeline-text').textContent = step.text;
    document.querySelector('#pipeline-code').textContent = step.code;
    document.querySelector('#pipeline-stage').dataset.stage = step.active;
  }));

  // Arrow keys supplement ordinary Tab/Enter/Space operation of button groups.
  ['[data-filter]', '[data-skill-tab]', '[data-pipeline-step]'].forEach(selector => {
    const buttons = [...document.querySelectorAll(selector)];
    buttons.forEach((button, index) => button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      buttons[next].focus();
      buttons[next].click();
    }));
  });

  // Indicate the current section, without a decorative progress indicator.
  const localLinks = [...document.querySelectorAll('.main-nav a[href^="#"], .case-nav a[href^="#"]')];
  const linkedSections = localLinks.map(link => ({ link, section: document.getElementById(link.getAttribute('href').slice(1)) })).filter(item => item.section);
  if (linkedSections.length) {
    let scheduled = false;
    function updateSection() {
      scheduled = false;
      const offset = document.querySelector('.site-header').offsetHeight + 150;
      let current;
      linkedSections.forEach(item => {
        if (item.section.getBoundingClientRect().top <= offset) current = item;
      });
      linkedSections.forEach(item => {
        if (item === current) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      });
    }
    function scheduleSection() {
      if (!scheduled) { scheduled = true; requestAnimationFrame(updateSection); }
    }
    window.addEventListener('scroll', scheduleSection, { passive: true });
    window.addEventListener('resize', scheduleSection);
    updateSection();
  }

  // Direct contact stays absent until the owner approves and enables it.
  const config = window.TALAL_CONTACT || {};
  if (typeof config.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
    document.querySelectorAll('[data-email-link]').forEach(link => {
      link.href = 'mailto:' + config.email;
      link.textContent = config.email;
      link.hidden = false;
    });
    document.querySelectorAll('[data-copy-email]').forEach(button => {
      button.hidden = false;
      button.addEventListener('click', async () => {
        const status = document.querySelector('#copy-status');
        try {
          await navigator.clipboard.writeText(config.email);
          if (status) status.textContent = 'Email address copied.';
        } catch (_) {
          if (status) status.textContent = 'Select the displayed email address to copy it.';
        }
      });
    });
  }
})();
