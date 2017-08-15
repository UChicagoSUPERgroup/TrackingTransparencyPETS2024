const path = require('path');
const webpack = require('webpack');

module.exports = {
  // target: "node",
  entry: {
    // Each entry in here would declare a file that needs to be transpiled
    // and included in the extension source.
    // For example, you could add a background script like:
    // background: './src/background.js',
    // infer: './inferencing/src/infer.js',
    // build: './inferencing/src/build.js',
    inferencing: './src/inferencing.js',
    content_script: './src/content_scripts/content_script.js',
    overlay: './src/content_scripts/overlay.js'
  },
  output: {
    // This copies each source entry into the extension dist folder named
    // after its entry config key.
    path:  path.join(__dirname, 'extension/dist'),
    filename: '[name].js',
  },
  module: {
    // This transpiles all code (except for third party modules) using Babel.
    loaders: [{
      exclude: /node_modules/,
      test: /\.js$/,
      // Babel options are in .babelrc
      loaders: ['babel-loader'],
    }],
  },
  resolve: {
    // This allows you to import modules just like you would in a NodeJS app.
    modules: [
      'node_modules',
      path.join(__dirname, 'src/inferencing')
    ],
  },
  plugins: [
    // Since some NodeJS modules expect to be running in Node, it is helpful
    // to set this environment var to avoid reference errors.
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.IgnorePlugin(/jsdom$/)
  ],
  // This will expose source map files so that errors will point to your
  // original source files instead of the transpiled files.
  devtool: 'sourcemap',
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty",
    jsdom: "empty"
  },
};
