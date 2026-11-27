/* VELOCE — success page. Renders booking summary from URL params. */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const params = new URLSearchParams(window.location.search);

  const prettyDate = (value) => {
    if (!value) return '';
    const d = new Date(`${value}T00:00:00`);
    if (isNaN(d)) return value;
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  /* Reference number */
  const refEl = $('#success-ref');
  if (refEl) {
    const stamp = (params.get('pickup') || '').replace(/-/g, '') || '000000';
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    refEl.textContent = `VELOCE-${rand}${stamp.slice(-4) || ''}`.replace(/-$/, '');
  }

  /* Personalise */
  const name = (params.get('name') || '').trim();
  const subEl = $('#success-sub');
  if (name && subEl) {
    subEl.textContent = `Thanks, ${name}. Your booking is confirmed and a confirmation email is on its way.`;
  }
  const emailEl = $('#success-email');
  if (emailEl) emailEl.textContent = params.get('email') || 'your email';

  /* Summary */
  const summary = $('#success-summary');
  if (summary) {
    const rows = [];
    const add = (label, value) => { if (value) rows.push(`<dt>${label}</dt><dd>${escapeHtml(value)}</dd>`); };

    add('Car', params.get('car') || 'Any car');
    add('Pick-up location', params.get('locationLabel') || params.get('location'));
    add('Pick-up date', prettyDate(params.get('pickup')));
    add('Return date', prettyDate(params.get('return')));
    if (params.get('price')) add('Rate', `${params.get('price')} / day`);
    if (name) add('Name', name);
    if (params.get('email')) add('Email', params.get('email'));
    if (params.get('notes')) add('Notes', params.get('notes'));

    summary.innerHTML = rows.length ? rows.join('') : '<dt>Details</dt><dd>No booking details provided.</dd>';
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
