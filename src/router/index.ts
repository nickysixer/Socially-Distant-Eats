import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

import HomeComponent from "@/views/Home.vue";

const routes = [
	{
		path: "*",
		component: HomeComponent
	},
	{
		path: "/",
		name: "home",
		component: HomeComponent
	},
	{
		path: "/city/:city_name/",
		name: "city",
		component: HomeComponent
	}
];

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes
});

export default router;
