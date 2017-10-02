# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = "1.0"

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )

# Add folder with webpack generated assets to assets.paths
Rails.application.config.assets.paths << Rails.root.join("app", "assets", "webpack")

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
Rails.application.config.assets.precompile << "server-bundle.js"

type = ENV["REACT_ON_RAILS_ENV"] == "HOT" ? "non_webpack" : "static"
Rails.application.config.assets.precompile +=
  [
    "jquery-1.8.2.js",
    "add_students.js",
    "news.js",
    "sign_up_email.css",
    "application_#{type}.js",
    "app-bundle.js",
    "vendor-bundle.js",
    "home-bundle.js",
    "tools-bundle.js",
    "tools.js",
    "student-bundle.js",
    "student.js",
    "session-bundle.js",
    "session.js",
    "firewall_test-bundle.js",
    "firewall_test.js",
    "public-bundle.js",
    "public.js",
    "home.css",
    "home.js",
    "login-bundle.js",
    "login.js",
    "cookie_warning.js",
    "application_#{type}.css",
    "styleguide.html"
  ]
