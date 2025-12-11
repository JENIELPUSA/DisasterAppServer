module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: "config.env",
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
