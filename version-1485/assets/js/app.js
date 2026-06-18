(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function activate(nextIndex) {
        index = nextIndex;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          activate(dotIndex);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          activate((index + 1) % slides.length);
        }, 5200);
      }
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));

    searchInputs.forEach(function (input) {
      var scope = input.closest(".content-section") || document;
      var yearFilter = scope.querySelector("[data-year-filter]");
      var categoryFilter = scope.querySelector("[data-category-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search]"));

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilter() {
        var query = normalize(input.value);
        var year = yearFilter ? yearFilter.value : "";
        var category = categoryFilter ? categoryFilter.value : "";

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardYear = card.getAttribute("data-year") || "";
          var cardCategory = card.getAttribute("data-category") || "";
          var matchText = !query || text.indexOf(query) !== -1;
          var matchYear = !year || cardYear === year;
          var matchCategory = !category || cardCategory === category;
          card.classList.toggle("is-filter-hidden", !(matchText && matchYear && matchCategory));
        });
      }

      input.addEventListener("input", applyFilter);
      if (yearFilter) {
        yearFilter.addEventListener("change", applyFilter);
      }
      if (categoryFilter) {
        categoryFilter.addEventListener("change", applyFilter);
      }
    });
  });
})();
