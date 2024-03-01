const path = require('path')
const webpack = require('webpack')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ChromeExtensionReloader  = require('webpack-chrome-extension-reloader'); // hot reloading

const EXT_NAME = 'Tracking Transparency'

module.exports = {
  entry: {
    // Each entry in here would declare a file that needs to be transpiled
    // and included in the extension source.

    // background scripts
    background: './src/background/background.js',

    // content scripts
    content: './src/content_scripts/content.js',

    // user facing pages
    popup: './src/popup/index.js',
    dashboard: './src/dashboard/App.js',
    options: './src/options/index.js',
    welcome: './src/welcome/index.js',
    lightbeam: './src/lightbeam/lightbeam.js',
    adGrab: './src/content_scripts/adGrab.js',
    instrumentation: './src/background/instrumentation.js'

  },
  output: {
    // This copies each source entry into the extension dist folder named
    // after its entry config key.
    path: path.resolve(__dirname, 'extension/dist'),
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        // Babel transpilation
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: { name: '[name].[hash].js' }
        }
      },
      {
        // properly load font files
        // https://github.com/webpack-contrib/css-loader/issues/38#issuecomment-313673931
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader?name=fonts/[name].[ext]'
      },
      {
        // allow .mp4 video
        test: /\.mp4$/,
        use: 'file-loader?name=videos/[name].[ext]',
      },
      {
        // allow images
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        // allow importing css files
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader'
        ]
      },
      {
        // allow importing onnx mode file, Aug 22, 2021
        test: /\.onnx$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'module',
        },

        
      }
    ]
  },
  resolve: {
    // This allows you to import modules just like you would in a NodeJS app.
    modules: [
      'node_modules'
    ]
  },
  optimization: {
    // splitChunks: {
    //   chunks: 'initial',
    //   cacheGroups: {
    //     default: false
    //   }
    // }
  },
  plugins: [
    new ChromeExtensionReloader({
        reloadPage: true, // not consistent
        entries: { // entries used for the content/background scripts
          contentScript: 'content', // Use the entry names, not the file name or the path
          background: 'background', 
          popup: 'popup',
          dashboard: 'dashboard',
          options: 'options',
          welcome: 'welcome',
          lightbeam: 'lightbeam',
          adGrab: 'adGrab',
          instrumentation: 'instrumentation',
        }
      }),
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'EXT.VERSION': JSON.stringify(require('./package.json').version),
      'EXT.NAME': JSON.stringify(EXT_NAME)
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/[name].css'
      // chunkFilename: 'css/[id].css'
    }),
    // fix importing some dependencies that assume filesystem etc.
    new webpack.IgnorePlugin(/jsdom$/),
    new HtmlWebpackPlugin({
      // inject: false,
      cache: false,
      filename: 'background.html',
      chunks: ['background'],
      template: 'src/template.html'
    }),
    new HtmlWebpackPlugin({
      // inject: false,
      cache: false,
      filename: 'dashboard.html',
      chunks: ['dashboard'],
      template: 'src/template.html',
      title: EXT_NAME
    }),
    new HtmlWebpackPlugin({
      // inject: false,
      cache: false,
      filename: 'popup.html',
      chunks: ['popup'],
      template: 'src/template.html',
      title: EXT_NAME
    }),
    new HtmlWebpackPlugin({
      // inject: false,
      cache: false,
      filename: 'options.html',
      chunks: ['options'],
      template: 'src/template.html',
      title: 'Options'
    }),
    new HtmlWebpackPlugin({
      // inject: false,
      cache: false,
      filename: 'welcome.html',
      chunks: ['welcome'],
      template: 'src/template.html',
      title: 'Welcome to ' + EXT_NAME
    })
  ],

  // fix importing some dependencies that assume filesystem etc.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
    jsdom: 'empty'
  },

  devtool: 'cheap-module-source-map'



}