describe("whirligig", function() {
  var $carousel, $items, addEventListenerSpy;

  var setupCarousel = function(options) {
    options = options || {};
    expect($carousel.whirligig(options)).toEqual($carousel);
  };

  function touchStart(options) {
    options = options || {};
    addEventListenerSpy.calls[0].args[1](options);
  }
  function touchMove(options) {
    options = options || {};
    addEventListenerSpy.calls[2].args[1](options);
  }
  function touchEnd(options) {
    options = options || {};
    addEventListenerSpy.calls[1].args[1](options);
  }

  beforeEach(function() {
    $("#jasmine_content").html('  <section id="carousel_container">'+
      '<a href="#"><img src="1.png"/></a>' +
      '<a href="#"><img src="2.png"/></a>' +
      '<a href="#"><img src="3.png"/></a>' +
      '</section>');

    $carousel = $("#carousel_container").whirligig();
    $items = $carousel.children();
    $items.find("img").width(500);

    addEventListenerSpy = spyOn($carousel[0], "addEventListener");

    spyOn($.fn, "landscape").andCallFake(function() { return this; });
    spyOn($.fn, "portrait").andCallFake(function() { return this; });
  });

  describe("#carousel", function() {
    it("sets up the expected css", function() {
      setupCarousel();

      expect($carousel.hasClass("whirligig")).toBe(true);
      expect($carousel.css("overflow-y")).toEqual("hidden");
      expect($carousel.css("overflow-x")).toEqual("auto");
      expect($carousel.css("width")).toEqual("1500px");

      expect($items.css("float")).toEqual("left");
    });

    it("listens to the expected events", function() {
      setupCarousel();

      expect(addEventListenerSpy).wasCalled();
      expect(addEventListenerSpy.calls.length).toEqual(3);
      expect(addEventListenerSpy.calls[0].args[0]).toEqual('touchstart');
      expect(addEventListenerSpy.calls[1].args[0]).toEqual('touchend');
      expect(addEventListenerSpy.calls[2].args[0]).toEqual('touchmove');
    });

    describe("when dragging", function() {


      it("animates and sets the transform position to where it should be", function() {
        setupCarousel();
        touchStart({touches: [{pageX: 5}]});
        touchMove({touches: [{pageX: 10}]});
        expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(5px, 0px, 0px)");
        touchEnd({changedTouches: [{pageX: 10}]});
        expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(5px, 0px, 0px)");
      });

      describe("when the threshold option is set", function() {
        it("does not move until theshold is exceeded, and moves by a reduced amount when threshold is exceeded", function() {
          setupCarousel({threshold: 7});
          touchStart({touches: [{pageX: 5}]});
          expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(0px, 0px, 0px)");
          touchMove({touches: [{pageX: 7}]});
          expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(0px, 0px, 0px)");
          touchMove({touches: [{pageX: 15}]});
          expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(3px, 0px, 0px)");
          touchEnd({changedTouches: [{pageX: 15}]});
        });
      });

      describe("when the itemWidth option is set", function() {
        var distance;
        beforeEach(function () {
          distance = 100;
          setupCarousel({itemWidth: distance, minDistance: 251});
          touchStart({touches: [{pageX: 0}]});
          touchMove({touches: [{pageX: -300}]});
          touchEnd({changedTouches: [{pageX: -300}]});
        });
        it("animates and sets the transform position to set itemWidth", function() {
          expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(" + -distance + "px, 0px, 0px)");
        });
        describe("when the orientation has changed to landscape", function() {
          it("translates to the set itemWidth", function() {
            expect($.fn.landscape).wasCalled();
            $.fn.landscape.mostRecentCall.args[0]();
            expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(" + -distance + "px, 0px, 0px)");
          });
        })
      });

      describe("when the orientation has changed to landscape", function() {
        beforeEach(function() {
          setupCarousel({minDistance: 1});
          expect($.fn.landscape).wasCalled();
          $items.find("img").width(1000);
          $.fn.landscape.mostRecentCall.args[0]();
        });
        it("updates the size of item", function() {
          touchStart({touches: [{pageX: 0}]});
          touchMove({touches: [{pageX: -2}]});
          touchEnd({changedTouches: [{pageX: -2}]});

          expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(-1000px, 0px, 0px)");
        });
      });

      describe("when you have dragged enough", function() {
        beforeEach(function() {
          setupCarousel({minDistance: 251});
        });

        describe("when position changes", function() {
          var carouselChange, position;
          beforeEach(function() {
            carouselChange = false;
            $(document).bind("whirligig.change", function(e, p) {
              carouselChange = true;
              position = p;
            });

            expect($items.eq(0).width()).toEqual(500);

            touchStart({touches: [{pageX: 0}]});
            touchMove({touches: [{pageX: -251}]});
            touchEnd({changedTouches: [{pageX: -251}]});
          });
          it("should snap to the carousel next item", function() {
            expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(-500px, 0px, 0px)");
          });
          it("fires whirligig.change event on document", function() {
            expect(carouselChange).toBe(true);
            expect(position).toEqual(1);
          });
        });

        describe("when you are at the beginning", function() {
          it("should snap back to the first carousel item", function() {
            touchStart({touches: [{pageX: 0}]});
            touchMove({touches: [{pageX: 251}]});
            touchEnd({changedTouches: [{pageX: 251}]});

            expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(0px, 0px, 0px)");
          });
        });

        describe("when you are at the end", function() {
          it("should snap back to the last carousel item", function() {
            /* TODO: Need to investigate whether or not the DOM updates as expected */
          });
        });
      });

      describe("when you have not dragged enough", function() {
        it("should snap back to the original carousel item", function() {
          setupCarousel({minDistance: 250});

          expect($items.eq(0).width()).toEqual(500);

          touchStart({touches: [{pageX: 0}]});
          touchMove({touches: [{pageX: -249}]});
          touchEnd({changedTouches: [{pageX: 249}]});

          expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(0px, 0px, 0px)");
        });
      });
    });

    describe("when snapping", function() {
      beforeEach(function() {
        setupCarousel({snap: 10});
        expect($items.eq(0).width()).toEqual(500);
      });
      it("should advance when snapped", function() {
        touchStart({touches: [{pageX: 0}]});
        touchMove({touches: [{pageX: -20}]});
        touchMove({touches: [{pageX: -40}]});
        touchEnd({changedTouches: [{pageX: -40}]});
        expect($items.css("-webkit-transition")).toEqual("-webkit-transform 200ms ease-in-out");
        expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(-500px, 0px, 0px)");
      });

      it("not advance when not snapped", function() {
        touchStart({touches: [{pageX: 0}]});
        touchMove({touches: [{pageX: -20}]});
        touchMove({touches: [{pageX: -25}]});
        touchEnd({changedTouches: [{pageX: -25}]});
        expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(0px, 0px, 0px)");

      });

      it("should change the speed of the transition based on touch input", function() {
        var nowCalled = 0;
        spyOn(Date, "now").andCallFake(function() {
          switch(nowCalled++) {
            case 0:
              return 0;
            case 1:
              return 300;
            case 2:
              return 600;
          }
        });
        touchStart({touches: [{pageX: 0}]});
        touchMove({touches: [{pageX: -20}]});
        touchMove({touches: [{pageX: -45}]});
        touchEnd({changedTouches: [{pageX: -45}]});
        expect($items.css("-webkit-transition")).toEqual("-webkit-transform 300ms ease-in-out");
      });
    });

    describe("events", function() {
      describe("whirligig.advanceRight", function() {
        it("advances to the right when the event is triggered", function() {
          setupCarousel({minDistance: 1});
          expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(0px, 0px, 0px)");
          $carousel.trigger("whirligig.advanceRight");
        });
      });
      describe("whirligig.advanceLeft", function() {
        it("advances to the left when the event is triggered", function() {
          setupCarousel({minDistance: 1});
          $carousel.trigger("whirligig.advanceRight");
          expect($items.css("-webkit-transform")).toEqual("translate3d(0px, 0px, 0px) translate3d(-500px, 0px, 0px)");
          $carousel.trigger("whirligig.advanceLeft");
          expect($items.css("-webkit-transform")).toEqual("translate3d(-500px, 0px, 0px) translate3d(500px, 0px, 0px)");
        });
      });
    });

    describe("when autoadvance enabled", function() {
      beforeEach(function() {
        jasmine.Clock.useMock();
        jasmine.Clock.reset();
        $.fx.off = true;        
        setupCarousel({autoAdvance: 1000, itemWidth: 500});
      });

      it("should trigger advanceRight every specified interval", function() {
        expect($items.eq(0).position().left).toBe(0);
        jasmine.Clock.tick(1000);

        expect($items.eq(0).position().left).toBeLessThan(0);
      });

      it("should stop at the end of the carousel", function() {
        expect($items.first().position().left).toBe(0);
        jasmine.Clock.tick(10000);
        expect($items.css("-webkit-transform")).toEqual("translate3d(-1000px, 0px, 0px)");
      });

      it("should stop if significant touch activity occurs", function() {
        expect($items.eq(0).position().left).toBe(0);

        touchStart({touches: [{pageX: 0}]});
        touchMove({touches: [{pageX: -20}]});
        touchMove({touches: [{pageX: -40}]});
        touchEnd({changedTouches: [{pageX: -40}]});

        var selectedPosition = $items.eq(0).position().left;
        jasmine.Clock.tick(10000);
        expect($items.eq(0).position().left).toBe(selectedPosition);
      });
    });
  });
});