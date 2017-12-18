const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    // Each entry in here would declare a file that needs to be transpiled
    // and included in the extension source.

    // background scripts
    background: './src/background_scripts/background.js',

    // web workers for background script
    trackers_worker: './src/trackers/trackers.worker.js',
    inferencing_worker: './src/inferencing/inferencing.worker.js',
    database_worker: './src/database/database.worker.js',

    // content scripts
    content: './src/content_scripts/content.js',

    // user facing pages
    popup: './src/popup/popup.js',
    dashboard: './src/dashboard/index.js',
    infopage: './src/infopage/infopage.js', // DEPRECATED
    debugscreen: './src/debugscreen/debugscreen.js' // DEPRECATED

  },
  output: {
    // This copies each source entry into the extension dist folder named
    // after its entry config key.
    path: path.resolve(__dirname, "extension/dist"),
    publicPath: '/dist/',
    filename: '[name].js',
  },
  module: {
    rules: [
      { 
        // Babel transpilation
        test: /\.js$/, 
        exclude: /node_modules/, 
        loader: "babel-loader",
        options: {
          "presets": ["env", "react"],
          "plugins": ["transform-eval", "transform-runtime", "transform-object-rest-spread"]
        }
      },
      {
        // properly load font files
        // https://github.com/webpack-contrib/css-loader/issues/38#issuecomment-313673931
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader?name=fonts/[name].[ext]'
      },
      {
        // allow importing css files
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      }
    ]
  },
  resolve: {
    // This allows you to import modules just like you would in a NodeJS app.
    modules: [
      'node_modules'
    ],
  },
  plugins: [
    // fix importing some dependencies that assume filesystem etc.
    new webpack.IgnorePlugin(/jsdom$/)
  ],
  

  // fix importing some dependencies that assume filesystem etc.
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty",
    jsdom: "empty"
  },
};
