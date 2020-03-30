module.exports = {
	lintOnSave: false,
	runtimeCompiler: true,
	css: {
		sourceMap: true,
		extract: false,
		loaderOptions: {
			sass: {
				data: '@import "@/assets/scss/_variables.scss";'
			}
		}
	}
};
