<script lang="ts">

	import Pong from '$lib/Pong.svelte';
	import Button from '$lib/Button.svelte';
	import NavbarV2 from '$lib/NavbarV2.svelte';

</script>

<style lang="scss">
	.wrapper
	{
		height: 100vh;
		width: 100vw;
		background-color: #0C0813;
		overflow: hidden;
	}

	.content
	{
		margin-top: 85px;
	}

</style>

<NavbarV2/>
<div class="wrapper">
	<div class="content">
		<Button on:click={() => alert('test')}>Pouet pouet</Button>
	</div>
</div>

<!--<Pong/>-->