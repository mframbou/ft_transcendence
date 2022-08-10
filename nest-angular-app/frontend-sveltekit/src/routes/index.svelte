<script lang="ts">

	import {browser} from '$app/env';
	import {onMount} from "svelte";
	import FallingHeadsBackground from "$lib/FallingHeadsBackground.svelte";

	function login()
	{
		alert('pouet');
	}

	onMount(() =>
	{

		if (browser)
		{
			// let page = document.querySelector('.page-front');
			// let pageBehind = page.cloneNode(true);
			//
			// pageBehind.classList.remove('page-front');
			// pageBehind.classList.add('page-back');
			//
			// document.querySelector('.global-wrapper').appendChild(pageBehind);
		}
	})
</script>

<div class="global-wrapper">

	<div class="page-front">
		<h1 class="title" data-title="Transcendence">
			Transcendence
			<button class="login-btn">Login</button>
		</h1>
	</div>
</div>

<FallingHeadsBackground --z-index="10" --pointer-events="none" --background-color="transparent"/>

<style lang="scss">

	.global-wrapper, .page-front, :global(.page-back)
	{
		position: relative;
	}

	// Need to put page-black global otherwise sveltekit removes unused css
	:global(.page-back)
	{
		z-index: 1;
		background: red;

		.title
		{
			position: absolute;
			z-index: 1000000;
			color: black;
		}

		.login-btn
		{
			color: black;
			border: 3px solid blue;
			background-color: rgba(255, 255, 255, 0.15);

			&:hover
			{
				background-color: rgba(205, 205, 205, 0.4);
			}
		}
	}

	.page-front
	{
		z-index: 2;
		background: blue;

		.title
		{
			position: absolute;
			z-index: 50000;
			color: white;
		}

		.login-btn
		{
			color: white;
			border: 3px solid #ccc;
			background-color: rgba(0, 0, 0, 0.15);

			&:hover
			{
				background-color: rgba(50, 50, 50, 0.4);
			}
		}
	}

	.global-wrapper
	{
		//pointer-events: none;
	}

	// https://stackoverflow.com/questions/37000558/clip-path-inset-circle
	.global-wrapper:hover > .page-front
	{
		$size: max(140vw, 140vh);

		mask-size: $size $size, auto;
		-webkit-mask-size: $size $size, auto;
		pointer-events: none;
	}

	.page-front, :global(.page-back)
	{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		height: 100vh;
		width: 100vw;
		position: absolute;
		top: 0;
		left: 0;

		mask: radial-gradient(farthest-side, white 99.99%, transparent 100%) center center/0px 0px no-repeat,
		linear-gradient(#fff, #fff);
		mask-composite: exclude;

		-webkit-mask: radial-gradient(farthest-side, white 99.99%, transparent 100%) center center/0px 0px no-repeat,
		linear-gradient(#fff, #fff);
		-webkit-mask-composite: destination-out;

		mask-composite: exclude;
		transition: mask 2.5s, -webkit-mask 2.5s;
	}

	.title
	{
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-transform: uppercase;
		font-family: NexaBlack;
		font-size: clamp(10px, 9vw, 250px);
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

</style>