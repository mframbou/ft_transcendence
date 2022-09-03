<script lang="ts">
	export let modalShown = true;

	let wrapperElement;

	function closeModal()
	{
		console.log('closing modal')
		modalShown = false;
	}

	function handleClick(e)
	{
		if (e.target === wrapperElement)
			closeModal();
	}

</script>

{#if modalShown}
	<div class="wrapper" on:click={handleClick} bind:this={wrapperElement}>
		<div class="card">
			<slot/>
		</div>
	</div>
{/if}

<style lang="scss">

	.wrapper
	{
		position: fixed;
		top: 0;
		left: 0;
		z-index: 9999;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.9);

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card
	{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		min-width: 300px;
		max-width: 500px;
		min-height: 100px;
		background-color: var(--background-color, white);
		border-radius: 10px;
		padding: 20px;

		z-index: 1;
		color: var(--text-color, black);
	}

</style>