/*
 jQuery Whirligig Touch
 http://thebolditalic.com

 Copyright (c) 2010 Gannett

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
(function($) {
  $.fn.extend({
    whirligig: function(options) {
      options = options || {};
      var $self = $(this).addClass("whirligig");
      var $items = $self.children().css({float: "left"});
      $self.css({
        "overflow-y": "hidden",
        "overflow-x": "auto",
        "width": $items.length * $items.outerWidth(true) + "px"
      });

      var startX, startTime;
      var x = 0;
      var xValues;

      var itemWidth = options.itemWidth;

      function updateItemWidth() {
        var position = itemWidth ? Math.abs(x / itemWidth) : 0;

        if (!options.itemWidth) {
          itemWidth = $items.eq(position).width();
        }

        x = position * -itemWidth;
        $self.css({
          "width": $items.length * $items.outerWidth(true) + "px"
        });
        $items.css({
          "-webkit-transition": null,
          "-webkit-transform": "translate3d(0,0,0) translate3d(" + x + "px,0,0)"
        });
      }

      function updateXOffset(dx, lastDx) {
        if(lastDx == undefined) { lastDx = dx; }
        var dt = Date.now() - (startTime || 0);

        if (options.snap) {
          if (Math.abs(lastDx) >= options.snap) {
            dx = (dx > 0 ? 1 : -1) * itemWidth;
          }
          else {
            dx = 0;
          }
        }

        if (options.minDistance) {
          if (Math.abs(dx) >= options.minDistance) {
            dx = (dx > 0 ? 1 : -1) * itemWidth;
          }
          else {
            dx = 0;
          }
        }

        if (x + dx == itemWidth) {
          dx = 0;
        }
        if (Math.abs(x + dx) > itemWidth * ($items.length - 1)) {
          dx = 0;
        }

        if ($.fx.off) {
          $items.css({
            "-webkit-transition": null,
            "-webkit-transform": "translate3d(" + dx + "px,0,0)"
          });
        } else {
          $items.css({
            "-webkit-transition": "-webkit-transform " + Math.min(500, Math.max(200, dt)) + "ms ease-in-out",
            "-webkit-transform": "translate3d(" + x + "px,0,0) translate3d(" + dx + "px,0,0)"
          });
        }

        x += dx;
        $(document).trigger("whirligig.change", [itemWidth ? Math.abs(x / itemWidth) : 0]);
      }

      function touchStart(event) {
        if (options.stopPropagation) {
          event.stopPropagation();
        }
        startX = event.touches[0].pageX;
        startTime = Date.now();
        xValues = [];
      }

      function touchEnd(event) {
        var lastDx = xValues.length > 1 ? xValues[xValues.length-1] - xValues[xValues.length-2] : null;
        updateXOffset(event.changedTouches[0].pageX - startX, lastDx);
      }

      function touchMove(event) {
        var dx = event.touches[0].pageX - startX;
        xValues.push(dx);
        if (options.threshold) {
          if (Math.abs(dx) < options.threshold) {
            dx = 0;
          } else {
            dx = dx > 0 ? dx - options.threshold : dx + options.threshold;
          }
        }
        $items.css({
          "-webkit-transition": null,
          "-webkit-transform": "translate3d(" + x + "px,0,0) translate3d(" + dx + "px,0,0)"
        });
      }

      updateItemWidth();
      $self.landscape(updateItemWidth).portrait(updateItemWidth).each(function() {
        this.addEventListener('touchstart', touchStart, false);
        this.addEventListener('touchend', touchEnd, false);
        this.addEventListener('touchmove', touchMove, false);
      }).bind("whirligig.advanceRight", function() {
        if (options.itemWidth) {
          itemWidth = options.itemWidth;
        }
        updateXOffset(-itemWidth);
      }).bind("whirligig.advanceLeft", function() {
        if (options.itemWidth) {
          itemWidth = options.itemWidth;
        }
        updateXOffset(itemWidth);
      });

      return this;
    }
  });
})(jQuery);