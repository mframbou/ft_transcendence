<script lang="ts">

	import {browser} from '$app/env';
	import {onMount} from "svelte";
	import FallingHeadsBackground from "$lib/FallingHeadsBackground.svelte";

	function getCookie(name) {
		const value = "; " + document.cookie;
		const parts = value.split("; " + name + "=");
		if (parts.length == 2) return parts.pop().split(";").shift();
	}

	async function oauth42()
	{
		if (browser)
		{
			const { hostname } = window.location;

			window.location.href = (`http://${hostname}:3000/auth/42`);
		}
	}

	let loading = true;

	onMount(async () =>
	{

		if (browser)
		{
			// check if user is logged in
			const hostname = window.location.hostname;
			const checkLogin = await fetch(`http://${hostname}:3000/users/me`, {
				credentials: 'include',
			});

			// if logged in, redirect to home page
			if (checkLogin.status === 200)
			{
				window.location.href = '/home';
			}

		}
		// Chrome dev tools performance can slow down network to test
		loading = false;
	})

</script>

{#if loading}
	<div class="profile-menu"
			 style="width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; background-color: #E1CDB5; z-index: 999">
		<div class="spinning-ring">
		</div>
	</div>
{/if}

<div class="page-wrapper">

	<div class="page-front"/>

	<div class="content-front">
		<h1 class="title">
			Transcendence
			<button on:click={oauth42} class="login-btn">
				<span class="add-42-logo">Login with</span>
			</button>
		</h1>
	</div>

	<div class="page-back"/>

	<!--	Need to put cloned HTML instead of doing it in JS because otherwise button click has no effect-->
	<div class="content-back">
		<h1 class="title">
			Transcendence
			<button on:click={oauth42} class="login-btn">
				<span class="add-42-logo">Login with</span>
			</button>
		</h1>
	</div>


</div>
<FallingHeadsBackground properties={ {imgHeight: 56, imgWidth: 56} } --z-index="3" --pointer-events="none"
												--background-color="transparent"/>


<style lang="scss">

	.spinning-ring
	{
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 64px;
		height: 64px;
		margin: 8px;
		border-radius: 50%;
		border: 6px solid #fff;
		border-color: #fff transparent #fff transparent;
		animation: lds-dual-ring 1.2s linear infinite;
	}

	@keyframes lds-dual-ring
	{
		0%
		{
			transform: rotate(0deg);
		}
		100%
		{
			transform: rotate(360deg);
		}
	}

	//$radial-gradient: radial-gradient(farthest-side, white 79.99%, transparent 80%, transparent 95%, white 95.01%, white 99.99%, transparent 100%) center center/0px 0px no-repeat;
	$radial-gradient: radial-gradient(farthest-side, white 99.99%, transparent 100%) center center/0px 0px no-repeat;
	$scale-size: max(180vw, 180vh);
	$transition: 1s cubic-bezier(.33, .09, .2, 1);

	.page-wrapper
	{
		height: 100%;
		width: 100%;
	}

	.content-front, .content-back
	{
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: transparent;
	}

	.content-front, .content-back, .page-front, .page-back
	{
		transition: mask $transition, -webkit-mask $transition;
	}

	.title
	{
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-transform: uppercase;
		font-family: NexaBlack;
		font-size: clamp(10px, 95%, 250px);
	}

	.login-btn
	{
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;

		position: absolute;
		top: 100%;
		text-transform: uppercase;
		font-family: Lato;
		font-weight: 700;
		margin-top: 50px;

		font-size: clamp(12px, 2.5vw, 24px);
		padding: 1em 2em;
		cursor: pointer;
		transition: background-color 250ms ease;
		text-decoration: none;
		border: 3px solid;
		border-radius: 3px;

		&:focus
		{
			outline: none;
		}
	}

	.add-42-logo
	{
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;


		&:after
		{
			$size: 1.5em;

			content: url("/images/42_Logo_white.svg");
			display: inline-block;
			height: $size;
			width: $size;
			margin-left: 0.2em;
			margin-top: 0.1em;
		}
	}

	.page-back
	{
		z-index: 1;

		//background-color: #49306B;
		background-color: #030f31;
	}

	.page-front
	{
		z-index: 2;

		background-color: #E1CDB5;
	}

	.content-front
	{
		z-index: 5;

		.title
		{
			color: black;
		}

		.login-btn
		{
			color: black;
			border-color: #313131;
			background-color: rgba(255, 255, 255, 0.4);

			&:hover
			{
				background-color: rgba(50, 50, 50, 0.4);
			}

			.add-42-logo:after
			{
				content: url("/images/42_Logo_black.svg");
			}
		}
	}

	// Global so that unsued css (because clone in js) are not deleted
	:global(.content-back)
	{
		z-index: 4;

		.title
		{
			color: white;
		}

		.login-btn
		{
			color: white;
			border-color: #ccc;
			background-color: rgba(0, 0, 0, 0.15);

			&:hover
			{
				background-color: rgba(205, 205, 205, 0.4);
			}
		}

		// Inverted mask (circle shows content instead of hiding)
		-webkit-mask: $radial-gradient,
		linear-gradient(transparent, transparent);
		-webkit-mask-composite: source-out;

		mask: $radial-gradient,
		linear-gradient(transparent, transparent);
		mask-composite: add;
	}

	.title
	{
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-transform: uppercase;
		font-family: NexaBlack;
		font-size: clamp(10px, 9.5vw, 250px);
	}

	// https://stackoverflow.com/questions/37000558/clip-path-inset-circle
	.page-wrapper:hover
	{
		& > .page-front, & > .content-front, & > .content-back
		{
			mask-size: $scale-size $scale-size, auto;
			-webkit-mask-size: $scale-size $scale-size, auto;
		}

		& > .page-front, & > .content-front
		{
			pointer-events: none;
		}
	}

	.page-front, .content-front
	{
		// Put webkit mask before so that mozilla applies mask and not webkit-mask
		-webkit-mask: $radial-gradient,
		linear-gradient(#fff, #fff);
		-webkit-mask-composite: xor; // tried all values and this is the only one working without a background

		mask: $radial-gradient,
		linear-gradient(#fff, #fff);
		mask-composite: exclude;
	}

	.page-front, .page-back
	{
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

</style>