<template lang="pug">
.business
    header.business__overview
        h2.business__name {{ business.name }}
        h5.business__location {{ business.city }}, {{ business.state }}

    .business__services(v-if="hasServices")
        .business__service.business__service--curbside(v-if="hasTakeout")
            i.fad.fa-check-circle
            span Takeout
        .business__service.business__service--curbside(v-if="hasCurbsidePickup")
            i.fad.fa-check-circle
            span Curbside Pick-up
        .business__service.business__service--curbside(v-if="hasDelivery")
            i.fad.fa-check-circle
            span Delivery
        .business__service.business__service--curbside(v-if="hasOnlineOrdering")
            i.fad.fa-check-circle
            span Online Ordering

    dl.business__info.business__info--hours(v-if="this.business.hours")
        dt.business__info__label
            span Hours
            small(v-if="this.business.start_date")  (starting {{ this.business.start_date }})
        dd.business__info__text {{ this.business.hours }}

    dl.business__info.business__info--specials(v-if="business.special_offers")
        dt.business__info__label Limited Time Offer
        dd.business__info__text {{ business.special_offers }}

    .business__contact
        a.business__link.business__link--directions(:href="directionsLink", target="_blank")
            i.fad.fa-fw.fa-2x.fa-directions
            div Directions
        a.business__link.business__link--phone(v-if="business.phone", :href="'tel:' + business.phone")
            i.fad.fa-fw.fa-2x.fa-phone
            div Call
        a.business__link.business__link--url(v-if="business.website", :href="business.website", target="_blank")
            i.fad.fa-fw.fa-2x.fa-link
            div {{ hasOnlineOrdering ? 'Order Online' : 'Visit Site' }}
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

import BusinessObject from "../interfaces/business";

export default Vue.extend({
	props: {
		business: Object as PropType<BusinessObject>
	},

	methods: {},

	computed: {
		hasServices(): boolean {
			return (
				this.hasTakeout ||
				this.hasOnlineOrdering ||
				this.hasDelivery ||
				this.hasCurbsidePickup
			);
		},

		hasTakeout(): boolean {
			return true;
		},

		hasOnlineOrdering(): boolean {
			return this.business.online_ordering === "TRUE" ? true : false;
		},

		hasDelivery(): boolean {
			return this.business.delivery === "TRUE" ? true : false;
		},

		hasCurbsidePickup(): boolean {
			return this.business.curbside_pickup === "TRUE" ? true : false;
		},

		singleLineAddress(): string {
			let address = [];

			if (this.business.street_address) {
				address.push(this.business.street_address);
				address.push(", ");
			}

			if (this.business.city) {
				address.push(this.business.city);

				if (this.business.state || this.business.zip_code) {
					address.push(", ");
				}
			}

			if (this.business.state) {
				address.push(this.business.state);

				if (this.business.zip_code) {
					address.push(" ");
				}
			}

			if (this.business.zip_code) {
				address.push(this.business.zip_code);
			}

			return address.join("");
		},

		directionsLink(): string {
			return "https://www.google.com/maps/dir//" + this.singleLineAddress;
		}
	}
});
</script>

<style lang="scss" scoped>
.business {
	$business: &;
	$spacing: 1rem;
	background-color: darken(white, 5);
	padding: $spacing * 1.5;
	background-image: linear-gradient(45deg, #6610f2, #6f42c1);
	color: white;
	border-radius: $spacing;

	&__overview {
	}

	&__name {
		margin: 0;
		line-height: 1.3em;
	}

	&__location {
		font-weight: normal;
		margin: 0;
	}

	&__services {
		margin: $spacing 0;
		font-size: 1.2rem;

		i {
			margin-right: $spacing / 2;
		}
	}

	&__contact {
		margin: $spacing (-$spacing * 1.5);
		margin-bottom: -$spacing * 1.5;
		padding: $spacing;
		padding-top: $spacing * 1.5;
		display: flex;
		background-color: rgba(black, 0.1);
	}

	&__link {
		text-align: center;
		flex: 1;
		text-decoration: none;

		i {
			color: white;
		}
	}

	&__info {
		$info: &;
		margin: $spacing 0 0;

		&__label {
			font-weight: bold;

			small {
				opacity: 0.6;
				font-weight: normal;
			}
		}

		&__text {
			margin: 0;

			+ #{$info}__label {
				margin-top: $spacing;
			}
		}

		&--specials {
			background-color: #20c997;
			margin-left: (-$spacing * 1.5);
			margin-right: (-$spacing * 1.5);
			padding: $spacing ($spacing * 1.5);

			+ #{$business}__contact {
				margin-top: 0;
			}
		}
	}
}
</style>