module.exports = {
  configureWebpack: () => ({
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
