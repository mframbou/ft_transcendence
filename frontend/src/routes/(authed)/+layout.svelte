<script lang-="ts">
    import '$lib/assets/global.scss';
    import NavbarV2 from '$lib/NavbarV2.svelte';
    import { statusTrackerSocket } from "$lib/stores";

    statusTrackerSocket.subscribe(() => {});
</script>


<div class="wrapper">
	<!--	Relative pos with flex column so that we dont need margin top (so we can change navbar height without having to bother changing in layout) -->
	<NavbarV2 relativePos={true}/>
	<main>
		<slot/>
	</main>
</div>


<style lang="scss">

	.wrapper
	{
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: #0C0813;

		display: flex;
		flex-direction: column;
	}

	main
	{
		flex-grow: 1;
		position: relative;
		//transform-style: preserve-3d;
	}

</style>
