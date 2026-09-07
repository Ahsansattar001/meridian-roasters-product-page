
(function (window, document) {
  "use strict";

  /** Icon path data on a 24x24 grid, stroke-based. */
  var PATHS = {
    bag:          '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    search:       '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>',
    menu:         '<path d="M3 6h18M3 12h18M3 18h18"/>',
    heart:        '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>',
    star:         '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/>',
    truck:        '<path d="M14 17V5a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1"/><path d="M14 8h4l3 3v6h-2"/><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M8 17h7"/>',
    leaf:         '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
    calendar:     '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    rotate:       '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
    check:        '<path d="m20 6-11 11-5-5"/>',
    close:        '<path d="M18 6 6 18M6 6l12 12"/>',
    plus:         '<path d="M12 5v14M5 12h14"/>',
    minus:        '<path d="M5 12h14"/>',
    arrow:        '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronLeft:  '<path d="m15 18-6-6 6-6"/>',
    chevronDown:  '<path d="m6 9 6 6 6-6"/>',
    coffee:       '<path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 1v3M10 1v3M14 1v3"/>',
    pin:          '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/>',
    droplet:      '<path d="M12 2.7 17.7 8.4a8 8 0 1 1-11.3 0Z"/>',
    package:      '<path d="M16.5 9.4 7.5 4.2"/><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    timer:        '<circle cx="12" cy="14" r="8"/><path d="M12 10v4M9 2h6"/>',
    thermometer:  '<path d="M14 14.8V3.5a2.5 2.5 0 0 0-5 0v11.3a4 4 0 1 0 5 0Z"/>',
    scale:        '<path d="M12 3v18M5 7h14"/><path d="M5 7 2 14a3 3 0 0 0 6 0Z"/><path d="M19 7l-3 7a3 3 0 0 0 6 0Z"/>',
    mountain:     '<path d="m8 3 4 8 5-5 6 15H2Z"/>',
    shield:       '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
    zoom:         '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>',
    instagram:    '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>',
    facebook:     '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z"/>',
    mail:         '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>'
  };

  /** Builds the hidden sprite once and appends it to <body>. */
  function injectSprite() {
    if (document.getElementById("icon-sprite")) return;

    var symbols = Object.keys(PATHS).map(function (name) {
      return '<symbol id="icon-' + name + '" viewBox="0 0 24 24">' + PATHS[name] + "</symbol>";
    });

    var host = document.createElement("div");
    host.id = "icon-sprite";
    host.setAttribute("aria-hidden", "true");
    host.style.display = "none";
    host.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + symbols.join("") + "</svg>";
    document.body.appendChild(host);
  }

  window.Icons = {
    /**
     * @param {string} name              key from PATHS
     * @param {string} [className=icon]  class applied to the <svg>
     * @returns {string} inline markup referencing the sprite
     */
    render: function (name, className) {
      return '<svg class="' + (className || "icon") + '" aria-hidden="true">' +
             '<use href="#icon-' + name + '"></use></svg>';
    },

    /** A row of filled stars. */
    stars: function (count) {
      return '<span class="stars">' +
        this.render("star", "icon icon--fill").repeat(count || 5) +
        "</span>";
    },

    inject: injectSprite
  };

  injectSprite();
})(window, document);
