// This file is used by 'react-app-rewired' (see https://github.com/timarney/react-app-rewired#readme

const ManifestPlugin = require("webpack-manifest-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const standaloneChunk = "standalone";
const taskpaneChunk = "taskpane";

// TODO: manifest.xml for production:
// the manifest.xml needs to refer to the public/deployment URL -- the official Office Add-in
// project template uses Webpack to rewrite the URLs in the manifest.xml here. We could do the
// same or manually maintain different files

module.exports = {
  webpack: function override(config, webpackEnv) {
    const isEnvDevelopment = webpackEnv === "development";
    const isEnvProduction = webpackEnv === "production";

    config.entry = {
      [standaloneChunk]: ["./src/standalone/standalone.tsx"],
      [taskpaneChunk]: ["./src/word-taskpane/taskpane.tsx"],
    };

    const manifestPluginInstances = config.plugins.filter((p) => p instanceof ManifestPlugin);
    if (manifestPluginInstances.length !== 1) {
      throw new Error(`Expected one instance of ManifestPlugin but found (${manifestPluginInstances.length})`);
    }
    const htmlPluginInstances = config.plugins.filter((p) => p instanceof HtmlWebpackPlugin);
    if (htmlPluginInstances.length !== 1) {
      throw new Error(`Expected one instance of HtmlWebpackPlugin but found (${htmlPluginInstances.length})`);
    }

    const [defaultHtmlPlugin] = htmlPluginInstances;
    const otherPlugins = config.plugins.filter(
      (p) => !(p instanceof ManifestPlugin) && !(p instanceof HtmlWebpackPlugin)
    );

    defaultHtmlPlugin.options.chunks = [standaloneChunk];

    const taskpaneHtmlPlugin = new HtmlWebpackPlugin({
      filename: "taskpane.html",
      template: "./public/taskpane.html",
      chunks: [taskpaneChunk],
      inject: true,
    });
    config.plugins = [defaultHtmlPlugin, taskpaneHtmlPlugin, ...otherPlugins];

    // We have multiple entry points, so we can't use the default "bundle.js" common bundle name for dev-server.
    // instead, we need to provide a unique name for each chunk, e.g. using [name].
    config.output.filename = isEnvProduction
      ? "static/js/[name].[contenthash:8].js"
      : isEnvDevelopment && "static/js/[name].[hash:8].js";

    return config;
  },
  paths: function (paths, env) {
    paths.appIndexJs = path.resolve("./src/standalone/standalone.tsx");
    return paths;
  },
};
