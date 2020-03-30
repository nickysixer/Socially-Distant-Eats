<template lang="pug">
   .directory
      .directory__loading(v-if="isLoading")
         h3
            i.fad.fa-spin.fa-spinner
            span Loading restaurants
      template(v-else)
         .directory__filters
            .directory__filter.filter.filter--view
               .filter__input
                  .filter__pill
                     .filter__choice
                        input(v-model="viewMode", value="map", id="view-map", name="view", type="radio")
                        label.filter__label(for="view-map") Map View
                     .filter__choice
                        input(v-model="viewMode", value="list", id="view-list", name="view", type="radio")
                        label.filter__label(for="view-list") List View
            .directory__filter.filter.filter--service
               label.filter__input.filter__input--checkbox
                  input(v-model="filters.service.input", value="", type="radio", checked="true")
                  span.filter__pill
                     i.fad.fa-check-circle
                     span All
               label.filter__input.filter__input--checkbox(v-for="(filter, key) in filters.service.options")
                  input(v-model="filters.service.input", :value="key", type="radio", checked="true")
                  span.filter__pill
                     i.fad.fa-check-circle
                     span {{ filter }}
            .directory__filter.filter.filter--city
               .filter__input.filter__input--select
                  select.filter__pill(v-model="filters.city.input", @change="goToCityPage()" type="search", placeholder="Search by name")
                     option(value="") Filter by city
                     option(v-for="(filter, key) in filters.city.options", :value="filter.toLowerCase()") {{ filter }}
            .directory__filter.filter.filter--search
               .filter__input.filter__input--text
                  input.filter__pill(v-model="filters.search.input", type="search", placeholder="Search by name")
            .directory__filter.filter.filter--reset(v-if="isFiltered")
               .filter__input.filter__input--button
                  button.filter__pill.filter__pill--btn(@click.prevent="reset") Reset
         .directory__grid
            .directory__map(v-if="!!sortedList.length && showMap")
               mapbox(@geolocate="setGeolocation", :filtered-restaurants="filteredList", :all-restaurants="activeList", :center="{ lat: 40.4173, lng: -82.9071 }", name="mapbox")
            masonry.directory__list(v-if="!!sortedList.length", :key="viewMode" :class="{ 'directory__list--with-map': showMap }", :cols="{ default: showMap ? 1 : 3, 1024: showMap ? 1 : 2, 680: 1 }", :gutter="showMap ? 0 : 30", ref="directory-list")
               .directory__item(v-for="(restaurant, index) in sortedList", v-if="!!restaurant.name" :key="restaurant.name")
                  business(@favorite="setFavorite", :business="restaurant", layout="default")
            .directory__empty(v-else)
               h2 Sorry, we were unable to find any restaurants that matched your search criteria. Give it another go.
               button.btn(@click.prevent="reset") Reset Search
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

import firebase from "firebase";
import data from "@/global/data";
import user from "@/global/user";

import BusinessObject from "@/interfaces/business";
import BusinessComponent from "@/components/Business.vue";
import MapComponent from "@/components/Map.vue";

import _ from "lodash";
import tabletop from "tabletop";
import VueMasonry from "vue-masonry-css";

Vue.use(VueMasonry);

