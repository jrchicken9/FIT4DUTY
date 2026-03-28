const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for metro-config package exports issue
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;