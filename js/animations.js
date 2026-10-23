/**
 * AUTOELITE — Luxury Micro-Interactions, 3D Tilt, Lighting & Parallax
 */

export class Animations {
  static isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  static prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Initializes cursor-reactive lighting on hero sections
   */
  static initHeroLighting() {
    if (this.isTouchDevice || this.prefersReducedMotion) return;

    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--mouse-x', `${x.toFixed(1)}%`);
      hero.style.setProperty('--mouse-y', `${y.toFixed(1)}%`);
    });
  }

  /**
   * Initializes 3D tilt effects on vehicle cards
   */
  static initCardTilt(selector = '.tilt-card') {
    if (this.isTouchDevice || this.prefersReducedMotion) return;

    const cards = document.querySelectorAll(selector);
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cardX = e.clientX - rect.left;
        const cardY = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((cardY - centerY) / centerY) * -6; // max 6 deg
        const rotateY = ((cardX - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  /**
   * Initializes scroll reveals using IntersectionObserver
   */
  static initScrollReveals() {
    if (this.prefersReducedMotion) {
      document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  }

  /**
   * Smoothly animates numeric counters
   */
  static animateCounter(el, target, duration = 1200) {
    if (!el) return;
    const end = Number(target) || 0;
    if (this.prefersReducedMotion || end === 0) {
      el.textContent = end.toLocaleString('en-IN');
      return;
    }

    let start = 0;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(ease * end);
      el.textContent = current.toLocaleString('en-IN');

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = end.toLocaleString('en-IN');
      }
    };

    requestAnimationFrame(step);
  }
}
