/* ============================================================
   VELOCE — careers page: filter open roles by department
   ============================================================ */
(() => {
  'use strict';

  const filterButtons = [...document.querySelectorAll('.job-filters [data-job-filter]')];
  const jobs = [...document.querySelectorAll('[data-job]')];
  const countEl = document.getElementById('job-count');
  const emptyEl = document.getElementById('jobs-empty');
  const resetBtn = document.querySelector('[data-job-reset]');

  if (!filterButtons.length || !jobs.length) return;

  const applyFilter = (filter) => {
    let shown = 0;
    jobs.forEach((job) => {
      const match = filter === 'all' || job.dataset.dept === filter;
      job.hidden = !match;
      if (match) {
        shown += 1;
        /* ensure scroll-reveal items shown again are visible */
        job.classList.add('is-in');
      }
    });
    if (countEl) countEl.textContent = String(shown);
    if (emptyEl) emptyEl.hidden = shown !== 0;
  };

  const setActive = (activeFilter) => {
    filterButtons.forEach((btn) => {
      const active = btn.dataset.jobFilter === activeFilter;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  };

  const activate = (filter) => {
    setActive(filter);
    applyFilter(filter);
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => activate(btn.dataset.jobFilter));
  });

  if (resetBtn) resetBtn.addEventListener('click', () => activate('all'));
})();
