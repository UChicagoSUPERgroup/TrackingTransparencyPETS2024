const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      USERSTUDY_CONDITION: 6, // always condition everything
      // USERSTUDY_CONDITION: 'undefined',
      'EXT.DEBUG': true
    })
  ]
})
