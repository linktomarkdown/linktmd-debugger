var webpack = require("webpack"),
  path = require("path"),
  env = require("./scripts/env"),
  {
    CleanWebpackPlugin
  } = require("clean-webpack-plugin"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  WriteFilePlugin = require("write-file-webpack-plugin");

var fileExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "eot",
  "otf",
  "svg",
  "ttf",
  "woff",
  "woff2",
];

var options = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    popup: path.join(__dirname, "src", "popup.tsx"),
    background: path.join(__dirname, "src", "background.tsx"),
    content: path.join(__dirname, "src", "content.tsx"),
    debugger: path.join(__dirname, "src", "debugger.tsx"),
    inject: path.join(__dirname, "src", "inject.tsx"),
  },
  output: {
    globalObject: "this",
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    publicPath: "./"
  },
  devtool: 'inline-source-map',
  module: {
    rules: [{
        test: /\.css$/i,
        loader: "css-loader",
        options: {
          import: true,
        },
      },
      {
        test: /\.less$/i,
        use: [
          // compiles Less to CSS
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: fileExtensions
      .map((extension) => "." + extension)
      .concat([".jsx", ".js", ".css", '.tsx', '.ts', ]),
  },
  plugins: [
    new webpack.ProgressPlugin(),
    // clean the build folder
    new CleanWebpackPlugin({
      verbose: true,
      cleanStaleWebpackAssets: false,
    }),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new CopyWebpackPlugin({
      patterns: [{
          from: "src/public/manifest.json",
          to: path.join(__dirname, "dist"),
          force: true,
          transform: function (content, path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              JSON.stringify({
                  description: process.env.npm_package_description,
                  version: process.env.npm_package_version,
                  ...JSON.parse(content.toString()),
                },
                null,
                "\t"
              )
            );
          },
        },
        {
          from: "src/public/background-wrapper.js",
          to: path.join(__dirname, "dist"),
        },
        {
          from: "src/public",
          to: path.join(__dirname, "dist", "public"),
        },
        {
          from: "src/assets",
          to: path.join(__dirname, "dist", "assets"),
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "public/popup.html"),
      filename: "popup.html",
      chunks: ["popup"],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "public/debugger.html"),
      filename: "debugger.html",
      chunks: ["debugger"],
    }),
    new WriteFilePlugin(),
  ],
};

if (env.NODE_ENV === "development") {
  options.devtool = "cheap-module-source-map";
}

module.exports = options;