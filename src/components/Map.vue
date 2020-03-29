<template lang="pug">
    figure.map
        .map__box(:id="name")
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";

import {} from "googlemaps";
import BusinessObject from "../interfaces/business";
import BusinessComponent from "@/components/Business.vue";

import _ from "lodash";

const restaurantIconSize = 28;
const userLocationIcon = restaurantIconSize * 1.5;

export default Vue.extend({
	data() {
		return {
			map: null as null | google.maps.Map,
			infowindow: null as null | google.maps.InfoWindow,
			geolocation: false as boolean,
			userLatLng: null as null | google.maps.LatLng,
			markers: [] as Array<google.maps.Marker>,
			userLocationIcon: {
				url: "/images/icon-home.svg",
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(
					userLocationIcon / 2,
					userLocationIcon
				),
				scaledSize: new google.maps.Size(
					userLocationIcon,
					userLocationIcon
				)
			},
			restaurantIcon: {
				url: "/images/icon-restaurant.svg",
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(
					restaurantIconSize / 2,
					restaurantIconSize
				),
				scaledSize: new google.maps.Size(
					restaurantIconSize,
					restaurantIconSize
				)
			},
			activeRestaurantIcon: {
				url: "/images/icon-restaurant-active.svg",
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(
					restaurantIconSize / 2,
					restaurantIconSize
				),
				scaledSize: new google.maps.Size(
					restaurantIconSize,
					restaurantIconSize
				)
			},
			inactiveRestaurantIcon: {
				url: "/images/icon-restaurant-inactive.svg",
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(
					restaurantIconSize / 2,
					restaurantIconSize
				),
				scaledSize: new google.maps.Size(
					restaurantIconSize,
					restaurantIconSize
				)
			}
		};
	},

	mounted() {
		this.initMap();
	},

	props: ["allRestaurants", "filteredRestaurants", "name", "center"],

	methods: {
		initMap() {
			const element = document.getElementById(this.name);

			if (element) {
				const options: google.maps.MapOptions = {
					zoom: 12,
					center: new google.maps.LatLng(
						this.center.lat,
						this.center.lng
					),
					mapTypeControl: false,
					fullscreenControl: false,
					streetViewControl: window.innerWidth < 600 ? false : true,
					styles: [
						{
							featureType: "poi",
							elementType: "all",
							stylers: [
								{
									visibility: "off"
								}
							]
						}
					]
				};

				this.map = new google.maps.Map(element, options);
				this.infowindow = new google.maps.InfoWindow();

				if (this.map) {
					google.maps.event.addListener(
						this.map,
						"click",
						(event: any) => {
							if (this.infowindow) {
								this.infowindow.close();
							}
						}
					);

					this.addMarkers().then(() => {
						this.setActiveMarkers().then(() => {
							this.setGeolocation().then(() => {});
						});
					});
				}
			}
		},

		addMarkers(): Promise<boolean> {
			return new Promise((resolve, reject) => {
				if (this.map) {
					this.allRestaurants.forEach(
						(restaurant: BusinessObject) => {
							let pos = new google.maps.LatLng(
								parseFloat(restaurant.latitude),
								parseFloat(restaurant.longitude)
							);

							if (pos && this.map) {
								let marker = new google.maps.Marker({
									map: this.map,
									position: pos,
									icon: this.restaurantIcon,
									title: restaurant.name
								});

								marker.addListener("click", () => {
									if (this.map && this.infowindow) {
										var Business = Vue.extend(
											BusinessComponent
										) as VueConstructor;

										var instance = new Business({
											propsData: {
												business: restaurant,
												layout: "infowindow"
											}
										});

										instance.$mount();

										this.infowindow.setContent(
											instance.$el
										);

										this.infowindow.open(this.map, marker);
									}
								});

								this.markers.push(marker);
							} else {
								reject(false);
							}
						}
					);

					this.setMapBounds(this.markers);

					resolve(true);
				} else {
					reject(false);
				}
			});
		},

		setActiveMarkers() {
			return new Promise((resolve, reject) => {
				let activeMarkers = [] as Array<google.maps.Marker>;

				this.markers.forEach((marker: google.maps.Marker) => {
					let isActive = this.filteredRestaurants.some(
						(restaurant: BusinessObject) =>
							restaurant.name === marker.getTitle()
					);

					if (this.isFiltered) {
						if (isActive) {
							marker.setIcon(this.activeRestaurantIcon);
							marker.setZIndex(1000);
							activeMarkers.push(marker);
						} else {
							marker.setIcon(this.inactiveRestaurantIcon);
							marker.setZIndex(10);
						}
					} else {
						marker.setIcon(this.restaurantIcon);
						marker.setZIndex(10);
					}
				});

				this.setMapBounds(activeMarkers);

				if (!this.isFiltered) {
					this.centerUser();
				}

				resolve();
			});
		},

		setMapBounds(markers: Array<google.maps.Marker>) {
			const bounds = new google.maps.LatLngBounds();

			markers.forEach((marker: google.maps.Marker) => {
				let position = marker.getPosition();

				if (position) {
					bounds.extend(position);
				}
			});

			if (this.map) {
				this.map.fitBounds(bounds);
			}
		},

		setGeolocation() {
			return new Promise((resolve, reject) => {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						position => {
							if (this.map) {
								this.geolocation = true;

								this.userLatLng = new google.maps.LatLng(
									position.coords.latitude,
									position.coords.longitude
								);

								let marker = new google.maps.Marker({
									position: this.userLatLng,
									map: this.map,
									icon: this.userLocationIcon,
									title: "My Location",
									zIndex: 100
								});

								if (!this.isFiltered) {
									this.centerUser();
								}

								this.$emit("geolocate", this.userLatLng);

								resolve();
							}
						},
						() => {}
					);
				}

				this.setMapBounds(this.markers);
				resolve();
			});
		},

		centerUser() {
			if (this.map && this.userLatLng) {
				this.map.setCenter(this.userLatLng);
				this.map.setZoom(13);
			}
		},

		handleLocationError(
			browserHasGeolocation: boolean,
			infoWindow: google.maps.InfoWindow,
			pos: google.maps.LatLng
		) {
			if (this.map) {
				infoWindow.setPosition(pos);
				infoWindow.setContent(
					browserHasGeolocation
						? "Error: The Geolocation service failed."
						: "Error: Your browser doesn't support geolocation."
				);
				infoWindow.open(this.map);
			}
		}
	},

	computed: {
		isFiltered(): boolean {
			return this.filteredRestaurants !== this.allRestaurants;
		}
	},

	watch: {
		filteredRestaurants: {
			handler() {
				this.setActiveMarkers();
			}
		}
	}
});
</script>

<style lang="scss">
.map {
	margin: 0;

	&,
	&__box {
		height: 100%;
		width: 100%;
		border-radius: 1rem;
		overflow: hidden;

		@media only screen and (max-width: 65em) {
			border-radius: 0;
		}
	}

	.gm-style {
		.gm-style-iw {
			max-width: none !important;
			border-radius: 1rem;
			padding: 0;

			.gm-style-iw-d {
				max-width: none !important;
				overflow: hidden !important;
				width: 300px;

				@media only screen and (max-width: 65em) {
					width: 275px;
				}
			}
		}

		.gm-style-iw-t::after {
			background: linear-gradient(
				45deg,
				rgba(#5e21ce, 1) 50%,
				rgba(255, 255, 255, 0) 51%,
				rgba(255, 255, 255, 0) 100%
			);
		}

		button[title="Close"] {
			top: 0 !important;
			right: 0 !important;
		}
	}
}
</style>