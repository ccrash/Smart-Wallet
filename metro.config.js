const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

const { assetExts, sourceExts } = config.resolver;
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg'];

// Prefer CJS over ESM when resolving package exports. Zustand's ESM build uses
// import.meta, which is a syntax error in Metro's classic-script web bundle and
// blanks the page before anything renders.
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = withNativeWind(config, { input: './src/global.css' });
