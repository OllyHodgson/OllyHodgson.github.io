/*global $*/
/*global jQuery*/

// Custom selector to find if something is in the viewport
// Adapted from https://stackoverflow.com/a/8897628/13019
jQuery.expr.pseudos.offscreen = function(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.x + rect.width < 0 ||
    rect.y + rect.height < 0 ||
    (rect.x > window.innerWidth || rect.y > window.innerHeight)
  );
};

/*
 * ollyTransition plugin
 * Olly Hodgson, still writing jQuery plugins in November 2018
 *
 * Usage:
 *
 * Add class="olly-transition olly-transition-hidden" to the elements you want to fade in
 * Add class="olly-transition-group" to their parent element
 *
 * Optionally, add data-timeout="1000" data-timeout-increment="500" (you can change the numbers)
 * to the olly-transition-group element to provide a custom delay to the transitions
 *
 * You define the actual transitions in your CSS, e.g.
 *
 * .example-element.olly-transition {
 *     opacity: 1;
 *     transition: all 0.5s ease-out;
 * }
 * .example-element.olly-transition-hidden {
 *     opacity: 0;
 * }
 *
 */
(function($) {
  "use strict";

  // Set up the accordion navigation
  $.fn.ollyTransitionItems = function(options) {
    // This is the easiest way to have default options.
    var settings = $.extend({}, $.fn.ollyTransitionItems.defaults, options);
    var $groups = $(this);
    $groups.each(function() {
      var $group = $(this);
      var customTimeout = $group.data("timeout");
      var customTimeoutIncrement = $group.data("timeoutIncrement");
      if (customTimeout !== undefined && customTimeout !== "") {
        settings.timeout = customTimeout;
      }
      if (
        customTimeoutIncrement !== undefined &&
        customTimeoutIncrement !== ""
      ) {
        settings.timeoutIncrement = customTimeoutIncrement;
      }
      var items = $group
        .find(settings.itemSelector)
        .filter(settings.itemHiddenSelector);
      // Do the transition immediately for things which are on screen
      doTransition(settings, items);
      // Do the transition on scroll for things which are not on screen
      $(window).scroll(function() {
        doTransition(settings, items);
      });
    });
  };

  // These are the defaults.
  $.fn.ollyTransitionItems.defaults = {
    timeout: 0,
    timeoutIncrement: 0,
    itemSelector: ".olly-transition",
    itemHiddenSelector: ".olly-transition-hidden"
  };

  // This removes the settings.itemHiddenSelector class from the elements in items after settings.timeout is reached
  // If there is more than one element, it'll loop through them, starting the next one after settings.timeout + settings.timeoutIncrement is reached
  function doTransition(settings, items) {
    var timeout = settings.timeout;
    for (var i = 0; i < items.length; i++) {
      // :offscreen is a custom selector, see custom.js
      if (!$(items[i]).is(":offscreen")) {
        timeout = timeout + settings.timeoutIncrement;
        //console.info(i, items[i], timeout);
        setTimeout(showItem, timeout, items[i], settings.itemHiddenSelector);
      }
    }
  }

  // Remove the className, which (via the magic of CSS transition) shows the item(s)
  function showItem(el, selector) {
    //console.info(el, selector);
    if (selector.charAt(0) === ".") {
      selector = selector.substr(1);
    }
    $(el).removeClass(selector);
  }
})(jQuery);

/* ********************

The onload function.

******************** */

$(document).ready(function() {
  $(".olly-transition-group").ollyTransitionItems();
});
