<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import Counter from '$lib/Counter.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta content="Svelte demo app" name="description"/>
</svelte:head>

<section>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset="svelte-welcome.webp" type="image/webp"/>
				<img alt="Welcome" src="svelte-welcome.png"/>
			</picture>
		</span>

		to your new<br/>SvelteKit app
	</h1>

	<h2>
		try editing <strong>src/routes/index.svelte</strong>
	</h2>

	<Counter/>
</section>

<style lang="scss">
	section
	{
		display: flex;
		align-items: center;
		flex: 1;
		flex-direction: column;
		justify-content: center;
	}

	h1
	{
		width: 100%;
	}

	.welcome
	{
		position: relative;
		display: block;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img
	{
		position: absolute;
		top: 0;
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
