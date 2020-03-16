<template lang="pug">
   #app.app.app__page.app__page--home
      main.workbench
         //.filters
            .filter
               .filter__label Service
               label
                  input(v-model="selectedFilters", :value="null", type="radio")
                  span All
               label(v-for="(filter, key) in serviceFilters")
                  input(v-model="selectedFilters", :value="key", type="radio")
                  span {{ filter }}
         .directory
            masonry.directory__list(:cols="{default: 3, 1024: 2, 680: 1}", :gutter="30")
               .directory__item(v-for="(restaurant, index) in sortedList", v-if="!!restaurant.name" :key="restaurant.name")
                  business-component(:business="restaurant")
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

import BusinessObject from "./interfaces/business";

import BusinessComponent from "./components/BusinessComponent.vue";

import _ from "lodash";
import tabletop from "tabletop";
import VueMasonry from "vue-masonry-css";

Vue.use(VueMasonry);

import "../node_modules/font-awesome/scss/font-awesome.scss";
import "./assets/scss/style.scss";

export default Vue.extend({
	data() {
		return {
			isLoading: true,
			restaurants: [] as Array<BusinessObject>,
			sortBy: "name" as string,
			filterBy: null as null | string,
			serviceFilters: {
				curbside_pickup: "Curbside Pickup",
				delivery: "Delivery",
				online_ordering: "Online Ordering"
			},
			selectedFilters: null as null | string
		};
	},

	created() {
		tabletop.init({
			key:
				"https://docs.google.com/spreadsheets/d/14nyJoAv4dpZEYyqZiToDXY2qdaVpW0SeaNVVnLLnegY/edit#gid=0",
			callback: this.loadData,
			simpleSheet: false
		});
	},

	mounted() {},

	methods: {
		loadData(data: any, tabletop: any) {
			const restaurants = data.restaurants.elements;
			this.restaurants = restaurants;
			this.isLoading = false;
		}
	},

	computed: {
		sortedList(): Array<BusinessObject> {
			if (this.restaurants && this.sortBy) {
				if (this.sortBy === "name") {
					return _.sortBy(this.restaurants, ["name"]);
				}
			}

			return this.restaurants;
		}
	},

	filters: {},

	components: {
		"business-component": BusinessComponent
	}
});
</script>

<style lang="scss">
$sidebar-width: 33.333%;

.workbench {
	margin: 3rem;
}

.filters {
}

.directory {
	$padding: 1.5rem;
	//flex: 1;

	&__list {
		//margin: 0 (-$padding);
		margin: 0;
		padding: 0;
		list-style: none;
		//column-count: 3;
		gap: 1.5rem;
	}

	&__item {
		//flex: 1 1 $item-width;
		//max-width: $item-width;
		//padding: 0 ($padding / 2);
		//display: inline-block;
		margin-bottom: 1.5rem;
	}
}
</style>