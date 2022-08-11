<script lang="ts">

	import {browser} from '$app/env';
	import {onMount} from "svelte";
	import FallingHeadsBackground from "$lib/FallingHeadsBackground.svelte";

	function login()
	{
		alert('pouet');
	}

	let loading = true;

	onMount(async () =>
	{

		if (browser)
		{
			const timeNow = new Date().getTime();

			let contentsFront = document.querySelector('.content-front');
			let contentsBack = document.querySelector('.content-back');

			if (contentsFront && contentsBack)
			{
				let newContentsBack = contentsFront.cloneNode(true);
				newContentsBack.classList.remove('content-front');
				newContentsBack.classList.add('content-back');
				contentsBack.replaceWith(newContentsBack);
			}


			// Chrome dev tools performance can slow down network to test
			const endTime = new Date().getTime();

			// if (endTime - timeNow < 1000)
			// {
			// 	await new Promise(resolve => setTimeout(resolve, 1000 - (endTime - timeNow)));
			// }
			loading = false;
		}
	})
</script>

{#if loading}
	<div class="test" style="width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; background-color: #E1CDB5; z-index: 999">
		<div class="spinning-ring">
		</div>
	</div>
{/if}

<div class="page-wrapper">

	<div class="page-front"/>

	<div class="content-front">
		<h1 class="title">
			Transcendence
			<button class="login-btn">Login</button>
		</h1>
	</div>

	<div class="page-back"/>

	<div class="content-back">
<!--		<h1 class="title">-->
<!--			pouet pouet-->
<!--			<button class="login-btn">Login</button>-->
<!--		</h1>-->
	</div>


</div>
<FallingHeadsBackground --z-index="3" --pointer-events="none" --background-color="transparent"/>



<style lang="scss">

	.spinning-ring {
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
	@keyframes lds-dual-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
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
		font-size: clamp(10px, 9.5vw, 250px);
	}

	.login-btn
	{
		//backdrop-filter: blur(10px);
		position: absolute;
		top: 100%;
		text-transform: uppercase;
		font-family: Lato;
		font-weight: 700;
		margin-top: 50px;

		font-size: min(3vw, 20px);
		padding: 1em 2em;
		cursor: pointer;
		transition: background-color 250ms ease;
		text-decoration: none;
		border-radius: 2px;

		&:focus
		{
			outline: none;
		}
	}

	.page-back
	{
		z-index: 1;

		background-color: #49306B;
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
			background-color: rgba(255, 255, 255, 0.15);

			&:hover
			{
				background-color: rgba(205, 205, 205, 0.4);
			}
		}

		-webkit-mask: $radial-gradient,
		linear-gradient(#fff, #fff);
		-webkit-mask-composite: xor; // tried all values and this is the only one working without a background

		mask: $radial-gradient,
		linear-gradient(#fff, #fff);
		mask-composite: exclude;

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
				background-color: rgba(50, 50, 50, 0.4);
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

	.login-btn
	{
		//backdrop-filter: blur(10px);
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
		border-radius: 2px;
		border: 3px solid;

		&:focus
		{
			outline: none;
		}
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

	.page-front, .page-back
	{
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;

		// Put webkit mask before so that mozilla applies mask and not webkit-mask
		-webkit-mask: $radial-gradient,
		linear-gradient(#fff, #fff);
		-webkit-mask-composite: xor; // tried all values and this is the only one working without a background

		mask: $radial-gradient,
		linear-gradient(#fff, #fff);
		mask-composite: exclude;
	}

</style>