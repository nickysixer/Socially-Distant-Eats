<template lang="pug">
    .directory
        .directory__loading(v-if="isLoading")
            h3
               i.fad.fa-spin.fa-spinner
               span Loading restaurants
        template(v-else)
            .directory__filters
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
                        button.filter__pill.filter__pill--btn(@click.prevent="reset") Clear Search

            .directory__grid
                masonry.directory__list(v-if="sortedList.length", :cols="{default: 3, 1024: 2, 680: 1}", :gutter="30")
                    .directory__item(v-for="(restaurant, index) in sortedList", v-if="!!restaurant.name" :key="restaurant.name")
                        business-component(:business="restaurant")
                .directory__empty(v-else)
                    h2 Sorry, we were unable to find any restaurants that matched your search criteria. Give it another go.
                    button.btn(@click.prevent="reset") Reset Search
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

import BusinessObject from "@/interfaces/business";
import BusinessComponent from "@/components/BusinessComponent.vue";

import _ from "lodash";
import tabletop from "tabletop";
import VueMasonry from "vue-masonry-css";

Vue.use(VueMasonry);

export default Vue.extend({
	data() {
		return {
			isLoading: true,
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
		"business-component": BusinessComponent
	}
});
</script>

<style lang="scss" scoped>
$green: #20c997;
$orange: #fd7e14;

.directory {
	&__filters {
		display: flex;
		margin: 0 0 1rem;
		flex-wrap: wrap;
		align-items: center;
	}

	&__grid {
		$padding: 1.5rem;
		flex: 1;
		width: 100%;
	}

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
	$input-padding: 0.5rem 1rem;
	$input-height: 1.8rem;
	margin-right: 0.5rem;

	&__pill {
		border: $input-border;
		border-radius: $input-border-radius;
		padding: $input-padding;
		display: flex;
		align-items: center;
		line-height: $input-height;
		font-size: 0.9rem;
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
			background-color: $orange;
			border-color: $orange;
			color: white;

			&:focus {
				border-color: $orange;
			}
		}
	}

	&__input {
		display: flex;
		align-items: center;
		margin-bottom: 0.5rem;

		& + & {
			margin-left: 0.5rem;
		}

		&--select {
			select {
				appearance: none;
			}
		}

		&--text {
			input {
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

			&:focus {
				outline: none;
				border-color: #20c997;
			}
		}
	}

	&__btn {
		line-height: $input-height;
	}

	&--service {
		display: flex;
		flex-wrap: wrap;
	}
}
</style>