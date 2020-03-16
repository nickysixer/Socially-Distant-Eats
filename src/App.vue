<template lang="pug">
   #app.app.app__page.app__page--home
      header.app__masthead
         img.app__logo(src="images/SociallyDistantEatsLogo-Color.png")
         .app__menu
            a(href="https://forms.gle/xsGyRzzcSFPqTK5P9", target="_blank")
               i.fad.fa-plus-circle
               span Submit Your Business
      main.app__workbench
         .app__loading(v-if="isLoading")
            h3
               i.fad.fa-spin.fa-spinner
               span Loading restaurants
         template(v-else)
            .filters
               .filters__filter.filters__filter--service
                  label.filters__input.filters__input--checkbox
                     input(v-model="filters.service.input", value="", type="radio", checked="true")
                     span.filters__pill
                        i.fad.fa-check-circle
                        span All
                  label.filters__input.filters__input--checkbox(v-for="(filter, key) in filters.service.options")
                     input(v-model="filters.service.input", :value="key", type="radio", checked="true")
                     span.filters__pill
                        i.fad.fa-check-circle
                        span {{ filter }}
               .filters__filter.filters__filter--search
                  .filters__input.filters__input--text
                     input(v-model="filters.search.input", type="search", placeholder="Search by name")
               .filters__filter.filters__filter--city
                  .filters__input.filters__input--select
                     select(v-model="filters.city.input", type="search", placeholder="Search by name")
                        option(value="") Search by city
                        option(v-for="(filter, key) in filters.city.options") {{ filter }}
               .filters__filter.filters__filter--reset(v-if="isFiltered")
                  .filters__input.filters__input--button
                     button.btn(@click.prevent="reset") Clear Search

            .directory
               masonry.directory__list(v-if="restaurants", :cols="{default: 3, 1024: 2, 680: 1}", :gutter="30")
                  .directory__item(v-for="(restaurant, index) in sortedList", v-if="!!restaurant.name" :key="restaurant.name")
                     business-component(:business="restaurant")
               .directory__empty(v-else)
                  h2 Sorry, we were unable to find any restaurants that matched your search.
                  button.btn(@click.prevent="reset") Reset Search
      footer.app__bottom
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
			filters: {
				search: {
					input: "" as string
				},
				service: {
					input: "" as string,
					options: {
						curbside_pickup: "Curbside Pickup",
						delivery: "Delivery",
						online_ordering: "Online Ordering"
					}
				},
				city: {
					input: "" as string,
					options: [] as Array<string>
				}
			},
			selectedFilters: [] as Array<string>,
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
		},

		reset() {
			this.filters.city.input = "";
			this.filters.service.input = "";
			this.filters.search.input = "";
		}
	},

	computed: {
		isFiltered(): boolean {
			return (
				!!this.filters.search.input ||
				!!this.filters.city.input ||
				!!this.filters.service.input
			);
		},

		sortedList(): Array<BusinessObject> {
			let list = this.filteredList;

			if (this.sortBy) {
				if (this.sortBy === "name") {
					list = _.sortBy(list, ["name"]);
				}
			}

			return list;
		},

		filteredList(): Array<BusinessObject> {
			let list = this.restaurants;

			if (this.filters.search.input) {
				list = list.filter((item: BusinessObject) => {
					return item.name
						.toLowerCase()
						.includes(this.filters.search.input.toLowerCase());
				});
			}

			if (this.filters.city.input) {
				list = list.filter(
					(item: BusinessObject) =>
						item.city === this.filters.city.input
				);
			}

			if (this.filters.service.input) {
				list = list.filter(
					(item: BusinessObject) =>
						item[this.filters.service.input] === "TRUE"
				);
			}

			return list;
		},

		uniqueCities(): Array<string> {
			if (this.restaurants) {
				const restaurants: Array<BusinessObject> = this.restaurants;
				const uniqueCities: Array<string> = [
					...new Set(
						restaurants.map((item: BusinessObject) => item.city)
					)
				];
				return uniqueCities.sort();
			}

			return [];
		}
	},

	watch: {
		uniqueCities(values) {
			this.filters.city.options = values;
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
		i {
			margin-right: 0.5rem;
		}
	}

	&__masthead,
	&__workbench,
	&__bottom {
		margin: 0 auto;
		width: 95%;
		//max-width: 1200px;
	}

	&__masthead {
		margin-bottom: 2rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
	}

	&__menu {
		margin-left: 1rem;

		a {
			color: rgba(black, 0.5);
			text-decoration: none;

			i {
				margin-right: 0.25rem;
			}
		}
	}

	&__logo {
		width: 22rem;
		max-width: 90%;
	}

	&__bottom {
		opacity: 0.5;
		margin-top: 2rem;

		a {
			text-decoration: none;
		}
	}
}

.filters {
	$filters: &;
	display: flex;
	margin: 0 0 1rem;
	flex-wrap: wrap;

	&__filter {
		margin-right: 0.5rem;

		&--service {
			display: flex;
			flex-wrap: wrap;
		}
	}

	&__input {
		$border: 1px solid darken(white, 15);
		$border-radius: 100px;
		$padding: 0.5rem 1rem;
		display: flex;
		align-items: center;
		margin: 0 0.5rem 0.5rem 0;

		&--select {
			select {
				border: $border;
				border-radius: $border-radius;
				appearance: none;
				padding: $padding;
				font-size: 0.9rem;
				font-family: "Poppins", sans-serif;

				&:focus {
					outline: none;
					border-color: #20c997;
				}
			}
		}

		&--text {
			input {
				padding: $padding;
				border-radius: $border-radius;
				border: $border;
				font-size: 0.9rem;
				font-family: "Poppins", sans-serif;

				&:focus {
					outline: none;
					border-color: #20c997;
				}
			}
		}

		&--checkbox {
			input {
				opacity: 0;
				visibility: hidden;
				display: none;

				&:checked + #{$filters}__pill {
					border-color: #20c997;
					background-color: #20c997;
					color: white;
				}
			}

			i {
				margin-right: 0.5rem;
			}

			#{$filters}__pill {
				border: $border;
				border-radius: $border-radius;
				padding: $padding;
				display: flex;
				align-items: center;
			}

			&:focus {
				outline: none;
				border-color: #20c997;
			}
		}
	}
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

	&__empty {
		text-align: center;
	}
}
</style>