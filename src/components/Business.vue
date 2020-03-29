<template lang="pug">
.business(:class="'business--layout-' + layout")
   header.business__overview
      h2.business__name {{ business.name }}
      h5.business__location
         span {{ business.city }}, {{ business.state }}
         span(v-if="distance")  ({{ distance }} miles away)

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
      dd.business__info__text(v-html="newLineIt(this.business.hours)")

   dl.business__info.business__info--specials(v-if="business.special_offers")
      dt.business__info__label Limited Time Offer
      dd.business__info__text(v-html="newLineIt(business.special_offers)")

   .business__contact
      a.business__link.business__link--directions(v-if="business.street_address", @click="click(directionsLink, true)")
         i.fad.fa-fw.fa-2x.fa-directions
         div Directions
      a.business__link.business__link--phone(v-if="business.phone", @click="click('tel:' + business.phone)")
         i.fad.fa-fw.fa-2x.fa-phone
         div Call
      a.business__link.business__link--url(v-if="business.website", @click="click(business.website, true)")
         i.fad.fa-fw.fa-2x.fa-link
         div {{ hasOnlineOrdering ? 'Order Online' : 'Visit Site' }}
   .business__share(v-if="clicked")
      h4 Did you order some food from <b>{{ business.name }}</b>?
      h5 Let everyone know!
      social-sharing(:url="share.url", :title="share.title", :description="share.title", :quote="share.title", inline-template)
         div
            network.share-button(network="facebook")
               i.fab.fa-facebook-f
               span Share on Facebook
            network.share-button(network="twitter")
               i.fab.fa-twitter
               span Share on Twitter
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

import SocialSharing from "vue-social-sharing";

Vue.use(SocialSharing);

import BusinessObject from "../interfaces/business";

export default Vue.extend({
	data() {
		return {
			clicked: false as boolean,
			share: {
				title:
					"I just order some food from " +
					this.business.name +
					"!\n\nJoin me in supporting our local restaurants during this difficult time at SociallyDistantEats.com",
				url: "https://sociallydistanteats.com"
			}
		};
	},

	props: {
		business: Object as PropType<BusinessObject>,
		layout: String
	},

	methods: {
		newLineIt(text: string): string {
			return text.replace(/\n/g, "<br/>");
		},

		click(url: string, newWindow: boolean = false) {
			this.clicked = true;

			if (newWindow) {
				window.open(url);
			} else {
				window.location.href = url;
			}
		}
	},

	computed: {
		distance(): null | string {
			return this.business.distance
				? parseFloat(this.business.distance).toFixed(2)
				: null;
		},

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
	},

	filters: {}
});
</script>

<style lang="scss">
$blue: #3498db;

.business {
	$business: &;
	$spacing: 1rem;
	background-color: darken(white, 5);
	padding: $spacing * 1.5;
	background-image: linear-gradient(45deg, #6610f2, #6f42c1);
	color: white;
	border-radius: $spacing;
	overflow: hidden;

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

	&__share {
		background-color: $blue;
		margin-left: (-$spacing * 1.5);
		margin-right: (-$spacing * 1.5);
		padding: $spacing ($spacing * 1.5);
		margin-top: $spacing * 1.5;
		margin-bottom: -$spacing * 1.5;

		h4 {
			margin: 0;
		}

		h5 {
			margin: 0 0 0.25rem;
		}

		.share-button {
			border: 1px solid white;
			border-radius: 100px;
			padding: 0.25rem 1rem;
			display: inline-block;
			font-size: 0.8rem;
			text-transform: uppercase;
			font-weight: 500;
			letter-spacing: 0.05rem;
			margin: 0.5rem 0.5rem 0 0;
			cursor: pointer;

			i {
				margin-right: 0.25rem;
			}

			&:hover {
				background-color: white;
				color: $blue;
			}
		}
	}

	&--layout-infowindow {
		#{$business}__services {
			font-size: 1rem;
		}
	}
}
</style>