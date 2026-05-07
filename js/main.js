(function () {
  'use strict';

  /* -------------------- shared -------------------- */
  function mobileMenu() {
    var btn = document.getElementById('mobile-menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    function open() { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Close menu'); document.documentElement.style.overflow = 'hidden'; }
    function close() { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu'); document.documentElement.style.overflow = ''; }
    btn.addEventListener('click', function () { menu.hidden ? open() : close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { close(); btn.focus(); } });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
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
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(year); });
  }

  function reducedMotionGuard() {
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) document.documentElement.classList.add('reduce-motion');
    mq.addEventListener('change', function (e) { document.documentElement.classList.toggle('reduce-motion', e.matches); });
  }

  /* -------------------- index.html: reveal on scroll -------------------- */
  function reveals() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* -------------------- index.html: nav scroll state -------------------- */
  function navScrollState() {
    var nav = document.getElementById('site-nav');
    if (!nav) return;
    var update = function () {
      var scrolled = window.scrollY > 24;
      nav.classList.toggle('is-scrolled', scrolled);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* -------------------- index.html: hero parallax -------------------- */
  function heroParallax() {
    var el = document.querySelector('[data-hero-parallax]');
    if (!el) return;
    var update = function () {
      var y = Math.min(window.scrollY, 600);
      el.style.transform = 'translate3d(0, ' + (y * 0.18) + 'px, 0)';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* -------------------- index.html: before/after slider -------------------- */
  function beforeAfter() {
    var wraps = document.querySelectorAll('[data-ba]');
    if (!wraps.length) return;
    wraps.forEach(function (wrap) {
      var dragging = false;
      function move(clientX) {
        var rect = wrap.getBoundingClientRect();
        var pct = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
        wrap.style.setProperty('--ba', pct + '%');
      }
      wrap.addEventListener('mousedown', function (e) { dragging = true; move(e.clientX); });
      wrap.addEventListener('touchstart', function (e) { dragging = true; move(e.touches[0].clientX); }, { passive: true });
      window.addEventListener('mousemove', function (e) { if (dragging) move(e.clientX); });
      window.addEventListener('touchmove', function (e) { if (dragging) move(e.touches[0].clientX); }, { passive: true });
      window.addEventListener('mouseup', function () { dragging = false; });
      window.addEventListener('touchend', function () { dragging = false; });
    });
  }

  /* -------------------- index.html: showcase carousel -------------------- */
  function showcase() {
    var root = document.getElementById('showcase');
    if (!root) return;
    var slides = root.querySelectorAll('[data-slide]');
    var thumbs = root.querySelectorAll('[data-thumb]');
    var dots = root.querySelectorAll('[data-dot]');
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var ba = root.querySelector('[data-ba]');
    var afterImg = root.querySelector('[data-after-img]');
    var beforeImg = root.querySelector('[data-before-img]');
    var meta = {
      counter: root.querySelector('[data-counter]'),
      year: root.querySelector('[data-year-current]'),
      title: root.querySelector('[data-title]'),
      location: root.querySelector('[data-location]'),
      summary: root.querySelector('[data-summary]'),
      services: root.querySelector('[data-services]'),
      details: root.querySelector('[data-details]'),
    };
    if (!slides.length) return;

    var data = Array.prototype.map.call(slides, function (el) {
      return {
        title: el.dataset.title,
        location: el.dataset.location,
        year: el.dataset.year,
        summary: el.dataset.summary,
        services: (el.dataset.services || '').split('|').filter(Boolean),
        details: (el.dataset.details || '').split('|').filter(Boolean).map(function (d) { var p = d.split(':'); return { label: p[0], value: p[1] }; }),
        before: el.dataset.before,
        after: el.dataset.after,
      };
    });

    var active = 0;

    function pad(n) { return String(n).padStart(2, '0'); }

    function render(i) {
      active = (i + data.length) % data.length;
      var p = data[active];
      if (afterImg) { afterImg.src = p.after; afterImg.alt = p.title + ' — finished'; }
      if (beforeImg) { beforeImg.src = p.before; beforeImg.alt = p.title + ' — before'; }
      if (ba) ba.style.setProperty('--ba', '50%');
      if (meta.counter) meta.counter.textContent = pad(active + 1) + ' / ' + pad(data.length);
      if (meta.year) meta.year.textContent = p.year;
      if (meta.title) meta.title.textContent = p.title;
      if (meta.location) meta.location.textContent = p.location;
      if (meta.summary) meta.summary.textContent = p.summary;
      if (meta.services) {
        meta.services.innerHTML = '';
        p.services.forEach(function (s) {
          var li = document.createElement('li');
          li.className = 'text-[11px] px-3 py-1.5 rounded-full';
          li.style.cssText = 'border:1px solid rgba(245,241,232,.22); color:rgba(245,241,232,.85)';
          li.textContent = s;
          meta.services.appendChild(li);
        });
      }
      if (meta.details) {
        meta.details.innerHTML = '';
        p.details.forEach(function (d) {
          var div = document.createElement('div');
          div.className = 'pl-4';
          div.style.cssText = 'border-left:1px solid rgba(245,241,232,.18)';
          div.innerHTML = '<dt class="font-mono-eb text-[10px] tracking-[0.2em] uppercase" style="color:rgba(245,241,232,.5)">' + d.label + '</dt>' +
                          '<dd class="font-serif text-2xl mt-2" style="color:var(--cream)">' + d.value + '</dd>';
          meta.details.appendChild(div);
        });
      }
      dots.forEach(function (d, idx) { d.classList.toggle('active', idx === active); });
      thumbs.forEach(function (t, idx) {
        t.classList.toggle('is-active', idx === active);
        t.setAttribute('aria-current', idx === active ? 'true' : 'false');
      });
    }

    dots.forEach(function (d, idx) { d.addEventListener('click', function () { render(idx); }); });
    thumbs.forEach(function (t, idx) { t.addEventListener('click', function () { render(idx); }); });
    if (prev) prev.addEventListener('click', function () { render(active - 1); });
    if (next) next.addEventListener('click', function () { render(active + 1); });

    render(0);
  }

  /* -------------------- index.html: service area map -------------------- */
  function serviceMap() {
    var root = document.getElementById('service-map');
    if (!root) return;
    var markers = root.querySelectorAll('[data-marker]');
    var rows = root.querySelectorAll('[data-area-row]');
    function set(i) {
      markers.forEach(function (m, idx) { m.classList.toggle('is-active', idx === i); });
      rows.forEach(function (r, idx) { r.classList.toggle('is-active', idx === i); });
    }
    markers.forEach(function (m, idx) {
      m.addEventListener('mouseenter', function () { set(idx); });
      m.addEventListener('focus', function () { set(idx); });
      m.addEventListener('click', function () { set(idx); });
    });
    rows.forEach(function (r, idx) {
      r.addEventListener('click', function () { set(idx); });
      r.addEventListener('mouseenter', function () { set(idx); });
    });
    set(0);
  }

  /* -------------------- index.html: testimonials cycle -------------------- */
  function testimonials() {
    var root = document.getElementById('testimonials');
    if (!root) return;
    var items = root.querySelectorAll('[data-quote]');
    var dots = root.querySelectorAll('[data-quote-dot]');
    if (!items.length) return;
    var i = 0;
    function set(n) {
      i = (n + items.length) % items.length;
      items.forEach(function (el, idx) { el.classList.toggle('is-active', idx === i); });
      dots.forEach(function (d, idx) { d.classList.toggle('active', idx === i); });
    }
    dots.forEach(function (d, idx) { d.addEventListener('click', function () { set(idx); }); });
    set(0);
    var auto = setInterval(function () { set(i + 1); }, 7000);
    root.addEventListener('mouseenter', function () { clearInterval(auto); });
  }

  /* -------------------- index.html: contact form pills -------------------- */
  function contactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var pills = form.querySelectorAll('[data-svc-pill]');
    var hidden = form.querySelector('[data-services-hidden]');
    var selected = new Set();
    pills.forEach(function (p) {
      p.addEventListener('click', function () {
        var v = p.dataset.svcPill;
        if (selected.has(v)) { selected.delete(v); p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); }
        else { selected.add(v); p.classList.add('active'); p.setAttribute('aria-pressed', 'true'); }
        if (hidden) hidden.value = Array.from(selected).join(', ');
      });
    });

    var submitBtn = form.querySelector('button[type="submit"]');
    var errorEl = document.getElementById('contact-error');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (errorEl) errorEl.hidden = true;

      var fd = new FormData(form);
      var payload = {
        name: (fd.get('name') || '').toString().trim(),
        email: (fd.get('email') || '').toString().trim(),
        property: (fd.get('property') || '').toString().trim(),
        services: (fd.get('services') || '').toString().trim(),
        message: (fd.get('message') || '').toString().trim(),
        company: (fd.get('company') || '').toString().trim(),
      };

      if (!payload.name || !payload.email) {
        if (errorEl) {
          errorEl.textContent = 'Please include your name and email.';
          errorEl.hidden = false;
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        if (!submitBtn.dataset._label) submitBtn.dataset._label = submitBtn.innerHTML;
        submitBtn.textContent = 'Sending…';
      }

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (result) {
          if (!result.ok) {
            var msg = (result.data && result.data.error) || 'Something went wrong. Please email us directly.';
            if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; }
            return;
          }
          var success = document.getElementById('contact-success');
          var formWrap = document.getElementById('contact-form-wrap');
          if (success && formWrap) {
            formWrap.hidden = true;
            success.hidden = false;
            var nameEl = success.querySelector('[data-success-name]');
            if (nameEl) nameEl.textContent = payload.name || 'friend';
          }
        })
        .catch(function () {
          if (errorEl) {
            errorEl.textContent = 'We couldn’t reach the server. Please try again or email us directly.';
            errorEl.hidden = false;
          }
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            if (submitBtn.dataset._label) {
              submitBtn.innerHTML = submitBtn.dataset._label;
              delete submitBtn.dataset._label;
            }
          }
        });
    });

    var sendAnother = document.getElementById('send-another');
    if (sendAnother) {
      sendAnother.addEventListener('click', function () {
        var success = document.getElementById('contact-success');
        var formWrap = document.getElementById('contact-form-wrap');
        if (success && formWrap) {
          form.reset();
          selected.clear();
          pills.forEach(function (p) { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
          if (hidden) hidden.value = '';
          success.hidden = true;
          formWrap.hidden = false;
        }
      });
    }
  }

  /* -------------------- index.html: floating CTA -------------------- */
  function floatingCta() {
    var cta = document.querySelector('.floating-cta');
    if (!cta) return;
    var update = function () { cta.classList.toggle('show', window.scrollY > 800); };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* -------------------- portfolio.html: lightbox + filters (legacy, still used) -------------------- */
  function lightbox() {
    var triggers = document.querySelectorAll('[data-lightbox]');
    if (!triggers.length) return;
    var overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Project preview');
    overlay.hidden = true;
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-6';
    overlay.style.background = 'rgba(26,31,27,.85)';
    overlay.style.backdropFilter = 'blur(6px)';
    overlay.innerHTML =
      '<button type="button" data-lightbox-close aria-label="Close preview" class="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center" style="background:rgba(245,241,232,.15); color:var(--cream)">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
      '<figure class="max-w-5xl w-full text-center" style="color:var(--cream)">' +
      '<div data-lightbox-content class="aspect-[4/3] w-full rounded-lg overflow-hidden flex items-center justify-center" style="background:rgba(168,155,140,.3)"></div>' +
      '<figcaption data-lightbox-caption class="mt-5 font-serif text-2xl"></figcaption>' +
      '<p data-lightbox-meta class="mt-1 text-sm" style="color:rgba(245,241,232,.7)"></p>' +
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
    triggers.forEach(function (t) { t.addEventListener('click', function (e) { e.preventDefault(); open(t); }); });
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !overlay.hidden) close(); });
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
    chips.forEach(function (c) { c.addEventListener('click', function () { apply(c.getAttribute('data-filter')); }); });
    apply('all');
  }

  document.addEventListener('DOMContentLoaded', function () {
    mobileMenu();
    smoothScroll();
    yearStamp();
    reducedMotionGuard();
    reveals();
    navScrollState();
    heroParallax();
    beforeAfter();
    showcase();
    serviceMap();
    testimonials();
    contactForm();
    floatingCta();
    lightbox();
    portfolioFilters();
  });
})();
