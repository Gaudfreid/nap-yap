// Nap & Yap Staycation — shared interactions

document.addEventListener('DOMContentLoaded', () => {

  /* Nav: solidify on scroll */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 60) nav?.classList.add('scrolled');
    else nav?.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const burger = document.querySelector('.nav-burger');
  const links = document.querySelector('.nav-links');
  burger?.addEventListener('click', () => {
    burger.classList.toggle('open');
    links.classList.toggle('open');
  });
  links?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger?.classList.remove('open');
    links?.classList.remove('open');
  }));

  /* Scroll reveal */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q')?.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* Deep-linked FAQ item (e.g. footer policy links → rates.html#downpayment):
     open that item instead of leaving visitors staring at a collapsed question. */
  if (location.hash) {
    const target = document.querySelector('.faq-item' + location.hash);
    if (target) {
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      target.classList.add('open');
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }

  /* Four Moments progress line (fills as section scrolls into view) */
  const moments = document.querySelector('.moments');
  const line = document.querySelector('.progress-line');
  if (moments && line) {
    const onMomentsScroll = () => {
      const rect = moments.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (rect.height + vh)));
      line.style.setProperty('--fill', `${progress * 100}%`);
    };
    window.addEventListener('scroll', onMomentsScroll, { passive: true });
    onMomentsScroll();
  }

});
