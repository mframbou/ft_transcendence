<script>
    import '$lib/assets/global.scss';
    import Navbar from '$lib/Navbar.svelte';
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
		height: 100vh;
	}
</style>
