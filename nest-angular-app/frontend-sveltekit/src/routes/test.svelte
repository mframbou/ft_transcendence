<script>
    import FallingHeadsBackground from "$lib/FallingHeadsBackground.svelte";
</script>

<div class="pouet">
	<h1>Pouet pouet</h1>
</div>

<FallingHeadsBackground --z-index="1" --pointer-events="none" --background-color="transparent"/>

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