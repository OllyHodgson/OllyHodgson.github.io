/*global $*/
/*global jQuery*/

/*

Is the element offscreen?
Shamelessly copied from https://stackoverflow.com/a/8897628

*/
jQuery.expr.pseudos.offscreen = function(element) {
  var rect = element.getBoundingClientRect();
  return (
    rect.x + rect.width < 0 ||
    rect.y + rect.height < 0 ||
    rect.x > window.innerWidth ||
    rect.y > window.innerHeight
  );
};

/*

jQ plugin to transition elements when scrolled into view

*/
(function($, window) {
  "use strict";

  // Create the defaults once
  var pluginName = "ohTransitionGroup",
    defaults = {
      timeout: 750,
      timeoutIncrement: 250,
      itemSelector: ".oh-transition",
      itemHiddenSelector: ".oh-transition-hidden"
    };

  // The actual plugin constructor
  function Plugin(element, options) {
    this.element = element;

    // jQuery has an extend method that merges the
    // contents of two or more objects, storing the
    // result in the first object. The first object
    // is generally empty because we don't want to alter
    // the default options for future instances of the plugin
    this.options = $.extend({}, defaults, options);

    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  }

  Plugin.prototype = {
    init: function() {
      // Place initialization logic here
      // You already have access to the DOM element and
      // the options via the instance, e.g. this.element
      // and this.options
      // you can add more functions like the one below and
      // call them like so: this.yourOtherFunction(this.element, this.options).
      var that = this;
      $(this.element).each(function(i, el) {
        var opts = that.options,
          $el = $(el),
          timeout = $el.data("timeout"),
          n = $el.data("timeoutIncrement");
        if (timeout !== 0 && timeout !== "") {
          opts.timeout = timeout;
        }
        if (n !== 0 && n !== "") {
          opts.timeoutIncrement = n;
        }
        var $relevantElements = $el.find(opts.itemSelector).filter(opts.itemHiddenSelector);

        that.checkIfOnScreen(opts, $relevantElements);
        $(window).scroll(function() {
          that.checkIfOnScreen(opts, $relevantElements);
        });
      });
    },

    checkIfOnScreen: function(opts, el) {
      for (var n = opts.timeout, i = 0; i < el.length; i++) {
        $(el[i]).is(":offscreen") ||
          ((n += opts.timeoutIncrement),
          setTimeout(this.r, n, el[i], opts.itemHiddenSelector));
      }
    },

    r: function(t, e) {
      "." === e.charAt(0) && (e = e.substr(1)), $(t).removeClass(e);
    }
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      }
    });
  };
})(jQuery, window);

/* ********************

The onload function.

******************** */

$(document).ready(function() {
  $(".oh-transition-group").ohTransitionGroup();
});
