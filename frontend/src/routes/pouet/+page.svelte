<script lang="ts">
	import { io } from '$lib/socket-io';
	import { getUser } from '$lib/stores';
	import { browser } from '$app/env';

	function sendMessage() {
		io.emit('message', "Test test");
		console.log("Send msg");
	}

	const { hostname } = browser ? window.location : 'localhost';
	const [user, loading, error, get] = getUser(hostname);

	function getUserPfp(user) {
		return user.profilePicture;
	}

</script>

<button on:click={sendMessage}>Send message</button>
<!-- $ before store variable causes it to be reactive -->
{#if $loading}
	<div>Loading...</div>
{:else if $error}
	<div>Error: {$error}</div>
{:else}
	<img src={getUserPfp($user)}/>
{/if}

<style lang="scss">
	button{
		width: 200px;
		height: 50px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>