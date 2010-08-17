/*
 jQuery Orientation Touch
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
;(function($) {
  var listeners = [];

  addEventListener('orientationchange', function(e) {
    for (var i in listeners) {
      if (listeners.hasOwnProperty(i)) {
        listeners[i].trigger("orientation.change");
      }
    }
  }, false);
  addEventListener('DOMNodeRemoved', function(e) {
    var index = listeners.indexOf(e.target);
    if (index != -1) {
      listeners = listeners.splice(index, 0);  
    }
  }, false);

  $.extend({
      orientation: {
      triggerOrientationChange: function(angle) {
        window.__defineGetter__('orientation', function() {return angle;});
        var event = document.createEvent('HTMLEvents');
        event.initEvent('orientationchange');
        window.dispatchEvent(event);
      }
    }
  });

  $.fn.extend({
    portrait: function(handler) {
      var self = this;
      if (listeners.indexOf(this) == -1) {
        listeners.push(this);
      }
      this.bind("orientation.change", function() {
        if (window.orientation % 180 == 0) {
          handler.call(self);
        }
      }).trigger("orientation.change");
      return this;
    },
    landscape: function(handler) {
      var self = this;
      if (listeners.indexOf(this) == -1) {
        listeners.push(this);
      }
      this.bind("orientation.change", function() {
        if (Math.abs(window.orientation) == 90) {
          handler.call(self);
        }
      }).trigger("orientation.change");
      return this;
    }
  });
})(jQuery);
