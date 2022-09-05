<script lang-="ts">
    import '$lib/assets/global.scss';
    import Navbar from '$lib/Navbar.svelte';
    import { statusTrackerSocket } from "$lib/stores";

    statusTrackerSocket.subscribe(() => {});
</script>


<div class="wrapper">
	<Navbar/>
	<slot/>
</div>


<style lang="scss">

	.wrapper
	{
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
	}

</style>
