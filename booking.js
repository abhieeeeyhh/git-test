/* VELOCE — standalone booking page. Validates + forwards to success.html. */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  const form = $('#booking-page-form');
  if (!form) return;

  const name = $('#bk-name');
  const email = $('#bk-email');
  const carSel = $('#bk-car');
  const loc = $('#bk-location');
  const pickup = $('#bk-pickup');
  const ret = $('#bk-return');

  const errName = $('#err-name');
  const errEmail = $('#err-email');
  const errCar = $('#err-car');
  const errLoc = $('#err-location');
  const errPickup = $('#err-pickup');
  const errReturn = $('#err-return');
  const errorFields = [errName, errEmail, errCar, errLoc, errPickup, errReturn];

  const PRICES = {
    'Porsche Panamera': '$189', 'BMW M5 Competition': '$149', 'BMW 4 Series Coupé': '$129',
    'Chevrolet Camaro SS': '$139', 'Tesla Model 3': '$109', 'Honda CR-V': '$89',
    'Fiat 500': '$49', 'Lamborghini Huracán': '$549'
  };

  /* ---------- Date helpers ---------- */
  const ymd = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const addDays = (base, days) => { const d = new Date(base); d.setDate(d.getDate() + days); return d; };

  /* ---------- Date defaults + cross-min ---------- */
  const today = new Date();
  pickup.min = ymd(today);
  ret.min = ymd(today);
  pickup.value = ymd(addDays(today, 1));
  ret.value = ymd(addDays(today, 4));

  pickup.addEventListener('change', () => {
    if (!pickup.value) return;
    ret.min = pickup.value;
    if (!ret.value || ret.value <= pickup.value) {
      ret.value = ymd(addDays(new Date(`${pickup.value}T00:00:00`), 3));
    }
  });

  /* ---------- Prefill car from ?car= ---------- */
  const params = new URLSearchParams(window.location.search);
  const carParam = params.get('car');
  if (carParam) {
    const match = [...carSel.options].find((o) => o.value.trim().toLowerCase() === carParam.trim().toLowerCase());
    if (match) {
      carSel.value = match.value;
    } else if (carParam.trim()) {
      const opt = document.createElement('option');
      opt.value = carParam.trim();
      opt.textContent = carParam.trim();
      carSel.insertBefore(opt, carSel.options[1] || null);
      carSel.value = opt.value;
    }
    const sel = $('#bk-selected');
    const selText = $('#bk-selected-text');
    if (sel && selText && carSel.value) {
      selText.textContent = `${carSel.value} selected`;
      sel.hidden = false;
    }
  }

  /* ---------- Validation ---------- */
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const clearErrors = () => {
    errorFields.forEach((e) => { if (e) e.textContent = ''; });
    [...form.elements].forEach((el) => el.removeAttribute('aria-invalid'));
    form.classList.remove('is-invalid');
  };

  const fail = (el, errEl, msg) => {
    if (errEl) errEl.textContent = msg;
    if (el) el.setAttribute('aria-invalid', 'true');
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    let ok = true;

    if (!name.value.trim()) { fail(name, errName, 'Please enter your name.'); ok = false; }

    if (!email.value.trim()) { fail(email, errEmail, 'Please enter your email.'); ok = false; }
    else if (!emailRe.test(email.value.trim())) { fail(email, errEmail, 'Please enter a valid email address.'); ok = false; }

    if (!carSel.value) { fail(carSel, errCar, 'Please choose a car.'); ok = false; }
    if (!loc.value) { fail(loc, errLoc, 'Please choose a pick-up location.'); ok = false; }
    if (!pickup.value) { fail(pickup, errPickup, 'Please choose a pick-up date.'); ok = false; }

    if (!ret.value) { fail(ret, errReturn, 'Please choose a return date.'); ok = false; }
    else if (pickup.value && ret.value <= pickup.value) { fail(ret, errReturn, 'Return date must be after the pick-up date.'); ok = false; }

    if (!ok) {
      form.classList.add('is-invalid');
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const data = new FormData(form);
    const q = new URLSearchParams();
    ['name', 'email', 'car', 'location', 'pickup', 'return', 'notes'].forEach((k) => {
      const v = (data.get(k) || '').toString().trim();
      if (v) q.set(k, v);
    });

    const locLabel = loc.options[loc.selectedIndex] ? loc.options[loc.selectedIndex].textContent.trim() : loc.value;
    q.set('locationLabel', locLabel);

    const price = PRICES[carSel.value];
    if (price) q.set('price', price);

    window.location.href = `success.html?${q.toString()}`;
  });
})();
