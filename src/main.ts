import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";

Vue.config.productionTip = false;

new Vue({
	store,
	router,
	created() {
		const scripts = ["https://kit.fontawesome.com/495c6a1199.js"];

		scripts.forEach((scriptSrc: string) => {
			let script = document.createElement("script");
			script.setAttribute("src", scriptSrc);
			document.head.appendChild(script);
		});
	},
	render: (h) => h(App)
}).$mount("#app");
