<script lang="ts">
    import {page} from '$app/stores';

		import ParticlesBackground from '../lib/ParticlesBackground.svelte';
</script>

<div class="wrapper">
	<div class="background">
		<ParticlesBackground properties={{lineColor: '#888888', minVelocity: 0.5, maxVelocity: 0.8}}/>
	</div>
	<div class="content">
		<h1>{$page.status}</h1>
		<h2>Oopsie doopsie</h2>
	</div>
</div>


<style lang="scss">

	.wrapper
	{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.background
	{
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #2c2b27;
	}

	.content
	{
		z-index: 1; // So that text is above the particles, but we can still click the background (if we put the whole wrapper we only click wrapper)

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		h1, h2
		{
			color: red;
		}

		h1
		{
			font-family: NexaBlack;
			font-size: 5rem;
			margin-bottom: 1rem;
		}

		h2
		{
			font-family: Lato;
			font-size: 2rem;
			font-weight: bold;
		}

	}

</style>