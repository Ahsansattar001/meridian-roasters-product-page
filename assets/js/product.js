
(function (window, document) {
  "use strict";

  var Store = window.Store;
  var Icons = window.Icons;
  var Cart  = window.Cart;
  var $     = Store.Utils.$;
  var money = Store.Utils.money;
  var photo = Store.Utils.photo;

  /** The coffee being viewed; falls back to the first product. */
  var product = Store.Catalogue.byId(new URLSearchParams(location.search).get("id"))
             || Store.Catalogue.all()[0];

  var state = {
    imageIndex: 0,
    sizeId: "250",
    grindId: "whole",
    plan: "once",          // "once" | "subscription"
    frequencyWeeks: "4",
    quantity: 1,
    brewId: "espresso",
    wishlisted: false
  };

  var REVIEWS = [
    { name: "Tom H.", stars: 5, title: "Replaced my supermarket bag", date: "6 days ago",
      variant: "250 g · Espresso",
      body: "Same machine, same recipe, completely different shot. I had been blaming the grinder for a year." },
    { name: "Priya S.", stars: 5, title: "The roast date is the point", date: "2 weeks ago",
      variant: "1 kg · Whole bean · subscription",
      body: "Never more than four days old when it arrives. That alone was worth switching for, and the subscription means I stop thinking about it." },
    { name: "Dana R.", stars: 4, title: "Great, once I got the grind right", date: "3 weeks ago",
      variant: "250 g · Whole bean",
      body: "Ran a little fast for the first few shots. Two clicks finer and it is exactly as described — the hazelnut is not marketing." }
  ];

  var RATING_DISTRIBUTION = [[5, 86], [4, 10], [3, 3], [2, 1], [1, 0]];

  /* ---------------------------------------------------------------
     Pricing
     --------------------------------------------------------------- */
  function isSubscription() {
    return state.plan === "subscription";
  }

  function unitPrice() {
    return Store.Catalogue.priceFor(product, state.sizeId, isSubscription());
  }

  function lineTotal() {
    return unitPrice() * state.quantity;
  }

  /* ---------------------------------------------------------------
     Static content
     --------------------------------------------------------------- */
  function renderHeader() {
    document.title = product.name + " — Meridian Roasters";
    $("#breadcrumb-name").textContent = product.name;
    $("#product-name").textContent = product.name;
    $("#product-origin").textContent = product.origin;
    $("#product-blurb").textContent = product.blurb;
    $("#product-about").innerHTML = "<p>" + product.about + "</p>";
    $("#product-stars").innerHTML = Icons.stars(5);
    $("#product-rating").textContent = product.rating + " · " + product.reviewCount + " reviews";

    $("#product-notes").innerHTML = product.notes.map(function (note) {
      return '<span class="note-chip">' + Icons.render("droplet") + note + "</span>";
    }).join("");

    $("#gallery-flags").innerHTML =
      (product.flag ? '<span class="badge badge--dark">' + product.flag + "</span>" : "") +
      (product.compareAt ? '<span class="badge badge--sale">Save ' + money(product.compareAt - product.price) + "</span>" : "");
  }

  /* ---------------------------------------------------------------
     Gallery
     --------------------------------------------------------------- */
  function renderGallery() {
    $("#gallery-image").src = photo(product.images[state.imageIndex], 1000);
    $("#gallery-image").alt = product.name + " — image " + (state.imageIndex + 1);

    $("#gallery-thumbs").innerHTML = product.images.map(function (id, index) {
      return '<button type="button" role="tab" data-index="' + index + '"' +
        ' aria-current="' + (index === state.imageIndex) + '" aria-label="Image ' + (index + 1) + '">' +
        '<img src="' + photo(id, 220) + '" alt="" loading="lazy"></button>';
    }).join("");

    $("#sticky-image").src = photo(product.images[0], 140);
  }

  function stepImage(delta) {
    var count = product.images.length;
    state.imageIndex = (state.imageIndex + delta + count) % count;
    renderGallery();
  }

  /* ---------------------------------------------------------------
     Options
     --------------------------------------------------------------- */
  function renderOptions() {
    var size = Store.Catalogue.size(state.sizeId);

    $("#size-options").innerHTML = Store.SIZES.map(function (option) {
      return '<button type="button" class="option" role="radio" data-size="' + option.id + '"' +
        ' aria-checked="' + (option.id === state.sizeId) + '">' + option.label +
        " <small>" + money(product.price * option.multiplier) + "</small></button>";
    }).join("");
    $("#size-hint").textContent = size.yield;

    $("#grind-options").innerHTML = Store.GRINDS.map(function (option) {
      return '<button type="button" class="option" role="radio" data-grind="' + option.id + '"' +
        ' aria-checked="' + (option.id === state.grindId) + '">' +
        Icons.render(option.icon) + option.label + "</button>";
    }).join("");

    renderPlans();
  }

  function renderPlans() {
    var oneOff = Store.Catalogue.priceFor(product, state.sizeId, false);
    var subscribed = Store.Catalogue.priceFor(product, state.sizeId, true);

    $("#plan-options").innerHTML =
      '<button type="button" class="plan" role="radio" data-plan="once" aria-checked="' + (state.plan === "once") + '">' +
        '<span class="plan__radio"></span>' +
        '<span><span class="plan__title">One-time purchase</span>' +
        '<small class="plan__note">Just this bag</small></span>' +
        '<span class="plan__price">' + money(oneOff) + "</span></button>" +

      '<button type="button" class="plan" role="radio" data-plan="subscription" aria-checked="' + (state.plan === "subscription") + '">' +
        '<span class="plan__radio"></span>' +
        '<span><span class="plan__title">Subscribe &amp; save' +
        '<span class="badge badge--gold">Save 15%</span></span>' +
        '<small class="plan__note">Skip, swap or cancel any week</small></span>' +
        '<span class="plan__price">' + money(subscribed) + "</span></button>";

    $("#plan-frequency").hidden = !isSubscription();
  }

  function renderPrice() {
    var size = Store.Catalogue.size(state.sizeId);
    var fullPrice = Store.Catalogue.priceFor(product, state.sizeId, false);

    $("#price-current").textContent = money(unitPrice());
    $("#price-compare").textContent = isSubscription()
      ? money(fullPrice)
      : (product.compareAt ? money(product.compareAt * size.multiplier) : "");
    $("#price-unit").textContent = money(unitPrice() / size.grams * 100) + " per 100 g";

    $("#quantity-value").textContent = state.quantity;
    $("#add-total").textContent = money(lineTotal());

    // Sticky bar mirrors the current selection.
    $("#sticky-name").textContent = product.name;
    $("#sticky-meta").textContent =
      size.label + " · " + Store.Catalogue.grind(state.grindId).label +
      (isSubscription() ? " · every " + state.frequencyWeeks + " weeks" : "");
    $("#sticky-price").textContent = money(lineTotal());

    renderShippingMeter();
  }

  function renderShippingMeter() {
    var remaining = Store.CONFIG.freeShippingFrom - lineTotal();
    $("#shipping-message").textContent = remaining > 0
      ? money(remaining) + " away from free shipping"
      : "Free shipping unlocked";
    $("#shipping-fill").style.width =
      Math.min(100, lineTotal() / Store.CONFIG.freeShippingFrom * 100) + "%";
  }

  /* ---------------------------------------------------------------
     Roast calendar: next roast day, rest, then delivery window
     --------------------------------------------------------------- */
  function renderDates() {
    var ROAST_DAYS = [2, 5]; // Tuesday, Friday
    var format = function (date) {
      return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    };

    var roastDate = new Date();
    while (ROAST_DAYS.indexOf(roastDate.getDay()) === -1) {
      roastDate.setDate(roastDate.getDate() + 1);
    }

    var shipDate = new Date(roastDate);
    shipDate.setDate(shipDate.getDate() + 3); // three days' rest

    var deliveryDate = new Date(shipDate);
    var workingDays = 0;
    while (workingDays < 4) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) workingDays += 1;
    }

    $("#roast-day").textContent =
      roastDate.toLocaleDateString("en-GB", { weekday: "long" });
    $("#ship-day").textContent = format(shipDate);
    $("#delivery-day").textContent = format(deliveryDate);
  }

  /* ---------------------------------------------------------------
     Cup profile and farm
     --------------------------------------------------------------- */
  function renderProfile() {
    $("#roast-marker").setAttribute("cx", Math.max(12, Math.min(388, product.roastLevel * 400)));

    var scores = [
      ["Body", product.cup.body],
      ["Acidity", product.cup.acidity],
      ["Sweetness", product.cup.sweetness],
      ["Balance", product.cup.balance]
    ];

    $("#score-list").innerHTML = scores.map(function (entry) {
      return '<div class="score"><span>' + entry[0] + "</span>" +
        '<span class="score__track"><i class="score__fill" style="width:' + entry[1] * 100 + '%"></i></span>' +
        '<span class="score__value">' + Math.round(entry[1] * 10) + "/10</span></div>";
    }).join("");

    $("#farm-title").textContent = product.farm.title;
    $("#farm-text").textContent = product.farm.text;

    var facts = [
      ["mountain", "Altitude", product.farm.altitude],
      ["leaf", "Varietal", product.farm.varietal],
      ["droplet", "Process", product.farm.process],
      ["shield", "Price paid", product.farm.price]
    ];

    $("#farm-grid").innerHTML = facts.map(function (fact) {
      return '<div class="farm-item">' + Icons.render(fact[0]) +
        "<span><b>" + fact[1] + "</b><small>" + fact[2] + "</small></span></div>";
    }).join("");
  }

  /* ---------------------------------------------------------------
     Brew guide + ratio calculator
     --------------------------------------------------------------- */
  function currentBrew() {
    return Store.BREW_METHODS.filter(function (m) { return m.id === state.brewId; })[0];
  }

  function renderBrew() {
    var method = currentBrew();

    $("#brew-tabs").innerHTML = Store.BREW_METHODS.map(function (item) {
      return '<button type="button" class="brew-tab" role="tab" data-brew="' + item.id + '"' +
        ' aria-selected="' + (item.id === state.brewId) + '">' +
        Icons.render(item.icon) + item.label + "</button>";
    }).join("");

    $("#brew-name").textContent = method.label;
    $("#brew-summary").textContent = method.summary;

    $("#brew-recipe").innerHTML = method.steps.map(function (step) {
      return '<div class="recipe__line">' + Icons.render(step.icon) + "<b>" + step.text + "</b></div>";
    }).join("") +
      '<div class="recipe__line">' + Icons.render("coffee") + "<b>" + method.grind + "</b></div>";

    renderCalculator();
  }

  function renderCalculator() {
    var method = currentBrew();
    var dose = Number($("#dose-slider").value);

    $("#calc-dose").textContent = dose + " g";
    $("#calc-water").textContent = Math.round(dose * method.ratio) + " g";
    $("#calc-ratio").textContent = "1:" + method.ratio;
    $("#calc-time").textContent = method.time;
  }

  /* ---------------------------------------------------------------
     Reviews and related products
     --------------------------------------------------------------- */
  function renderReviews() {
    $("#review-score").textContent = product.rating.toFixed(1);
    $("#review-stars").innerHTML = Icons.stars(5);
    $("#review-count").textContent = product.reviewCount + " verified reviews";

    $("#rating-distribution").innerHTML = RATING_DISTRIBUTION.map(function (row) {
      return '<div class="rating-dist__row"><span>' + row[0] + " star</span>" +
        '<span class="rating-dist__track"><i class="rating-dist__fill" style="width:' + row[1] + '%"></i></span>' +
        "<span>" + row[1] + "%</span></div>";
    }).join("");

    $("#review-list").innerHTML = REVIEWS.map(function (review) {
      return '<article class="review">' + Icons.stars(review.stars) +
        "<h4>" + review.title + "</h4><p>" + review.body + "</p>" +
        '<footer><span class="avatar">' + review.name.charAt(0) + "</span>" +
        "<span>" + review.name + " · " +
        '<span class="verified">' + Icons.render("check") + "Verified</span> · " +
        review.variant + " · " + review.date + "</span></footer></article>";
    }).join("");
  }

  function renderRelated() {
    var others = Store.Catalogue.all()
      .filter(function (item) { return item.id !== product.id; })
      .slice(0, 4);

    $("#related-grid").innerHTML = others.map(function (item) {
      return '<a class="related-card" href="index.html?id=' + item.id + '">' +
        '<img src="' + photo(item.images[0], 600) + '" alt="' + item.name + '" loading="lazy">' +
        '<div class="related-card__body"><small>' + item.origin + "</small>" +
        "<h3>" + item.name + "</h3><small>" + item.notes.join(", ") + "</small>" +
        '<span class="related-card__price">' + money(item.price) + "</span></div></a>";
    }).join("");
  }

  /* ---------------------------------------------------------------
     Add to cart
     --------------------------------------------------------------- */
  function addToCart() {
    var size = Store.Catalogue.size(state.sizeId);
    var grind = Store.Catalogue.grind(state.grindId);

    Cart.add({
      id: [product.id, size.id, grind.id, state.plan].join("-"),
      name: product.name,
      meta: size.label + " · " + grind.label +
            (isSubscription() ? " · every " + state.frequencyWeeks + " weeks" : ""),
      price: unitPrice(),
      quantity: state.quantity,
      image: photo(product.images[0], 200),
      isSubscription: isSubscription()
    });

    Cart.open();
  }

  /* ---------------------------------------------------------------
     Events
     --------------------------------------------------------------- */
  function bindEvents() {
    $("#gallery-thumbs").addEventListener("click", function (event) {
      var thumb = event.target.closest("[data-index]");
      if (!thumb) return;
      state.imageIndex = Number(thumb.dataset.index);
      renderGallery();
    });

    $("#gallery-prev").addEventListener("click", function () { stepImage(-1); });
    $("#gallery-next").addEventListener("click", function () { stepImage(1); });

    $("#gallery-zoom").addEventListener("click", function () {
      $("#lightbox-image").src = photo(product.images[state.imageIndex], 1400);
      $("#lightbox").classList.add("is-open");
    });
    $("#lightbox-close").addEventListener("click", function () {
      $("#lightbox").classList.remove("is-open");
    });
    $("#lightbox").addEventListener("click", function (event) {
      if (event.target.id === "lightbox") $("#lightbox").classList.remove("is-open");
    });

    $("#size-options").addEventListener("click", function (event) {
      var option = event.target.closest("[data-size]");
      if (!option) return;
      state.sizeId = option.dataset.size;
      renderOptions();
      renderPrice();
    });

    $("#grind-options").addEventListener("click", function (event) {
      var option = event.target.closest("[data-grind]");
      if (!option) return;
      state.grindId = option.dataset.grind;
      renderOptions();
      renderPrice();
    });

    $("#plan-options").addEventListener("click", function (event) {
      var option = event.target.closest("[data-plan]");
      if (!option) return;
      state.plan = option.dataset.plan;
      renderPlans();
      renderPrice();
    });

    $("#frequency-select").addEventListener("change", function (event) {
      state.frequencyWeeks = event.target.value;
      renderPrice();
    });

    $("#quantity-increase").addEventListener("click", function () {
      state.quantity = Math.min(12, state.quantity + 1);
      renderPrice();
    });
    $("#quantity-decrease").addEventListener("click", function () {
      state.quantity = Math.max(1, state.quantity - 1);
      renderPrice();
    });

    $("#add-to-cart").addEventListener("click", addToCart);
    $("#sticky-add").addEventListener("click", addToCart);

    $("#brew-tabs").addEventListener("click", function (event) {
      var tab = event.target.closest("[data-brew]");
      if (!tab) return;
      state.brewId = tab.dataset.brew;
      renderBrew();
    });
    $("#dose-slider").addEventListener("input", renderCalculator);

    document.querySelectorAll(".accordion__trigger").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var isOpen = trigger.parentElement.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", String(isOpen));
      });
    });

    $("#wishlist-btn").addEventListener("click", function () {
      state.wishlisted = !state.wishlisted;
      $("#wishlist-btn").setAttribute("aria-pressed", String(state.wishlisted));
    });

    // Reveal the sticky buy bar once the main button scrolls out of view.
    new IntersectionObserver(function (entries) {
      var entry = entries[0];
      $("#sticky-bar").classList.toggle(
        "is-visible",
        !entry.isIntersecting && entry.boundingClientRect.top < 0
      );
    }, { threshold: 0 }).observe($("#add-to-cart"));
  }

  /* ---------------------------------------------------------------
     Init
     --------------------------------------------------------------- */
  function init() {
    renderHeader();
    renderGallery();
    renderOptions();
    renderPrice();
    renderDates();
    renderProfile();
    renderBrew();
    renderReviews();
    renderRelated();
    bindEvents();
    Cart.init();
  }

  document.addEventListener("DOMContentLoaded", init);
})(window, document);
