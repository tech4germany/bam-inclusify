// This file is used by 'react-app-rewired' (see https://github.com/timarney/react-app-rewired#readme )

const ManifestPlugin = require("webpack-manifest-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const fs = require("fs");

const standaloneChunk = "standalone";
const taskpaneChunk = "taskpane";

module.exports = {
  webpack: function override(config, webpackEnv) {
    const isEnvDevelopment = webpackEnv === "development";
    const isEnvProduction = webpackEnv === "production";

    config.entry = {
      [standaloneChunk]: ["./src/standalone/standalone.tsx"],
      [taskpaneChunk]: ["./src/office-taskpane/taskpane.tsx"],
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

    const impressumDatenschutzHtmlPlugin = new HtmlWebpackPlugin({
      filename: "impressum-datenschutz.html",
      template: "./public/plain.html",
      templateParameters: {
        pageTitle: "Impressum und Datenschutz",
        pageContent: fs.readFileSync("src/impressum-datenschutz.content.html", "utf8"),
      },
      chunks: [],
    });

    const lizenzenHtmlPlugin = new HtmlWebpackPlugin({
      filename: "lizenzen.html",
      template: "./public/plain.html",
      templateParameters: {
        pageTitle: "Lizenzen",
        pageContent: fs.readFileSync("src/lizenzen.content.html", "utf8"),
      },
      chunks: [],
    });

    const impressumDatenschutzPlugins =
      process.env.REACT_APP_SHOW_IMPRESSUM_AND_DATENSCHUTZ !== "1" ? [] : [impressumDatenschutzHtmlPlugin];

    const copyManifestPlugin = new CopyWebpackPlugin({
      patterns: [{ from: "manifest.xml", to: "manifest.xml" }],
    });

    const devOnlyPlugins = isEnvDevelopment ? [copyManifestPlugin] : [];

    config.plugins = [
      defaultHtmlPlugin,
      taskpaneHtmlPlugin,
      lizenzenHtmlPlugin,
      ...impressumDatenschutzPlugins,
      ...devOnlyPlugins,
      ...otherPlugins,
    ];

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
  // The function to use to create a webpack dev server configuration when running the development
  // server with 'npm run start' or 'yarn start'.
  // Example: set the dev server to use a specific certificate in https.
  devServer: function (configFunction) {
    // Return the replacement function for create-react-app to use to generate the Webpack
    // Development Server config. "configFunction" is the function that would normally have
    // been used to generate the Webpack Development server config - you can use it to create
    // a starting configuration to then modify instead of having to create a config from scratch.
    return function (proxy, allowedHost) {
      // Create the default config by calling configFunction with the proxy/allowedHost parameters
      const config = configFunction(proxy, allowedHost);

      if (!!process.env.DEVSERVER_HTTPS_KEY || !!process.env.DEVSERVER_HTTPS_CERT || !!process.env.DEVSERVER_HTTPS_CA)
        config.https = {
          key: !!process.env.DEVSERVER_HTTPS_KEY ? fs.readFileSync(process.env.DEVSERVER_HTTPS_KEY, "utf8") : undefined,
          cert: !!process.env.DEVSERVER_HTTPS_CERT
            ? fs.readFileSync(process.env.DEVSERVER_HTTPS_CERT, "utf8")
            : undefined,
          ca: !!process.env.DEVSERVER_HTTPS_CA ? fs.readFileSync(process.env.DEVSERVER_HTTPS_CA, "utf8") : undefined,
          passphrase: process.env.DEVSERVER_HTTPS_PASS,
        };
      config.headers = {
        "Access-Control-Allow-Origin": "*",
      };

      // Return customised Webpack Development Server config.
      return config;
    };
  },
};
