const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production'

module.exports = [/*{
  entry: './frontend/admin/addproduct/app.js',
  mode: 'development',
  output: {
    path: path.join(__dirname, '/public/admin/addproduct'),
    filename: 'bundle.js'
  },
  devServer: {
      contentBase: path.join(__dirname, '/public'),
  },
  module : {
    rules: [
      {
        test: /\.css/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "bundle.css"
    })
  ],
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },
  devtool: 'source-map'
},{
  entry: './frontend/js/app.js',
  mode: 'development',
  output: {
    path: path.join(__dirname, '/public/js'),
    filename: 'app.js'
  },
},{
  entry: './frontend/js/pages.js',
  mode: 'development',
  output: {
    path: path.join(__dirname, '/public/js'),
    filename: 'pages.js'
  },
}*/];