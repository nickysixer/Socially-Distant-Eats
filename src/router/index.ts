import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

import DirectoryComponent from "@/views/Directory.vue";

const routes = [
	{
		path: "*",
		component: DirectoryComponent
	},
	{
		path: "/",
		name: "home",
		component: DirectoryComponent
	},
	{
		path: "/city/:city_name/",
		name: "city",
		component: DirectoryComponent
	}
];

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes
});

export default router;
