# Backbone.Mixpanel

####Note: You no longer need the mixpanel tracking javascript in your rails templates.

## Installation

Add this line to your application's Gemfile:

    gem 'backbone-mixpanel'

And then execute:

    $ bundle

## Basic Usage

###Backbone.Mixpanel(options)

Call the Backbone.Mixpanel method after including Backbone into your app

```javascript
Backbone.Mixpanel({ token: "abc123" })
```

## Usage

**Require the backbone mixpanel javascript files**

```javascript
// app/assets/javascripts/application.js
...
//= require underscore
//= require backbone
//= require backbone-mixpanel
...
```

**Initialize backbone-mixpanel**

```javascript
var options = { // the default options
  token: "",
  enabled: false,
  eventDataAttr: 'event'
  customData: [],
  userInfo: {},
  nameTag: ''
};

// Initialize mixpanel tracking and backbone-mixpanel:
Backbone.Mixpanel(options)
```

###Options
`token` - The Mixpanel token from your dashboard. (Required)  
`enabled` - Whether or not to log/track action to mixpanel (turn this on for production).  
`eventDataAttr` - The data-* attribute on the DOM element that will generate the mixpanel tracking description.  
`customData` - Any additional data-* attributes to look at for tracking metadata  
`userInfo` - User specific data passed to `mixpanel.register` for contextual User info  
`nameTag` - Some User identifier such as his/her name. Passed to `mixpanel.name_tag`  


## Complete Example

####Initialize Backbone.Mixpanel

```javascript
Backbone.Mixpanel({
  token: "abc123",
  customData: ['id', 'desc']
})

```

####Setup a view with some events

```javascript
// assets/javascripts/views/items/index
app.views.itemsIndexView = Backbone.View.extend({
   template: app.template("items/index"),
   events: {
     'click .remove': 'removeItem'
     'click .detail': 'showDetail'
   },

   removeItem: function() {
     // actually remove the item here
   },

   showDetail: function() {
     // you guessed it -- show the item details
   }
});
```

####Then add the data-* attributes to the elements

```html
// assets/javascripts/templates/items/index.hbs
// for item { id: 1234, description: "A custom description" }
<div class='item'>
  <span class='title'>{{item.title}}</span>
  <span class='detail' data-event='Show Item Detail' data-id='{{item.id}}'>Details</span>
  <span class='remove' data-event='Remove Item' data-desc='{{item.description}}'>Remove</span>
</div>
```

####Profit!

======================

####What actually happens...

When the items are rendered  
And the User clicks on the 'Details'  
Then Mixpanel event data will be logged  
And the text will be the `eventDataAttr` attribute on the DOM element  
And the extra data logged will be all of the `customData` attributes from the DOM element  

```javascript
// In this case a User clicking on the 'Details' for an Item will log this mixpanel action:
mixpanel.track('Show Item Detail', { id: 1234 });
```

```javascript
// And when the User removes the Item then this is logged to mixpanel:
mixpanel.track('Remove Item', { desc: 'A custom description' });
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
