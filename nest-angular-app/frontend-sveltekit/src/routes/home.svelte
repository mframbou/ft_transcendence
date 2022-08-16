<script>
    import ParticlesBackground from "$lib/ParticlesBackground.svelte";
    import Navbar from "$lib/Navbar.svelte";
</script>

<!--<Navbar></Navbar>-->
<div class="wrapper">
	<div class="background" style="position: absolute; top: 0; left: 0; flex: 1; width: 100%; height: 100%;">
		<ParticlesBackground properties={ {lineColor: '#00ff00'} } --z-index="1" --background-color="transparent"/>
	</div>
	
	<div class="pouet">
		<h1>Pouet pouet</h1>
	</div>

</div>

<style lang="scss">

	.wrapper
	{
		position: relative;
		flex-grow: 1;
	}

	.pouet
	{
		//position: relative;
		//z-index: 0;
		height: 100%;
		width: 100%;
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
		//z-index: 2;
	}


</style>