const path = require("path");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const glob = require("glob");

function entry(globalPath, isFilename) {
  const files = glob.sync(globalPath);
  const entries = {};
  for (let i = 0; i < files.length; i++) {
    const currentFile = files[i];
    if (isFilename) {
      entries[path.basename(currentFile, path.extname(currentFile))] =
        currentFile;
    } else {
      entries[path.basename(path.dirname(currentFile))] = currentFile;
    }
  }
  return entries;
}

module.exports = {
  mode: "production",
  entry: {
    ...entry("./src/scenarios/*.ts", true),
  },

  output: {
    path: path.join(__dirname, "dist"),
    libraryTarget: "commonjs",
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      src: path.resolve(__dirname, "src"),
      $common: path.resolve(__dirname, "src/common"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "esbuild-loader",
        options: {
          loader: "ts",
          target: "es2015",
        },
      },
    ],
  },
  target: "web",
  externals: /^(k6|https?\:\/\/)(\/.*)?/,
  // Generate map files for compiled scripts
  devtool: "source-map",
  stats: "errors-only",
  plugins: [
    new CleanWebpackPlugin(),
    // Copy assets to the destination folder
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./src/common/assets"),
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  optimization: {
    // Don't minimize, as it's not used in the browser
    minimize: false,
  },
};
