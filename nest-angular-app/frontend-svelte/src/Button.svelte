<script lang="ts">
	export let message = "This is my default value"; // export allows for modification from outside of the component
	export let isBlue = true;
	export let isRed = false;
</script>

<div>
	<!--	Conditional classes depending on code condition -->
	<button
					class:red={isRed}
					class:blue={isBlue}
					on:click={() => {
						isBlue = !isBlue;
						isRed = !isRed;
					}}
	>{message}
	</button>
</div>

<style>

    .red {
        background-color: red;
        color: #ffffff;
    }

    .red:active {
        background-color: red;
    }

    .blue {
        background-color: blue;
        color: white;
    }

    .blue:active {
        background-color: blue;
    }
</style>