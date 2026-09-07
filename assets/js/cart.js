(function (window, document) {
  "use strict";

  var CONFIG = window.Store.CONFIG;
  var money  = window.Store.Utils.money;
  var $      = window.Store.Utils.$;

  /** @type {Array<{id,name,meta,price,quantity,image,isSubscription}>} */
  var lines = [];

  /* ---------------------------------------------------------------
     Overlays
     --------------------------------------------------------------- */
  var Overlay = {
    open: function (element) {
      element.classList.add("is-open");
      element.setAttribute("aria-hidden", "false");
      $("#scrim").classList.add("is-open");
    },

    close: function (element) {
      element.classList.remove("is-open");
      element.setAttribute("aria-hidden", "true");
      if (!document.querySelector(".drawer.is-open, .sheet.is-open")) {
        $("#scrim").classList.remove("is-open");
      }
    },

    closeAll: function () {
      document.querySelectorAll(".drawer.is-open, .sheet.is-open").forEach(function (el) {
        el.classList.remove("is-open");
        el.setAttribute("aria-hidden", "true");
      });
      var lightbox = $("#lightbox");
      if (lightbox) lightbox.classList.remove("is-open");
      $("#scrim").classList.remove("is-open");
    }
  };

  /* ---------------------------------------------------------------
     Totals
     --------------------------------------------------------------- */
  function totals() {
    var subtotal = lines.reduce(function (sum, line) {
      return sum + line.price * line.quantity;
    }, 0);

    var saved = lines
      .filter(function (line) { return line.isSubscription; })
      .reduce(function (sum, line) {
        var fullPrice = line.price / (1 - CONFIG.subscriptionDiscount);
        return sum + (fullPrice - line.price) * line.quantity;
      }, 0);

    var shipping = (subtotal === 0 || subtotal >= CONFIG.freeShippingFrom) ? 0 : CONFIG.shippingFee;

    return {
      subtotal: subtotal,
      saved: saved,
      shipping: shipping,
      total: subtotal + shipping
    };
  }

  /* ---------------------------------------------------------------
     Rendering
     --------------------------------------------------------------- */
  function renderShippingMeter(subtotal) {
    var remaining = CONFIG.freeShippingFrom - subtotal;
    var label = remaining > 0
      ? money(remaining) + " away from free shipping"
      : "Free shipping unlocked";
    var percent = Math.min(100, (subtotal / CONFIG.freeShippingFrom) * 100);

    return '<div class="meter"><span>' + label + "</span>" +
           '<span class="meter__track"><i class="meter__fill" style="width:' + percent + '%"></i></span></div>';
  }

  function renderEmptyState() {
    $("#cart-lines").innerHTML =
      '<div class="cart-empty">' + window.Icons.render("bag", "icon icon--lg") +
      "<strong>Your bag is empty</strong>" +
      "<p>Pick a size and a grind — it takes about ten seconds.</p></div>";

    $("#cart-summary").innerHTML =
      '<button type="button" class="btn btn--block" data-continue>Keep looking</button>';
  }

  function renderLines() {
    $("#cart-lines").innerHTML = lines.map(function (line) {
      return '<div class="cart-line">' +
        '<img src="' + line.image + '" alt="" loading="lazy">' +
        "<div>" +
          '<span class="cart-line__name">' + line.name + "</span>" +
          '<small class="cart-line__meta">' + line.meta + "</small>" +
          '<span class="stepper stepper--sm">' +
            '<button type="button" data-decrease="' + line.id + '" aria-label="Remove one ' + line.name + '">' +
              window.Icons.render("minus") + "</button>" +
            '<span class="stepper__value">' + line.quantity + "</span>" +
            '<button type="button" data-increase="' + line.id + '" aria-label="Add one ' + line.name + '">' +
              window.Icons.render("plus") + "</button>" +
          "</span>" +
          '<button type="button" class="cart-line__remove" data-remove="' + line.id + '">Remove</button>' +
        "</div>" +
        "<b>" + money(line.price * line.quantity) + "</b>" +
      "</div>";
    }).join("");
  }

  function renderSummary() {
    var t = totals();

    $("#cart-summary").innerHTML =
      renderShippingMeter(t.subtotal) +
      '<div class="summary-row"><span>Subtotal</span><span>' + money(t.subtotal) + "</span></div>" +
      (t.saved
        ? '<div class="summary-row summary-row--discount"><span>Subscription saving</span><span>−' + money(t.saved) + "</span></div>"
        : "") +
      '<div class="summary-row"><span>Shipping</span><span>' + (t.shipping ? money(t.shipping) : "Free") + "</span></div>" +
      '<div class="summary-row summary-row--total"><span>Total</span><span>' + money(t.total) + "</span></div>" +
      '<button type="button" class="btn btn--block" data-checkout>Checkout ' + window.Icons.render("arrow") + "</button>" +
      '<p class="summary-note">Roasted to order · dispatched within 24 hours</p>';
  }

  function render() {
    var count = lines.reduce(function (sum, line) { return sum + line.quantity; }, 0);
    $("#cart-count").textContent = count;

    if (!lines.length) {
      renderEmptyState();
      return;
    }
    renderLines();
    renderSummary();
  }

  /* ---------------------------------------------------------------
     Mutations
     --------------------------------------------------------------- */
  function add(line) {
    var existing = lines.filter(function (l) { return l.id === line.id; })[0];
    if (existing) {
      existing.quantity += line.quantity;
    } else {
      lines.push(line);
    }
    render();
  }

  function changeQuantity(id, delta) {
    var line = lines.filter(function (l) { return l.id === id; })[0];
    if (!line) return;
    line.quantity += delta;
    if (line.quantity < 1) remove(id);
    else render();
  }

  function remove(id) {
    lines = lines.filter(function (line) { return line.id !== id; });
    render();
  }

  /* ---------------------------------------------------------------
     Wiring
     --------------------------------------------------------------- */
  function init() {
    var drawer = $("#cart-drawer");

    $("#cart-open").addEventListener("click", function () { Overlay.open(drawer); });
    $("#cart-close").addEventListener("click", function () { Overlay.close(drawer); });
    $("#scrim").addEventListener("click", Overlay.closeAll);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") Overlay.closeAll();
    });

    $("#cart-lines").addEventListener("click", function (event) {
      var increase = event.target.closest("[data-increase]");
      var decrease = event.target.closest("[data-decrease]");
      var removeBtn = event.target.closest("[data-remove]");

      if (increase)  changeQuantity(increase.dataset.increase, 1);
      if (decrease)  changeQuantity(decrease.dataset.decrease, -1);
      if (removeBtn) remove(removeBtn.dataset.remove);
    });

    $("#cart-summary").addEventListener("click", function (event) {
      if (event.target.closest("[data-continue]")) {
        Overlay.close($("#cart-drawer"));
      }
    });

    render();
  }

  window.Cart = {
    init: init,
    add: add,
    open: function () { Overlay.open($("#cart-drawer")); },
    totals: totals,
    Overlay: Overlay
  };
})(window, document);
