const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require("webpack");

const tsLoaderOptions = process.env.NODE_ENV === 'production'
  ? { compilerOptions: { sourceMap: false } }
  : {};

const config = {
  entry: './src/entry.ts',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'sware',
      template: 'src/index.ejs'
    }),
    new ExtractTextPlugin('[name].[chunkhash].css'),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }),
  ],
  module: {
    rules: [{
        test: /\.(tsx|ts)$/,
        loader: 'awesome-typescript-loader',
        options: tsLoaderOptions,
      }, {
        test: /\.(scss|css)$/,
        loader: ExtractTextPlugin.extract({
          use: 'css-loader!sass-loader',
          fallback:'style-loader',
        })
      }
    ]
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
  },
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
} else {
  config.devtool = 'inline-source-map';
  config.module.rules.push({
    test: /\.(tsx|ts)$/,
    loader: 'source-map-loader',
    enforce: 'pre'
  });
}

module.exports = config;
