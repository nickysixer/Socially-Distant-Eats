<template lang="pug">
    #app.app.app__page.app__page--home
        header.app__masthead
            router-link.app__logo(to="/")
                img(src="/images/SociallyDistantEatsLogo-Color.png")
            .app__menu
                a.btn.btn--sm.btn--muted(href="https://docs.google.com/forms/d/e/1FAIpQLSdZNyPhC_W2xBpN6_MjGofKJ893F7OExc1TCNgtAYpIYeC7oQ/viewform", target="_blank")
                    i.fad.fa-plus-circle
                    span Submit A Restaurant
        main.app__workbench
            router-view
        footer.app__bottom
            span(v-html="attribution")
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

import "../node_modules/font-awesome/scss/font-awesome.scss";
import "./assets/scss/style.scss";

export default Vue.extend({
	data() {
		return {
			attribution: "SociallyDistantEats.com is the project conceived by Nick Goers of <a href='https://www.company119.com' target='_blank'>Company 119</a> to help local restaurants during the COVID-19 crisis. Please consider suggesting more local restaurants for the list!" as string
		};
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

	&__masthead,
	&__workbench,
	&__bottom {
		margin: 0 auto;
		width: 95%;
		//max-width: 1200px;
	}

	&__masthead {
		margin-bottom: 1rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
	}

	&__menu {
		a {
			//color: rgba(black, 0.5);
			text-decoration: none;

			i {
				margin-right: 0.25rem;
			}
		}
	}

	&__logo {
		width: 22rem;
		max-width: 90%;
		margin: 0.5rem 0;
		margin-right: 1rem;

		img {
			display: block;
			width: 100%;
		}
	}

	&__bottom {
		opacity: 0.5;
		margin-top: 2rem;

		a {
			text-decoration: none;
		}
	}
}
</style>