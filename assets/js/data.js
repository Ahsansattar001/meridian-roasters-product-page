
(function (window) {
  "use strict";

  /* ---------------------------------------------------------------
     Store configuration
     --------------------------------------------------------------- */
  var CONFIG = {
    freeShippingFrom: 40,
    shippingFee: 4.5,
    subscriptionDiscount: 0.15,
    currency: "$"
  };

  /* ---------------------------------------------------------------
     Helpers
     --------------------------------------------------------------- */
  var Utils = {
    /** Formats a number as a price string. */
    money: function (value) {
      return CONFIG.currency + value.toFixed(2);
    },

  
    photo: function (id, width) {
      return "assets/images/pexels-" + id + ".jpeg";
    },

    /** Shortcut for querySelector. */
    $: function (selector, scope) {
      return (scope || document).querySelector(selector);
    },

    /** Marks the selected item in a radio-style group. */
    syncGroup: function (container, attribute, value) {
      Array.prototype.forEach.call(container.children, function (child) {
        child.setAttribute("aria-checked", String(child.dataset[attribute] === value));
      });
    }
  };

  /* ---------------------------------------------------------------
     Variants
     --------------------------------------------------------------- */
  var SIZES = [
    { id: "250", label: "250 g", multiplier: 1,    grams: 250,  yield: "~16 cups" },
    { id: "500", label: "500 g", multiplier: 1.85, grams: 500,  yield: "~33 cups" },
    { id: "1kg", label: "1 kg",  multiplier: 3.4,  grams: 1000, yield: "~66 cups" }
  ];

  var GRINDS = [
    { id: "whole",   label: "Whole bean", icon: "package" },
    { id: "espresso",label: "Espresso",   icon: "coffee"  },
    { id: "filter",  label: "Filter",     icon: "droplet" },
    { id: "press",   label: "Cafetière",  icon: "coffee"  },
    { id: "moka",    label: "Moka pot",   icon: "coffee"  }
  ];

  var ROAST_FILTERS = [
    { id: "all",    label: "All coffee" },
    { id: "light",  label: "Light roast" },
    { id: "medium", label: "Medium" },
    { id: "dark",   label: "Dark" },
    { id: "decaf",  label: "Decaf" }
  ];

  /* ---------------------------------------------------------------
     Catalogue
     --------------------------------------------------------------- */
  var PRODUCTS = [
    {
      id: "ember",
      name: "Ember Espresso",
      origin: "Brazil · Minas Gerais",
      roast: "dark",
      roastLevel: 0.85,
      price: 19,
      compareAt: 22,
      notes: ["Dark chocolate", "Toasted hazelnut", "Brown sugar"],
      rating: 4.9,
      reviewCount: 412,
      flag: "Best seller",
      popularity: 98,
      daysSinceRoast: 3,
      images: [997670, 5112643, 669162, 4913342],
      blurb: "The shot we pull every morning at the roastery. Built for milk drinks that still taste of coffee, and forgiving enough that a slightly off grind won't ruin your day.",
      cup: { body: 0.9, acidity: 0.3, sweetness: 0.75, balance: 0.85 },
      about: "Roasted 40 seconds past first crack for a sweet, heavy body without the ashy edge of a true dark roast. Sits well for three weeks and takes milk without disappearing.",
      farm: {
        title: "Fazenda Santa Rita, Minas Gerais",
        text: "A third-generation family farm at 1,150m, pulped natural, dried on raised beds for eleven days. We have bought from them five years running.",
        altitude: "1,150 m", varietal: "Yellow Catuaí", process: "Pulped natural", price: "$4.20/kg above C-market"
      }
    },
    {
      id: "sunday",
      name: "Sunday Filter",
      origin: "Ethiopia · Guji",
      roast: "light",
      roastLevel: 0.25,
      price: 22,
      compareAt: 0,
      notes: ["Peach", "Jasmine", "Black tea"],
      rating: 4.8,
      reviewCount: 266,
      flag: "",
      popularity: 91,
      daysSinceRoast: 1,
      images: [11219480, 25811262, 942800, 34382035],
      blurb: "A washed Guji for the mornings you have twenty minutes and a scale. Delicate, floral, and completely wasted on a machine that boils it.",
      cup: { body: 0.45, acidity: 0.85, sweetness: 0.7, balance: 0.8 },
      about: "Dropped just after first crack to keep the florals intact. Best between five days and three weeks off roast.",
      farm: {
        title: "Shakiso washing station, Guji",
        text: "Smallholder deliveries from around Shakiso, washed and dried on beds at 1,950m. Bought through a single exporter we visit each harvest.",
        altitude: "1,950 m", varietal: "Heirloom", process: "Fully washed", price: "$6.10/kg above C-market"
      }
    },
    {
      id: "house",
      name: "Ashwood House",
      origin: "Colombia · Huila",
      roast: "medium",
      roastLevel: 0.55,
      price: 17,
      compareAt: 0,
      notes: ["Red apple", "Caramel", "Cocoa"],
      rating: 4.7,
      reviewCount: 530,
      flag: "",
      popularity: 96,
      daysSinceRoast: 6,
      images: [808504, 4913342, 164622, 5373242],
      blurb: "The bag most people re-order without thinking about it. Works in a cone, a machine or a cafetière, and forgives a grinder that isn't quite dialled in.",
      cup: { body: 0.65, acidity: 0.55, sweetness: 0.8, balance: 0.9 },
      about: "Our everyday roast, dropped mid-way for sweetness that survives milk but keeps enough acidity for filter.",
      farm: {
        title: "Asociación de Pitalito, Huila",
        text: "A 34-member association at 1,700m. Washed, dried in parabolic beds, and remarkably consistent lot to lot.",
        altitude: "1,700 m", varietal: "Caturra, Castillo", process: "Fully washed", price: "$3.80/kg above C-market"
      }
    },
    {
      id: "night",
      name: "Nightshift Decaf",
      origin: "Peru · Cajamarca",
      roast: "decaf",
      roastLevel: 0.6,
      price: 18,
      compareAt: 21,
      notes: ["Fig", "Cane sugar", "Walnut"],
      rating: 4.6,
      reviewCount: 148,
      flag: "Sale",
      popularity: 74,
      daysSinceRoast: 8,
      images: [26985929, 29904782, 4109752, 33490798],
      blurb: "Decaf that people mistake for the house blend. Sugarcane process, which strips the caffeine without stripping the sweetness.",
      cup: { body: 0.7, acidity: 0.4, sweetness: 0.8, balance: 0.85 },
      about: "Roasted slightly darker than the caffeinated lots, because decaffeinated beans take heat faster.",
      farm: {
        title: "Cajamarca smallholders, Peru",
        text: "Organic-certified smallholder lots at 1,800m, decaffeinated with ethyl acetate from sugarcane in Colombia.",
        altitude: "1,800 m", varietal: "Bourbon, Typica", process: "Sugarcane EA decaf", price: "$4.00/kg above C-market"
      }
    },
    {
      id: "cold",
      name: "Slow Cold Brew",
      origin: "Blend · Brazil + Uganda",
      roast: "dark",
      roastLevel: 0.8,
      price: 20,
      compareAt: 0,
      notes: ["Cola", "Molasses", "Low acidity"],
      rating: 4.7,
      reviewCount: 198,
      flag: "",
      popularity: 80,
      daysSinceRoast: 2,
      images: [30663149, 15035227, 942808, 8555658],
      blurb: "Ground coarse and built for an eighteen-hour steep in the fridge. Sweet, heavy, and it doesn't turn sour when you add ice.",
      cup: { body: 0.95, acidity: 0.2, sweetness: 0.85, balance: 0.75 },
      about: "Roasted long and slow to keep the acid down. Order it coarse unless you are grinding it yourself.",
      farm: {
        title: "Two-origin blend",
        text: "70% Brazilian pulped natural for body, 30% Ugandan washed robusta for the cola note and the crema when you cut it with soda.",
        altitude: "1,100–1,400 m", varietal: "Catuaí, SC12", process: "Natural + washed", price: "$3.40/kg above C-market"
      }
    },
    {
      id: "kenya",
      name: "Kirinyaga AA",
      origin: "Kenya · Kirinyaga",
      roast: "light",
      roastLevel: 0.3,
      price: 26,
      compareAt: 0,
      notes: ["Blackcurrant", "Grapefruit", "Syrupy"],
      rating: 4.9,
      reviewCount: 97,
      flag: "New lot",
      popularity: 88,
      daysSinceRoast: 0,
      images: [25811262, 29304794, 669162, 13013307],
      blurb: "The loudest coffee we sell. Blackcurrant that hits before you have finished the first sip, and a body thick enough to carry it.",
      cup: { body: 0.7, acidity: 0.95, sweetness: 0.75, balance: 0.8 },
      about: "A light drop that rewards a scale and a decent grinder. Rest it a full week before you judge it.",
      farm: {
        title: "Kiangoi factory, Kirinyaga",
        text: "AA screen size from a cooperative factory at 1,700m, fermented 36 hours and washed in clean river water.",
        altitude: "1,700 m", varietal: "SL28, SL34, Ruiru 11", process: "Fully washed", price: "$7.40/kg above C-market"
      }
    },
    {
      id: "milk",
      name: "Milk Bar Blend",
      origin: "Guatemala · Antigua",
      roast: "medium",
      roastLevel: 0.62,
      price: 19,
      compareAt: 0,
      notes: ["Malt", "Hazelnut", "Vanilla"],
      rating: 4.8,
      reviewCount: 377,
      flag: "",
      popularity: 93,
      daysSinceRoast: 4,
      images: [27860686, 31711944, 942800, 9170244],
      blurb: "Engineered backwards from a flat white. Malt and hazelnut that push through whole milk instead of vanishing into it.",
      cup: { body: 0.85, acidity: 0.4, sweetness: 0.9, balance: 0.9 },
      about: "Roasted for milk first, black second. Still perfectly good black if you like a sweet, low-acid cup.",
      farm: {
        title: "Finca El Retiro, Antigua",
        text: "Volcanic soil at 1,600m under shade, washed and sun-dried on patios. A stable lot we buy every year.",
        altitude: "1,600 m", varietal: "Bourbon", process: "Fully washed", price: "$4.60/kg above C-market"
      }
    },
    {
      id: "sumatra",
      name: "Sumatra Longberry",
      origin: "Indonesia · Aceh",
      roast: "dark",
      roastLevel: 0.9,
      price: 21,
      compareAt: 0,
      notes: ["Cedar", "Dark cherry", "Earthy"],
      rating: 4.4,
      reviewCount: 83,
      flag: "Low stock",
      popularity: 66,
      daysSinceRoast: 5,
      stock: 4,
      images: [8555658, 33490798, 164622, 23877482],
      blurb: "Divisive on purpose. Wet-hulled, heavy, savoury, and either exactly your thing or absolutely not.",
      cup: { body: 1, acidity: 0.25, sweetness: 0.6, balance: 0.65 },
      about: "Roasted dark to lean into the savoury side. Superb in a cafetière, muddy in a paper cone.",
      farm: {
        title: "Gayo highlands, Aceh",
        text: "Smallholder plots at 1,500m, wet-hulled in the traditional Sumatran way, which is where the cedar and the body come from.",
        altitude: "1,500 m", varietal: "Ateng, Tim Tim", process: "Wet-hulled", price: "$4.90/kg above C-market"
      }
    }
  ];

  /* ---------------------------------------------------------------
     Brew methods (product page calculator)
     --------------------------------------------------------------- */
  var BREW_METHODS = [
    {
      id: "espresso", label: "Espresso", icon: "coffee", ratio: 2, time: "28 s",
      summary: "A short, syrupy shot. Dial the grind until the time lands in range, then leave it alone.",
      grind: "Fine, like table salt",
      steps: [
        { icon: "scale",       text: "18 g in, 36 g out" },
        { icon: "timer",       text: "25–30 seconds" },
        { icon: "thermometer", text: "93 °C brew temperature" }
      ]
    },
    {
      id: "pourover", label: "Pour-over", icon: "droplet", ratio: 16, time: "3:00",
      summary: "Bloom for 40 seconds, then three even pours. Aim to finish the drawdown around three minutes.",
      grind: "Medium, like coarse sand",
      steps: [
        { icon: "scale",       text: "18 g coffee to 290 g water" },
        { icon: "timer",       text: "40 s bloom, 3:00 total" },
        { icon: "thermometer", text: "94 °C, just off the boil" }
      ]
    },
    {
      id: "press", label: "Cafetière", icon: "coffee", ratio: 15, time: "8:00",
      summary: "Steep four minutes, break the crust, skim, then wait another four before plunging gently.",
      grind: "Coarse, like sea salt",
      steps: [
        { icon: "scale",       text: "30 g coffee to 450 g water" },
        { icon: "timer",       text: "4 min steep, 4 min settle" },
        { icon: "thermometer", text: "95 °C" }
      ]
    },
    {
      id: "cold", label: "Cold brew", icon: "droplet", ratio: 8, time: "18 h",
      summary: "Coarse grind, cold water, and time doing the work instead of heat. Strain through cloth, not paper.",
      grind: "Very coarse",
      steps: [
        { icon: "scale",       text: "100 g coffee to 800 g water" },
        { icon: "timer",       text: "18 hours in the fridge" },
        { icon: "thermometer", text: "Cold, no heat at all" }
      ]
    }
  ];

  /* ---------------------------------------------------------------
     Catalogue queries
     --------------------------------------------------------------- */
  var Catalogue = {
    all: function () { return PRODUCTS.slice(); },

    byId: function (id) {
      return PRODUCTS.filter(function (p) { return p.id === id; })[0] || null;
    },

    size: function (id) {
      return SIZES.filter(function (s) { return s.id === id; })[0];
    },

    grind: function (id) {
      return GRINDS.filter(function (g) { return g.id === id; })[0];
    },

    /** Price for a size, with the subscription discount applied if asked for. */
    priceFor: function (product, sizeId, isSubscription) {
      var base = product.price * Catalogue.size(sizeId).multiplier;
      return isSubscription ? base * (1 - CONFIG.subscriptionDiscount) : base;
    },

    /** Filter by roast, then sort. */
    query: function (roastId, sortId) {
      var sorters = {
        popular: function (a, b) { return b.popularity - a.popularity; },
        newest:  function (a, b) { return a.daysSinceRoast - b.daysSinceRoast; },
        priceUp: function (a, b) { return a.price - b.price; },
        priceDn: function (a, b) { return b.price - a.price; },
        rated:   function (a, b) { return b.rating - a.rating; }
      };
      return PRODUCTS
        .filter(function (p) { return roastId === "all" || p.roast === roastId; })
        .sort(sorters[sortId] || sorters.popular);
    }
  };

  window.Store = {
    CONFIG: CONFIG,
    SIZES: SIZES,
    GRINDS: GRINDS,
    ROAST_FILTERS: ROAST_FILTERS,
    BREW_METHODS: BREW_METHODS,
    Catalogue: Catalogue,
    Utils: Utils
  };
})(window);
