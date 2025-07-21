var path = require("path"),
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  entry: "./app.js",
  mode: "development",
  devtool: "inline-source-map",
  output: {
    path: path.join(__dirname, "../priv/static"),
    filename: "[name].js",
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          test: /\.css$/,
          chunks: "all",
          enforce: true,
        },
      },
    },
    minimizer: [`...`, new CssMinimizerPlugin()],
  },
  plugins: [new MiniCssExtractPlugin({ insert: "", filename: "[name].css" })],
  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: "css-loader" },
        ],
      },
      {
        test: /\.js?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { targets: "defaults" }],
              "@babel/preset-react",
              ["@kbrw/jsxz", { dir: "webflow" }],
            ],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
};
