<script lang="ts">
	import { onMount } from 'svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	let user = null;
	let error = null;

	console.log("Hello everyone");

	async function loadUser(login: string)
	{
		console.log("loading user", login);
		const res = await fetch(`/api/users/${login}`);

		if (!res.ok)
		{
			error = res.statusText;
			console.log("cannot find user", login);
			return;
		}

		const json = await res.json();
		user = json;
	}

	onMount(() => {
		loadUser(data.login);
	});

	// loadUser(data.login);

</script>

{#if user}
	<h1>{JSON.stringify(user, null, 2)}</h1>
{/if}

{#if error}
	<h1>{error}</h1>
{/if}