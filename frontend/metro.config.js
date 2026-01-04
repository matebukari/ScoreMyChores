const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname);

// Add SVG support
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...config.resolver,
  // Remove 'svg' from assetExts
  assetExts: config.resolver.assetExts.filter(ext => ext !== "svg"),
  // Add 'svg' to sourceExts
  sourceExts: [...config.resolver.sourceExts, "svg"],
};
 
module.exports = withNativeWind(config, { input: './app/globals.css' });