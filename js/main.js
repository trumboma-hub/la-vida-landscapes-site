(function () {
  'use strict';

  function mobileMenu() {
    var btn = document.getElementById('mobile-menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    function open() {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Close menu');
      document.documentElement.style.overflow = 'hidden';
    }
    function close() {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      document.documentElement.style.overflow = '';
    }
    function toggle() {
      if (menu.hidden) open(); else close();
    }

    btn.addEventListener('click', toggle);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) {
        close();
        btn.focus();
      }
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
  }

  function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  function yearStamp() {
    var year = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(year);
    });
  }

  function reducedMotionGuard() {
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) document.documentElement.classList.add('reduce-motion');
    mq.addEventListener('change', function (e) {
      document.documentElement.classList.toggle('reduce-motion', e.matches);
    });
  }

  function lightbox() {
    var triggers = document.querySelectorAll('[data-lightbox]');
    if (!triggers.length) return;

    var overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Project preview');
    overlay.hidden = true;
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/85 backdrop-blur-sm';
    overlay.innerHTML =
      '<button type="button" data-lightbox-close aria-label="Close preview" class="absolute top-6 right-6 w-12 h-12 rounded-full bg-cream/15 hover:bg-cream/25 text-cream flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
      '<figure class="max-w-5xl w-full text-center text-cream">' +
      '<div data-lightbox-content class="aspect-[4/3] w-full rounded-lg overflow-hidden bg-stone/30 flex items-center justify-center"></div>' +
      '<figcaption data-lightbox-caption class="mt-5 font-serif text-2xl"></figcaption>' +
      '<p data-lightbox-meta class="mt-1 text-sm text-cream/70"></p>' +
      '</figure>';
    document.body.appendChild(overlay);

    var content = overlay.querySelector('[data-lightbox-content]');
    var caption = overlay.querySelector('[data-lightbox-caption]');
    var meta = overlay.querySelector('[data-lightbox-meta]');
    var closeBtn = overlay.querySelector('[data-lightbox-close]');
    var lastTrigger = null;

    function open(trigger) {
      lastTrigger = trigger;
      var inner = trigger.querySelector('[data-lightbox-tile]');
      content.innerHTML = inner ? inner.outerHTML : trigger.innerHTML;
      caption.textContent = trigger.getAttribute('data-lightbox-title') || '';
      meta.textContent = trigger.getAttribute('data-lightbox-meta') || '';
      overlay.hidden = false;
      document.documentElement.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close() {
      overlay.hidden = true;
      document.documentElement.style.overflow = '';
      content.innerHTML = '';
      if (lastTrigger) lastTrigger.focus();
    }

    triggers.forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.preventDefault();
        open(t);
      });
    });
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) close();
    });
  }

  function portfolioFilters() {
    var chips = document.querySelectorAll('[data-filter]');
    var tiles = document.querySelectorAll('[data-tags]');
    if (!chips.length || !tiles.length) return;

    function apply(filter) {
      tiles.forEach(function (tile) {
        var tags = (tile.getAttribute('data-tags') || '').split(/\s+/);
        var visible = filter === 'all' || tags.indexOf(filter) > -1;
        tile.hidden = !visible;
      });
      chips.forEach(function (c) {
        var active = c.getAttribute('data-filter') === filter;
        c.setAttribute('aria-pressed', active ? 'true' : 'false');
        c.classList.toggle('bg-forest', active);
        c.classList.toggle('text-cream', active);
        c.classList.toggle('bg-cream', !active);
        c.classList.toggle('text-ink', !active);
        c.classList.toggle('border-forest', active);
        c.classList.toggle('border-stone/30', !active);
      });
    }

    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        apply(c.getAttribute('data-filter'));
      });
    });
    apply('all');
  }

  document.addEventListener('DOMContentLoaded', function () {
    mobileMenu();
    smoothScroll();
    yearStamp();
    reducedMotionGuard();
    lightbox();
    portfolioFilters();
  });
})();
