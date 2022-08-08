<script lang="ts">
	// import ParticlesBackground from '$lib/ParticlesBackground.svelte';
	import FallingHeadsBackground from "$lib/FallingHeadsBackground.svelte";

	function login()
	{
		alert('pouet');
	}

</script>

<div class="wrapwrapper">
	<div class="wrapper">
		<h1 class="title">Transcendence</h1>
		<div class="circle-wrapper">
			<button class="login-btn" on:click={login}>
				<p class="text">Login</p>
				<!--				Create circle svg-->


				<!--				<div id="circle" class="circle"/>-->
				<div class="svg-wrapper">
					<svg class="svg" width="200vw" height="200vh">

						<clipPath id="circle">
							<circle stroke="#ffffff" stroke-miterlimit="10" cx="50%" cy="50%" r="300"/>
						</clipPath>
					</svg>

					<svg class="svg" width="200vw" height="200vh">
						<circle cx="50%" cy="50%" r="150" stroke="black" stroke-width="3" fill="red"/>
					</svg>
				</div>
			</button>
		</div>
	</div>
	<FallingHeadsBackground --background-color='#0f0d25'/>
</div>

<style lang="scss">

	.wrapwrapper
	{
		display: grid;
		place-items: center;
		height: 100vh;
		overflow: hidden;
	}

	.wrapper
	{
		//position: absolute;
		//top: 50%;
		//left: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		//margin-top: auto;
		//transform: translate(-50%, calc(-50% + 50px)); //To center the text on the page
	}

	.title
	{
		z-index: 1;
		text-transform: uppercase;
		font-family: NexaBlack;
		font-size: clamp(10px, 10vw, 250px);
		user-select: none;
		color: white;

		clip-path: url("#circle");
	}

	.login-btn
	{
		text-transform: uppercase;
		font-family: Lato;
		font-weight: 700;
		font-size: min(3vw, 20px);
		padding: 1em 2em;
		cursor: pointer;
		user-select: none;
		transition: background-color 250ms ease;
		text-decoration: none;
		color: white;
		border: 3px solid #ccc;
		border-radius: 2px;
		background-color: rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(1px);

		&:hover
		{
			background-color: rgba(50, 50, 50, 0.4);
		}

		&:focus
		{
			outline: none;
		}
	}

	.circle-wrapper
	{
		position: relative;
		margin-top: 50px;
	}

	.text
	{
		position: relative; // Elements must be positioned to use z index
		z-index: 3;
		pointer-events: none; // can click / hover through text
	}

	.svg-wrapper
	{
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	#circle
	{
		//z-index: 2;
		//position: absolute;
		//top: 50%;
		//left: 50%;
		//transform: translate(-50%, -50%);
		//height: 50px;
		//width: 50px;
		//background-color: red;
		//border-radius: 999px;
		//transition: all 1500ms ease;
	}

	#circle:hover, .login-btn:hover > #circle
	{
		height: max(150vw, 150vh);
		//width: 10px;
		width: max(150vw, 150vh);
		background-color: green;
	}

</style>