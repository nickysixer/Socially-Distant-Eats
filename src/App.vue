<template lang="pug">
   #app.app.app__page.app__page--home
      .app__loading(v-if="isLoading")
         h3
            i.fad.fa-spin.fa-spinner
            span Loading restaurants
      main.app__workbench(v-else)
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
      footer.bottom
         span(v-html="attribution")
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
			selectedFilters: null as null | string,
			attribution: "SociallyDistantEats.com is the project conceived by Nick Goers of <a href='https://www.company119.com' target='_blank'>Company 119</a> to help local restaurants during the COVID-19 crisis. Please consider suggesting more local restaurants for the list!" as string
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
body,
html,
.app {
	min-height: 100%;
	width: 100%;
}

.app {
	margin: 3rem 0;

	&__loading {
		text-align: center;

		i {
			margin-right: 0.5rem;
		}
	}

	&__workbench {
		margin: 0 auto;
		width: 95%;
		//max-width: 1200px;
	}
}

.filters {
}

.directory {
	$padding: 1.5rem;
	flex: 1;
	width: 100%;

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

.bottom {
	text-align: center;
	opacity: 0.75;
	width: 800px;
	max-width: 95%;
	margin: 0 auto;
	margin-top: 2rem;

	a {
		text-decoration: none;
	}
}
</style>