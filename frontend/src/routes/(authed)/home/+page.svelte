<script>
    import ParticlesBackground from "$lib/ParticlesBackground.svelte";




</script>

<!--<Navbar></Navbar>-->
<div class="wrapper">
	<div class="background" style="position: absolute; top: 0; left: 0; flex: 1; width: 100%; height: 100%;">
		<ParticlesBackground --background-color="transparent" --z-index="1" properties={ {lineColor: '#00ff00'} }/>
	</div>


    <a href="/bellopongo"> BELLO PONGO </a>

</div>

<style lang="scss">

	.wrapper
	{
		height: 100%;
		width: 100%;
		position: relative;
	}

	.pouet
	{
		//position: relative;
		//z-index: 0;
		width: 100%;
		height: 100%;
		background-color: red;
	}

	h1
	{
		font-family: NexaBlack;
		font-size: 8vw;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		//text-transform: uppercase;
		//z-index: 2;
	}

    a{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 8vw;
        font-family: NexaBlack;
        text-decoration: none;
        color: white;
    }



</style>