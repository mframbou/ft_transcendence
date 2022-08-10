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
	</div>


	<div class="content-front">
		<h1 class="title" data-title="Transcendence">
			Transcendence
			<button class="login-btn">Login</button>
		</h1>
	</div>

	<div class="page-back">
	</div>

	<div class="content-back">
		<h1 class="title" data-title="Transcendence">
			Transcendence
			<button class="login-btn">Login</button>
		</h1>
	</div>


</div>
<FallingHeadsBackground --z-index="3" --pointer-events="none" --background-color="transparent"/>


<style lang="scss">

	.global-wrapper, .page-front, :global(.page-back)
	{
		position: relative;
	}

	.global-wrapper
	{
		height: 100vh;
		width: 100vw;
	}

	.content-front, .content-back
	{
		position:absolute;
		top:0;
		left:0;
		width:100%;
		height:100%;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		transition: mask 2.5s, -webkit-mask 2.5s;
	}

	.content-front
	{
		.title
		{
			color: yellow;
		}

		-webkit-mask: radial-gradient(farthest-side, white 99.99%, transparent 100%) center center/0px 0px no-repeat,
		linear-gradient(#fff, #fff);
		-webkit-mask-composite: xor; // tried all values and this is the only one working without a background

		mask: radial-gradient(farthest-side, white 99.99%, transparent 100%) center center/0px 0px no-repeat,
		linear-gradient(#fff, #fff);
		mask-composite: exclude;


		z-index: 5;
		background: transparent;
	}


	.content-back
	{
		-webkit-mask: radial-gradient(farthest-side, white 99.99%, transparent 100%) center center/0px 0px no-repeat,
		linear-gradient(transparent, transparent);
		-webkit-mask-composite: source-out;


		mask: radial-gradient(farthest-side, black 99.99%, transparent 100%) center center/0px 0px no-repeat,
		linear-gradient(transparent, transparent);
		mask-composite: add;

		.title
		{
			font-size: 10vw;
			color: white;
		}
		z-index: 4;

		background: transparent;
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
	.global-wrapper:hover > .page-front, .global-wrapper:hover > .content-front, .global-wrapper:hover > .content-back
	{
		$size: max(140vw, 140vh);

		-webkit-mask-size: $size $size, auto;
		mask-size: $size $size, auto;
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

		// Put webkit mask before so that mozilla applies mask and not webkit-mask
		-webkit-mask: radial-gradient(farthest-side, white 99.99%, transparent 100%) center center/0px 0px no-repeat,
		linear-gradient(#fff, #fff);
		-webkit-mask-composite: destination-out;

		mask: radial-gradient(farthest-side, white 99.99%, transparent 100%) center center/0px 0px no-repeat,
		linear-gradient(#fff, #fff);
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