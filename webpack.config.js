const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    // Each entry in here would declare a file that needs to be transpiled
    // and included in the extension source.

    // background scripts
    background: './src/background_scripts/background.js',
    userstudy: './src/background_scripts/userstudy.js',

    // workers
    trackers_worker: './src/web_workers/trackers.worker.js',
    inferencing_worker: './src/web_workers/inferencing.worker.js',
    database_worker: './src/web_workers/database/database.worker.js',

    // content scripts
    inferencing_cs: './src/content_scripts/inferencing_cs.js',
    overlay_cs: './src/content_scripts/overlay_cs.js'
  },
  output: {
    // This copies each source entry into the extension dist folder named
    // after its entry config key.
    path: path.resolve(__dirname, "extension/dist"),
    publicPath: '/dist/',
    filename: '[name].js',
  },
  module: {
  //   // // This transpiles all code (except for third party modules) using Babel.
  //   // loaders: [{
  //   //   exclude: /node_modules/,
  //   //   test: /\.js$/,
  //   //   // Babel options are in .babelrc
  //   //   loaders: ['babel-loader'],
  //   // }]
    // loaders: [ 
    //   { 
    //     test: /\.worker.js$/, 
    //     loader: 'worker-loader' 
    //   } 
    // ]
  },
  resolve: {
    // This allows you to import modules just like you would in a NodeJS app.
    modules: [
      'node_modules',
      path.resolve(__dirname, "src/web_workers/database"),
      path.resolve(__dirname, "src/background_scripts"),
      path.join(__dirname, 'src/lib'),
      path.join(__dirname, 'src/inferencing')
    ],
  },
  plugins: [
    // Since some NodeJS modules expect to be running in Node, it is helpful
    // to set this environment var to avoid reference errors.
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.IgnorePlugin(/jsdom$/),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    })
  ],
  // This will expose source map files so that errors will point to your
  // original source files instead of the transpiled files.
  devtool: 'inline-source-map',
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty",
    jsdom: "empty"
  },
};
