module.exports = {
  baseUrl: '.',
  configureWebpack: () => ({
    entry: process.env.NODE_ENV === 'production' ? './src/App.vue' : './src/main.js',
    devtool: false,
  }),
  lintOnSave: true,
  css: {
    extract: false,
    loaderOptions: {
      css: {minimize: true},
    },
  },
}