export default Vue.extend({
	data() {
		return {
			viewMode: "map" as string,
			isLoading: true as boolean,
			restaurants: [] as Array<BusinessObject>,
			sortBy: "name" as string,
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
			selectedFilters: [] as Array<string>
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

	mounted() {
		if (this.$route.params.city_name) {
			this.filters.city.input = this.$route.params.city_name;
		}
	},

	methods: {
		loadData(data: any, tabletop: any) {
			const restaurants = data.restaurants.elements;
			this.restaurants = restaurants;
			this.isLoading = false;
		},

		reset() {
			this.$router.push("/");
			this.filters.city.input = "";
			this.filters.service.input = "";
			this.filters.search.input = "";
		},

		goToCityPage() {
			this.$router.push("/city/" + this.filters.city.input);
		},

		setGeolocation(userLatLng: google.maps.LatLng) {
			this.restaurants.forEach((restaurant: BusinessObject, index) => {
				let distance = this.calculateDistance(
					userLatLng.lat(),
					userLatLng.lng(),
					parseFloat(restaurant.latitude),
					parseFloat(restaurant.longitude)
				);

				this.restaurants[index].distance = distance.toString();
			});

			this.sortBy = "distance";
		},

		calculateDistance(
			lat1: number,
			lon1: number,
			lat2: number,
			lon2: number,
			unit: string = "M"
		): number {
			var radlat1 = (Math.PI * lat1) / 180;
			var radlat2 = (Math.PI * lat2) / 180;
			var radlon1 = (Math.PI * lon1) / 180;
			var radlon2 = (Math.PI * lon2) / 180;
			var theta = lon1 - lon2;
			var radtheta = (Math.PI * theta) / 180;
			var dist =
				Math.sin(radlat1) * Math.sin(radlat2) +
				Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
			dist = Math.acos(dist);
			dist = (dist * 180) / Math.PI;
			dist = dist * 60 * 1.1515;

			if (unit == "K") {
				dist = dist * 1.609344;
			}

			if (unit == "N") {
				dist = dist * 0.8684;
			}

			return dist;
		},

		setFavorite(business: BusinessObject) {
			user.isLoggedIn(true)
				.then((foundUser: firebase.User) => {
					data.getUsersFavorites(foundUser);
				})
				.catch(error => {
					alert("There was an error logging in: " + error);
				});
		}
	},

	computed: {
		showMap(): boolean {
			return this.viewMode === "map";
		},

		isFiltered(): boolean {
			return (
				!!this.filters.search.input ||
				!!this.filters.city.input ||
				!!this.filters.service.input
			);
		},

		activeList(): Array<BusinessObject> {
			let list = this.restaurants.filter(
				(restaurant: BusinessObject) => restaurant.name !== ""
			);

			return list;
		},

		sortedList(): Array<BusinessObject> {
			let list = this.filteredList;

			if (this.sortBy) {
				if (this.sortBy === "name") {
					list = _.sortBy(list, ["name"]);
				} else if (this.sortBy === "distance") {
					list = list.sort(function(a, b) {
						return parseFloat(a.distance) - parseFloat(b.distance);
					});
				}
			}

			return list;
		},

		filteredList(): Array<BusinessObject> {
			let list = this.activeList;

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
						item.city.toLowerCase() ===
						this.filters.city.input.toLowerCase()
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
		},

		$route(to, from) {
			this.filters.city.input = to.params.city_name
				? to.params.city_name
				: "";
		}
	},

	filters: {},

	components: {
		business: BusinessComponent,
		mapbox: MapComponent
	}
});
</script>

<style lang="scss" scoped>
$green: #20c997;
$orange: #fd7e14;
$purple: #6610f2;
$cyan: #3498db;
$map-height: 600px;

.directory {
	$grid-padding: 1.5rem;

	&__filters {
		display: flex;
		margin: 0 0 1rem;
		flex-wrap: wrap;
		align-items: center;
	}

	&__grid {
		flex: 1;
		width: 100%;
		display: flex;
		flex-wrap: wrap;
	}

	&__list {
		//margin: 0 (-$padding);
		margin: 0;
		padding: 0;
		list-style: none;
		//column-count: 3;
		gap: 1.5rem;
		flex: 1;

		&--with-map {
			height: $map-height;
			overflow: scroll;
			border-radius: 1rem;

			@media only screen and (max-width: 65em) {
				width: 100%;
				height: auto;
				flex: 100% 0 0;
				margin: 0;
			}
		}
	}

	&__map {
		height: $map-height;
		width: 66.666%;
		margin-right: $grid-padding;

		@media only screen and (max-width: 65em) {
			width: 100%;
			flex: 100% 0 0;
			margin: 0 0 1rem;
			height: 100vh;
		}
	}

	&__item {
		//flex: 1 1 $item-width;
		//max-width: $item-width;
		//padding: 0 ($padding / 2);
		//display: inline-block;
		margin-bottom: 1.5rem;
	}

	&__loading {
		i {
			margin-right: 0.5rem;
		}
	}
}

.filter {
	$filter: &;
	$input-border: 1px solid darken(white, 15);
	$input-border-radius: 100px;
	$input-padding: 0.25rem 1rem;
	$input-height: 1.8rem;
	margin-right: 0.5rem;
	user-select: none;

	&__input {
		display: flex;
		align-items: center;
		margin-bottom: 0.5rem;
		margin-right: 0.5rem;

		&:last-child {
			margin-right: 0;
		}

		&--select {
			select {
				appearance: none;
				background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%239B9B9B" d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z" /></svg>');
				background-repeat: no-repeat;
				background-position: calc(100% - 1em) center;
				background-size: 0.75rem;
			}
		}

		&--checkbox {
			input {
				opacity: 0;
				visibility: hidden;
				display: none;

				&:checked + #{$filter}__pill {
					border-color: #20c997;
					background-color: #20c997;
					color: white;
				}
			}

			i {
				margin-right: 0.5rem;
			}

			#{$filter}__pill {
				cursor: pointer;
			}

			&:focus {
				outline: none;
				border-color: #20c997;
			}
		}
	}

	&__pill {
		border: $input-border;
		border-radius: $input-border-radius;
		padding: $input-padding;
		display: flex;
		align-items: center;
		line-height: $input-height;
		font-size: 0.85rem;
		font-family: "Poppins", sans-serif;
		display: flex;
		align-items: center;

		i {
			position: relative;
			top: 2px;
		}

		&:focus {
			outline: none;
			border-color: $green;
		}

		&--btn {
			cursor: pointer;
			background-color: $orange;
			border-color: $orange;
			color: white;

			&:focus {
				border-color: $orange;
			}
		}
	}

	&__btn {
		line-height: $input-height;
	}

	&--view {
		position: relative;
		padding-right: 0.5rem;
		margin-right: 0.5rem;

		@media only screen and (max-width: 65em) {
			padding-right: 0;
		}

		#{$filter}__pill {
			padding: 0;
			overflow: hidden;
		}

		#{$filter}__label {
			padding: 0.25rem 1rem;
			cursor: pointer;

			&:hover {
				background-color: darken(white, 5);
			}
		}

		#{$filter}__choice {
			//margin: 0;
			//line-height: 1;
			height: 100%;
			display: flex;

			input {
				display: none;

				&:checked + #{$filter}__label {
					background-color: $purple;
					color: white;
				}
			}

			&:first-child {
				#{$filter}__label {
					padding-left: 1rem;
				}
			}

			&:last-child {
				#{$filter}__label {
					padding-right: 1rem;
				}
			}
		}

		&::after {
			content: "";
			width: 1px;
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0.5rem;
			background-color: darken(white, 10);

			@media only screen and (max-width: 65em) {
				display: none;
			}
		}
	}

	&--service {
		display: flex;
		flex-wrap: wrap;
	}
}
</style>