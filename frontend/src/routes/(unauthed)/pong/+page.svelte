<script lang="ts">
	import Pong from '$lib/Pong.svelte';
	import Button from '$lib/Button.svelte';
</script>

<style lang="scss">
	.wrapper
	{
		height: 100vh;
		width: 100vw;
		background-color: #0C0813;
	}

</style>

<div class="wrapper">

	<Button on:click={() => alert('test')}>Pouet pouet</Button>

</div>

<!--<Pong/>-->