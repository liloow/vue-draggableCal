module.exports = {
  baseUrl: '.',
  configureWebpack: () => ({
    entry: './src/App.vue',
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
