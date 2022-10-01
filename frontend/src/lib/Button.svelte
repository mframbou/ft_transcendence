<script lang="ts">
	export let glowing: boolean = true;
	export let border: boolean = true;
	export let disabled = false;
</script>

<style lang="scss">

	$border-width: var(--border-width, 2px);
	$vertical-padding: var(--vertical-padding, 15px);
	$horizontal-padding: var(--horizontal-padding, 20px);

	.button
	{
		position: relative;
		z-index: 1;
		border-radius: var(--border-radius, 100vw);
		outline: none;
		border: none;
		cursor: pointer;
		background: var(--background, linear-gradient(to right bottom, #6139FF, #4255FE));

		&:disabled
		{
			cursor: default;
			$overlay-color: rgba(80, 80, 80, 0.85);
			background:  linear-gradient(to right bottom, $overlay-color, $overlay-color), var(--background, linear-gradient(to right bottom, #6139FF, #4255FE));
			//box-shadow: none;
		}

		// https://stackoverflow.com/questions/11600687/hover-and-active-only-when-not-disabled
		&:hover:enabled, &:hover:after:enabled
		{
			box-shadow: inset 0 -16px 32px rgba(255, 255, 255, 0.05);
		}
	}

	.pseudo-parent
	{
		position: absolute;
		padding: $vertical-padding $horizontal-padding;
		//width: fit-content;
		font-family: Lato;
		font-size: 1em;
		font-weight: bolder;
		color: white;
		vertical-align: middle;
		text-align: center;
		border-radius: inherit;
		box-shadow: inset 0 -16px 16px rgba(0, 0, 0, 0.15);

		background: inherit;
	}

	.glowing:before
	{
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		background: inherit;
		border-radius: inherit;
		transform: scale(0.8) translateY(5px);
		z-index: -2;
		filter: blur(48px);
		opacity: 0.6;
	}

	// to make button with border the same dimensions as without
	.border
	{
		padding: calc($vertical-padding - 2px) calc($horizontal-padding - 2px);
		position: relative;
		margin: 2px	;
	}

	.border:after
	{
		content: '';
		position: absolute;
		top:    calc($border-width * -1);
		bottom: calc($border-width * -1);
		left:   calc($border-width * -1);
		right:  calc($border-width * -1);
		background: inherit;
		filter: brightness(1.1);
		border-radius: inherit;
		z-index: -1;
	}

</style>

<!--	forward click event to parent -->
<button on:click class="button" disabled={disabled}>
	<div class="pseudo-parent" class:glowing={!disabled && glowing} class:border={border}>
		<slot/>
	</div>
</button>