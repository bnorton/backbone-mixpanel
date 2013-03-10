describe("Backbone.Mixpanel", function () {
  var bbm, options;

  var initialize = function() {
    bbm = Backbone.Mixpanel.init(options);
  };

  beforeEach(function () {
    window.mixpanel = jasmine.createSpyObj("mixpanel", ["init", "track", "register", "name_tag"]);

    options = { token: "abc123",  customData: ['id', 'desc']};
  });

  describe(".initialize", function () {
    beforeEach(function () {
      options = {
        token: "abc123",
        userInfo: { id: 45, paid: true },
        nameTag: "Foo-Bar"
      };

      initialize();
    });

    it("should initialize the mixpanel js", function () {
      expect(mixpanel.init).toHaveBeenCalledWith("abc123");
    });

    it("should set the user information", function () {
      expect(mixpanel.register).toHaveBeenCalledWith({ id: 45, paid: true });
    });

    it("should set a name tag", function () {
      expect(mixpanel.name_tag).toHaveBeenCalledWith("Foo-Bar");
    });

    describe("when mixpanel is not defined", function () {
      beforeEach(function () {
        window.mixpanel = undefined;
      });

      it("should not error", function () {
        expect(function() { initialize() }).not.toThrow();
      });
    });

    describe("when not given a token", function () {
      var message;

      beforeEach(function () {
        message = "Backbone.Mixpanel.init requires the mixpanel token from your account.";

        delete options.token;
      });

      it("should error", function () {
        expect(function() { initialize() }).toThrow(message);
      });
    });
  });

  describe("#wrapEvent", function () {
    var func, wrapped, event;

    beforeEach(function () {
      initialize();

      spyOn(bbm, "trackEvent");
      func = jasmine.createSpy("Function");

      wrapped = bbm.wrapEvent(func, "the default value");
      event = jasmine.createSpy("Event");
    });

    describe("when not given a function", function () {
      it("should error", function () {
         expect(function() { bbm.wrapEvent() }).toThrow("Wrapping requires a function to wrap");
      });
    });

    describe("when not given a default value", function () {
      it("should error", function () {
         expect(function() { bbm.wrapEvent(func) }).toThrow("Wrapping requires a default description");
      });
    });

    it("should return a function that wraps the original function", function () {
      wrapped({});
      expect(func).toHaveBeenCalled();
    });

    it("should track the event", function () {
      wrapped({});
      expect(bbm.trackEvent).toHaveBeenCalled();
    });

    describe("for the description", function () {
      describe("when the event's target has a data attribute", function () {
        beforeEach(function () {
          event.currentTarget = '<div data-event="Foo Event :)"></div>';

          wrapped(event);
        });

        it("should log the event text", function () {
          expect(bbm.trackEvent).toHaveBeenCalledWith("Foo Event :)", {});
        });
      });

      describe("when the event's target does not have a data attribute", function () {
        beforeEach(function () {
          event.currentTarget = '<div data-invalid=":/"></div>';

          wrapped(event);
        });

        it("should log the default description", function () {
          expect(bbm.trackEvent).toHaveBeenCalledWith("the default value", {});
        });
      });
    });

    describe("for the additional data", function () {
      describe("when the event's target has a metadata attribute", function () {
        beforeEach(function () {
          event.currentTarget = '<div data-id="THE ID"></div>';

          wrapped(event);
        });

        it("should log custom id", function () {
          expect(bbm.trackEvent.mostRecentCall.args[1].id).toEqual("THE ID");
        });

        describe("when the event's target has multiple metadata attributes", function () {
          beforeEach(function () {
            event.currentTarget = '<div data-id="12" data-desc="A Description!"></div>';

            wrapped(event);
          });

          it("should log custom attributes", function () {
            expect(bbm.trackEvent.mostRecentCall.args[1].id).toEqual(12);
            expect(bbm.trackEvent.mostRecentCall.args[1].desc).toEqual("A Description!");
          });
        });
      });
    });
  });

  describe("#trackEvent", function () {
    beforeEach(function () {
      initialize();
    });

    it("should track the given string", function () {
      bbm.trackEvent("Some Text");

      expect(mixpanel.track).toHaveBeenCalledWith("Some Text", {});
    });

    it("should track the default extra information", function () {
      bbm.trackEvent(null);

      expect(mixpanel.track).toHaveBeenCalledWith(null, {});
    });

    it("should track the extra information", function () {
      bbm.trackEvent(null, {extra: 'info', key: 'value'});

      expect(mixpanel.track).toHaveBeenCalledWith(null, {extra: 'info', key: 'value'});
    });
  });

  describe("#delegateEvents", function () {
    var view,
        delegate = function() {
          bbm.delegateEvents.call(view);
        };

    beforeEach(function () {
      initialize();
    });

    describe("when the view has no events", function () {
      beforeEach(function () {
        view = {};
      });

      it("should not error", function () {
        expect(function() { delegate() }).not.toThrow();
      });
    });

    describe("when the view has an events hash", function () {
      beforeEach(function () {
        view = {
          $el: { on: function() {} },
          undelegateEvents: function() {},
          events: {
            "click .some-class": "clickSomeClass"
          }
        };
      });

      it("should error (no method on the view)", function () {
        expect(function() { delegate() }).toThrow("Method \"clickSomeClass\" does not exist");
      });

      describe("when the method exists", function () {
        var method;

        beforeEach(function () {
          spyOn(bbm, 'wrapEvent').andCallThrough();

          method = function() { return "hey" };
          view.clickSomeClass = method;
        });

        it("should not error", function () {
          expect(function() { delegate() }).not.toThrow();
        });

        it("should wrap the error", function () {
          delegate();

          expect(bbm.wrapEvent).toHaveBeenCalledWith(method, "click .some-class");
        });
      });
    });
  });
});
