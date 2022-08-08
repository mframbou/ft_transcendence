<script lang="ts">
	export let message = "This is my default value"; // export allows for modification from outside of the component
	export let isBlue = true;
	export let isRed = false;

	// event filters:
	// once: only run once
	// preventDefault: prevent default action
	// self: only fires if the element triggering the event is the target (eg. click only fires if we click the div itself not its child)
</script>

<div>
	<!--	Conditional classes depending on code condition -->
	<!--	If no callback on event, event is forwarded to parent (so need an event handler in parent) -->
	<slot name="title"></slot>
	<button
					on:click|self
					class:red={isRed}
					class:blue={isBlue}
					on:click={() => {
						isBlue = !isBlue;
						isRed = !isRed;
					}}
	>{message}
	</button>
	<slot></slot>
	<!--	slot copies all child content from parent (the paragraph in this case) and put it in the component itself rather than the parent-->
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