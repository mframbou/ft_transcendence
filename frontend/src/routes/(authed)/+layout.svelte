<script lang-="ts">
    import '$lib/assets/global.scss';
    import NavbarV2 from '$lib/NavbarV2.svelte';
    import { statusTrackerSocket } from "$lib/stores";

    statusTrackerSocket.subscribe(() => {});
</script>


<div class="wrapper">
	<!--	Relative pos with flex column so that we dont need margin top (so we can change navbar height without having to bother changing in layout) -->
	<div class="navbar-wrapper">
		<NavbarV2 relativePos={true}/>
	</div>
	<main>
		<slot/>
	</main>
</div>


<style lang="scss">

	@media (min-width: 860px)
	{
		.wrapper
		{
			flex-direction: column;
		}
	}

	@media (max-width: 859px)
	{
		.wrapper
		{
			flex-direction: row;
		}
	}

	.navbar-wrapper
	{
		flex: 0 0 auto;
	}

	.wrapper
	{
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: #0C0813;

		display: flex;
	}

	main
	{
		flex-grow: 1;
		position: relative;
		overflow: auto;
		//transform-style: preserve-3d;
	}

</style>
