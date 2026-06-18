(() => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-input]').forEach((input) => {
    const targetSelector = input.getAttribute('data-search-target');
    const target = targetSelector ? document.querySelector(targetSelector) : document;

    if (!target) {
      return;
    }

    const cards = Array.from(target.querySelectorAll('[data-card]'));

    input.addEventListener('input', () => {
      const keyword = input.value.trim().toLowerCase();

      cards.forEach((card) => {
        const text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        card.classList.toggle('is-hidden', keyword.length > 0 && !text.includes(keyword));
      });
    });
  });

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let active = 0;

    const showSlide = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
    });

    if (slides.length > 1) {
      window.setInterval(() => showSlide(active + 1), 5600);
    }
  }
})();
