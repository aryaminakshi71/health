const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  analyzeBundle: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: '../bundle-analysis.html',
        })
      );
    }
    return config;
  },
  
  getBundleStats: (stats) => {
    const assets = stats.assets || [];
    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    const jsSize = assets
      .filter(asset => asset.name.endsWith('.js'))
      .reduce((sum, asset) => sum + asset.size, 0);
    const cssSize = assets
      .filter(asset => asset.name.endsWith('.css'))
      .reduce((sum, asset) => sum + asset.size, 0);
    
    return {
      totalSize: (totalSize / 1024 / 1024).toFixed(2) + ' MB',
      jsSize: (jsSize / 1024 / 1024).toFixed(2) + ' MB',
      cssSize: (cssSize / 1024 / 1024).toFixed(2) + ' MB',
      assetCount: assets.length
    };
  }
};
