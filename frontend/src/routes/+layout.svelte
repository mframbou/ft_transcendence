<script lang-="ts">
    import '$lib/assets/global.scss';
    import Navbar from '$lib/Navbar.svelte';

    import { page } from "$app/stores";

</script>

<!--
	We cannot yet do +error@nolayout in svelte so in the meantime put both in +layout
	https://github.com/sveltejs/kit/issues/4582
-->
{#if $page.error}
	<div class="error-wrapper">
		<slot/>
	</div>


{:else}
	<div class="wrapper">
		<Navbar/>
		<slot/>
	</div>
{/if}


<style lang="scss">

	.wrapper
	{
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
	}

</style>
