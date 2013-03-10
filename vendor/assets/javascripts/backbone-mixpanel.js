Backbone.View.originalDelegateEvents = Backbone.View.prototype.delegateEvents;

Backbone.Mixpanel = (function() {
  var self = {},
      defaultOptions = {
        token: null,
        enabled: false,
        eventDataAttr: 'event',
        customData: [],
        userInfo: {},
        nameTag: ''
      },
      options = {};

  // setup the Mixpanel environment
  self.init = function(opts) {
    _.extend(options, defaultOptions, opts || {});

    if(!options.token) {
      throw new Error("Backbone.Mixpanel.init requires the mixpanel token from your account.");
    }

    initialize();

    return self;
  };

  // Returns a function that tracks to mixpanel and calls the original method
  //   method - (required) The method to handle an DOM event after tracking
  self.wrapEvent = function(method, defaultDescription) {
    if(!_.isFunction(method)) throw new Error("Wrapping requires a function to wrap");
    if(!defaultDescription) throw new Error("Wrapping requires a default description");

    return function(event) {
      var data = {},
          $target = $(event.currentTarget),
          description = $target.data(options.eventDataAttr) || defaultDescription;

      _(options.customData).each(function(key) {
        var item = $target.data(key);

        if(item) data[key] = item;
      });

      self.trackEvent(description, data);

      method.apply(this, arguments);
    }
  };

  // Track events to mixpanel when enabled and mixpanel is available
  //   desc - (required) The description of the event
  //   data - (optional) Any additional data included in the event
  self.trackEvent = function(desc, data) {
    data || (data = {});

    // where the magic happens.
    mixpanel.track(desc, data);
  };

  self.delegateEvents = function(events) {
    if (!(events || (events = _.result(this, 'events')))) return;

    for(var key in events) {
      var method = events[key];
      if(!_.isFunction(method)) method = this[method];
      if(!method) throw new Error('Method "' + events[key] + '" does not exist');

      var wr = self.wrapEvent(method, key);
      events[key] = wr;

      Backbone.View.originalDelegateEvents.call(this, events);
    }
  };

  // Replace the delegateEvents function so that we can wrap each of the event
  //  handlers given via the events hash/function
  Backbone.View.prototype.delegateEvents = self.delegateEvents;

  return self;

  // Setup the Mixpanel Javascript and initialize it with the Mixpanel token.
  function initialize() {
    window.mixpanel || (window.mixpanel = []);

    var noop = function() {};

    // Register the functions that we use internally to do nothing
    if(!options.enabled) {
      _.defaults(window.mixpanel, { init: noop, register: noop, name_tag: noop, track: noop });
    }

    if(options.enabled) loadMixpanel();

    mixpanel.init(options.token);
    mixpanel.register(options.userInfo);
    mixpanel.name_tag(options.nameTag);
  }

  function loadMixpanel() {
    (function(c,a){
      window.mixpanel=a;var b,d,h,e;b=c.createElement('script');b.type='text/javascript';b.async=!0;b.src=('https:'===c.location.protocol?'https:':'http:')+'//cdn.mxpnl.com/libs/mixpanel-2.2.min.js';d=c.getElementsByTagName('script')[0];d.parentNode.insertBefore(b,d);a._i=[];a.init=function(b,c,f){function d(a,b){var c=b.split('.');2==c.length&&(a=a[c[0]],b=c[1]);a[b]=function(){a.push([b].concat(Array.prototype.slice.call(arguments,0)))}}var g=a;'undefined'!==typeof f?g=a[f]=[]:f='mixpanel';g.people=g.people||[];h=['disable','track','track_pageview','track_links','track_forms','register','register_once','unregister','identify','alias','name_tag','set_config','people.set','people.increment','people.track_charge','people.append'];for(e=0;e<h.length;e++)d(g,h[e]);a._i.push([b,c,f])};a.__SV=1.2;
    })(document,window.mixpanel);
  }
}());
