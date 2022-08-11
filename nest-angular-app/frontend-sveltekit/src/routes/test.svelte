<script>
    import ParticlesBackground from "$lib/ParticlesBackground.svelte";
</script>

<div class="pouet">
	<h1>Pouet pouet</h1>
</div>

<div class="background" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
	<ParticlesBackground properties={ {lineColor: '#00ff00'} } --z-index="1" --background-color="transparent"/>
</div>

<style lang="scss">
	.pouet
	{
		position: relative;
		//z-index: 0;
		height: 100vh;
		width: 100vw;
		background-color: red;
	}

	h1
	{
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-family: NexaBlack;
		font-size: 8vw;
		//text-transform: uppercase;
		z-index: 2;
	}
</style>