/* No network calls, modules or runtime dependencies. Safe to open as local files. */
(function () {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  function setTheme(theme) {
    root.dataset.theme = theme;
    themeButtons.forEach(b => {
      b.setAttribute('aria-pressed', String(theme === 'dark'));
      b.setAttribute('aria-label', theme === 'dark' ? 'Use light appearance' : 'Use dark appearance');
      b.querySelector('span').textContent = theme === 'dark' ? 'Light' : 'Dark';
    });
  }
  let preferred = 'light';
  try { preferred = localStorage.getItem('talal-theme') || 'light'; } catch (_) { /* Storage may be unavailable. */ }
  setTheme(preferred === 'dark' ? 'dark' : 'light');
  themeButtons.forEach(b => b.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('talal-theme', next); } catch (_) { /* Session appearance still works. */ }
  }));
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
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { closeMenu(); menuButton.focus(); }
    });
    document.addEventListener('click', e => {
      if (!menu.contains(e.target) && !menuButton.contains(e.target)) closeMenu();
    });
  }
  const filters = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-category]');
  filters.forEach(b => b.addEventListener('click', () => {
    const value = b.dataset.filter;
    filters.forEach(f => f.setAttribute('aria-pressed', String(f === b)));
    let count = 0;
    cards.forEach(c => {
      const show = value === 'all' || c.dataset.category.split(' ').includes(value);
      c.hidden = !show;
      if (show) count++;
    });
    const status = document.querySelector('#filter-status');
    if (status) status.textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown`;
  }));
  const skillButtons = document.querySelectorAll('[data-skill-tab]');
  const skillPanels = document.querySelectorAll('[data-skill-panel]');
  function selectSkills(id) {
    skillButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.skillTab === id)));
    skillPanels.forEach(p => { p.hidden = p.dataset.skillPanel !== id; });
  }
  if (skillPanels.length) selectSkills('practical');
  skillButtons.forEach(b => b.addEventListener('click', () => selectSkills(b.dataset.skillTab)));
  const dialog = document.querySelector('#image-viewer');
  let imageTrigger;
  document.querySelectorAll('[data-lightbox]').forEach(a => a.addEventListener('click', e => {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    e.preventDefault();
    imageTrigger = a;
    const img = dialog.querySelector('img');
    img.src = a.href;
    img.alt = a.dataset.caption || 'Project screenshot';
    dialog.querySelector('figcaption').textContent = a.dataset.caption || '';
    dialog.showModal();
  }));
  if (dialog) {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { if (imageTrigger) imageTrigger.focus(); });
  }
  /* The pipeline is a local conceptual explainer, not AI inference. */
  const pipeline = [
    { title: 'Read the image', text: 'EasyOCR extracts visible labels and their positions. Phrase grouping brings fragmented words back together.', code: 'text: "Check request"\nposition: [x, y, width, height]', active: 'ocr' },
    { title: 'Identify the pieces', text: 'The fine-tuned Qwen classifier assigns node types. YOLO11 locates arrow regions; text-role filtering separates flow labels from node text.', code: 'node: { id: "p1", type: "process" }\narrow: { region: [x1, y1, x2, y2] }', active: 'classify' },
    { title: 'Recover the relationships', text: 'Geometry estimates arrow head and tail. Linking assigns source and destination nodes, then nearby flow labels are attached.', code: 'edge: { source: "e1", target: "p1" }\nlabel: "request"', active: 'link' },
    { title: 'Export a readable structure', text: 'The graph is exported as JSON. Stage images and tables help a researcher inspect what went wrong before relying on an explanation.', code: '{\n  "nodes": ["e1", "p1", "d1"],\n  "edges": [{ "source": "e1", "target": "p1" }]\n}', active: 'export' }
  ];
  document.querySelectorAll('[data-pipeline-step]').forEach(b => b.addEventListener('click', () => {
    const step = pipeline[Number(b.dataset.pipelineStep)];
    document.querySelectorAll('[data-pipeline-step]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    document.querySelector('#pipeline-title').textContent = step.title;
    document.querySelector('#pipeline-text').textContent = step.text;
    document.querySelector('#pipeline-code').textContent = step.code;
    document.querySelector('#pipeline-stage').dataset.stage = step.active;
  }));
  /* Public email stays absent until the owner enables it in contact-config.js. */
  const config = window.TALAL_CONTACT || {};
  if (typeof config.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
    document.querySelectorAll('[data-email-link]').forEach(a => {
      a.href = 'mailto:' + config.email;
      a.textContent = config.email;
      a.hidden = false;
    });
    document.querySelectorAll('[data-copy-email]').forEach(b => {
      b.hidden = false;
      b.addEventListener('click', async () => {
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
