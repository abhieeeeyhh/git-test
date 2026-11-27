/* ============================================================
   VELOCE — interactions
   ============================================================ */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Sticky header ---------- */
  const header = $('#site-header');
  const setHeaderState = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  /* ---------- Mobile drawer ---------- */
  const drawer = $('#mobile-menu');
  const toggle = $('.nav-toggle');
  const closeBtn = $('.drawer-close');
  const main = $('main');
  const footer = $('.site-footer');
  const skipLink = $('.skip-link');
  let lastFocused = null;

  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('no-scroll', open);
    [main, footer, header, skipLink].forEach((el) => { if (el) el.inert = open; });

    if (open) {
      lastFocused = document.activeElement;
      closeBtn.focus({ preventScroll: true });
    } else if (lastFocused) {
      lastFocused.focus({ preventScroll: true });
      lastFocused = null;
    }
  };

  toggle.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
  closeBtn.addEventListener('click', () => setDrawer(false));
  $$('.drawer-links a, .drawer-foot a').forEach((link) => {
    link.addEventListener('click', () => setDrawer(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) setDrawer(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && drawer.classList.contains('is-open')) setDrawer(false);
  });

  /* ---------- Toast ---------- */
  const toast = $('#toast');
  const toastText = $('#toast-text');
  const toastIcon = $('#toast-icon use');
  let toastTimer;

  const showToast = (message, isError = false) => {
    toastText.textContent = message;
    toast.classList.toggle('is-error', isError);
    if (toastIcon) toastIcon.setAttribute('href', isError ? '#i-alert' : '#i-check');
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4600);
  };

  /* ---------- Booking dates ---------- */
  const form = $('#booking-form');
  const pickup = $('#pickup-date');
  const dropoff = $('#return-date');
  const locationSelect = $('#pickup-location');
  const cityNames = { lax: 'Los Angeles', sfo: 'San Francisco', mia: 'Miami', jfk: 'New York', aus: 'Austin', sea: 'Seattle' };

  const ymd = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const addDays = (base, days) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  };
  const prettyDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (pickup && dropoff) {
    const today = new Date();
    pickup.min = ymd(today);
    dropoff.min = ymd(today);
    pickup.value = ymd(addDays(today, 1));
    dropoff.value = ymd(addDays(today, 4));

    pickup.addEventListener('change', () => {
      if (!pickup.value) return;
      dropoff.min = pickup.value;
      if (!dropoff.value || dropoff.value <= pickup.value) {
        dropoff.value = ymd(addDays(new Date(`${pickup.value}T00:00:00`), 3));
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!pickup.value || !dropoff.value) {
        showToast('Choose your pick-up and return dates first.', true);
        return;
      }
      if (dropoff.value <= pickup.value) {
        showToast('Return date must be after the pick-up date.', true);
        return;
      }
      const city = cityNames[locationSelect.value] || 'your city';
      const available = 18 + (locationSelect.value.charCodeAt(0) + locationSelect.value.charCodeAt(1)) % 22;
      showToast(`${available} cars ready in ${city} · ${prettyDate(pickup.value)} – ${prettyDate(dropoff.value)}`);
      $('#fleet').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- Reserve → prefill note ---------- */
  const picked = $('#book-picked');
  const pickedText = $('#book-picked-text');
  $$('.reserve[data-car]').forEach((link) => {
    link.addEventListener('click', () => {
      if (!picked) return;
      pickedText.textContent = `${link.dataset.car} selected — choose your dates, then search.`;
      picked.hidden = false;
    });
  });

  /* ---------- Fleet filter ---------- */
  const filterButtons = $$('.filter');
  const cards = $$('.car-card');
  const fleetCount = $('#fleet-count');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const applyFilter = (filter) => {
    let shown = 0;
    cards.forEach((card) => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.classList.add('is-in');
      card.hidden = !match;
      if (match) {
        shown += 1;
        if (!reduceMotion) {
          card.animate(
            [
              { opacity: 0, transform: 'translateY(14px)' },
              { opacity: 1, transform: 'translateY(0)' }
            ],
            { duration: 420, delay: shown * 35, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }
          );
        }
      }
    });
    if (fleetCount) fleetCount.textContent = String(shown);
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => {
        btn.classList.toggle('is-active', btn === button);
        btn.setAttribute('aria-pressed', String(btn === button));
      });
      applyFilter(button.dataset.filter);
    });
  });

  /* ---------- Favourites ---------- */
  $$('.car-fav').forEach((button) => {
    button.addEventListener('click', () => {
      const saved = button.classList.toggle('is-saved');
      button.setAttribute('aria-pressed', String(saved));
      const carName = button.closest('.car-card').querySelector('h3').textContent.trim();
      button.setAttribute('aria-label', saved ? `Remove ${carName} from your list` : `Save ${carName} to your list`);
      showToast(saved ? `${carName} saved to your list.` : `${carName} removed from your list.`);
    });
  });

  /* ---------- Newsletter ---------- */
  const newsletter = $('#newsletter-form');
  if (newsletter) {
    newsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#newsletter-email');
      if (!email.value) return;
      showToast('You’re on the list — a welcome offer is on its way.');
      newsletter.reset();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Counters ---------- */
  const counters = $$('[data-count]');
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    const duration = 1500;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    };
    requestAnimationFrame(tick);
  };

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach((el) => counterObserver.observe(el));
    } else {
      counters.forEach(runCounter);
    }
  }

  /* ---------- Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
