<script lang="ts">

	import { createEventDispatcher, onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	export let duration: number = 5000;
	export let shown: boolean = true;
	export let allowClose: boolean = true;
	export let fixedPosition: boolean = true;
	export let animateIn: boolean = true;
	export let animateOut: boolean = true;

	let progressBar: HTMLDivElement;
	let lastUpdate: number = 0;

	const dispatch = createEventDispatcher();

	function handleCloseButtonClick()
	{
		dispatch('close');
		shown = false;
	}

	function handleClick()
	{
		dispatch('click');
	}

	function updateProgressBar()
	{
		// return;

		if (!shown)
			return;

		const now = performance.now();
		const delta = now - lastUpdate;
		lastUpdate = now;
		if (!progressBar) // accept/decline button
			return;

		let progress = progressBar.style.width;
		if (!progress)
			progress = '100%';

		const newProgress = Math.max(0, parseFloat(progress) - delta / duration * 100);
		progressBar.style.width = newProgress + '%';
		if (newProgress > 0)
		{
			requestAnimationFrame(updateProgressBar);
		}
		else
		{
			dispatch('close');
			shown = false;
		}
	}

	onMount(() => {

		console.log('creating notification');

		lastUpdate = performance.now();
		// setIntervavl so that progressbar goes from 100% to 0% in duration
		requestAnimationFrame(updateProgressBar);
	})

	function test() {
		console.log("testos");
	}

</script>

{#if shown}
	<div class="notification" style="animation-duration: {duration}ms" class:fixed-notification={fixedPosition} class:relative-notification={!fixedPosition}>
		<div class="loading-bar" bind:this={progressBar}/>
		<slot />
		{#if allowClose}
			<button class="close" on:click={handleCloseButtonClick}>×</button>
		{/if}
	</div>
{/if}

<style lang="scss">

	.fixed-notification
	{
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		max-width: 30%;
	}

	.relative-notification
	{
		position: relative;
	}

	.notification {

		$base-padding: 1.25rem;
		padding: $base-padding calc($base-padding + 0.75rem) $base-padding $base-padding;

		background-color: var(--background-color, #20192c);
		text-align: center;
		border-radius: 0.25rem;
		overflow: hidden;
	}

	.loading-bar
	{
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 0.25rem;
		background: var(--loading-bar-background, linear-gradient(to right, #6139FF , #4255FE));
		animation: loading-bar 1s linear infinite;
	}

	.close {
		position: absolute;
		top: 0;
		right: 0;
		padding: 0.5rem;
		background-color: transparent;
		border: none;
		color: var(--close-button-color, #958ebe);
		font-size: 1.5rem;
		cursor: pointer;
	}

</style>