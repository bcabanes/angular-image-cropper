var webpack = require('webpack');

var config = {
  context: __dirname + '/dev',
  entry: './app/app.js',
  output: {
    path: __dirname + '/dev',
    filename: 'bundle.js'
  },

  plugins: [
    new webpack.DefinePlugin({
      ON_TEST: process.env.NODE_ENV === 'test'
    })
  ],

  devtool: 'eval-source-map', // Dev only! Creating a source-map on the fly.

  module: {
    loaders: [
      {
        exclude: /node_modules/,
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        exclude: /node_modules/,
        test: /\.scss$/,
        loader: 'style-loader!css-loader!sass-loader'
      }
    ]
  }
};

if (process.env.NODE_ENV === 'production') {
  config.entry = './app/imageCropper/imageCropperDirective';
  config.output.path = __dirname + '/dist';
  config.output.filename = 'angularImageCropper.js';
  //config.plugins.push(new webpack.optimize.UglifyJsPlugin());
  config.devtool = 'source-map';
}

module.exports = config;