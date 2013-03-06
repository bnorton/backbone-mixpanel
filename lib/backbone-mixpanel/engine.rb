module Backbone::Mixpanel
  class Engine < Rails::Engine
    initializer 'backbone-mixpanel.update_asset_paths' do |app|
      app.config.assets.paths << File.expand_path("../../../vendor", __FILE__)
    end
  end
end
