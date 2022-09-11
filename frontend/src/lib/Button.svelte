<script lang="ts">
	export let glowing: boolean = true;
	export let border: boolean = true;
</script>

<style lang="scss">

	$border-width: var(--border-width, 2px);

	.button
	{
		position: relative;

		//width: fit-content;
		padding: 15px 20px;
		font-family: Lato;
		font-size: 1em;
		font-weight: bolder;
		color: white;
		vertical-align: middle;
		text-align: center;
		border-radius: 100vw;
		margin: 2px	;
		cursor: pointer;
		z-index: 10;
		transform-style: preserve-3d; // https://stackoverflow.com/a/51432213
		outline: none;
		border: none;
		box-shadow: inset 0 -16px 16px rgba(0, 0, 0, 0.15);

		background: var(--background, linear-gradient(to right bottom, #6139FF, #4255FE));

		&:hover, &:hover:after
		{
			box-shadow: inset 0 -16px 32px rgba(0, 0, 0, 0.2);
		}
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
		transform: scale(0.8) translateY(5px) translateZ(-2px);
		filter: blur(48px);
		opacity: 0.6;
	}

	// to make button with border the same dimensions as without
	.border
	{
		padding: 13px 18px;
		position: relative;
		bottom: calc($border-width);
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
		transform: translateZ(-1px);
	}

</style>

<!--	forward click event to parent -->
<button on:click class="button" class:glowing={glowing} class:border={border}>
	<slot/>
</button>