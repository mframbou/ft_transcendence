<script lang="ts">
	import ParticlesBackground from "$lib/ParticlesBackground.svelte";
	import Pong from "$lib/Pong.svelte";
	import { friends } from "$lib/stores";
	import Button from "$lib/Button.svelte";
	import { pongSocket, pongSocketConnected } from "$lib/websocket-stores.js";

	let onlineFriends = [];
	let currentMode : 'SINGLEPLAYER' | 'MULTIPLAYER' | 'SPECTATOR' = 'SINGLEPLAYER';
	let matchmaking: boolean = false;

	$: if ($friends)
	{
		onlineFriends = $friends.friends.filter(friend => friend.status === 'OFFLINE');
	}

	function setReady()
	{
		console.log("CLIENT READY");
		$pongSocket.emit('startMatchmaking', '');
		matchmaking = true;

		$pongSocket.once('matchFound', (data) => {
			matchmaking = false;
			console.log("MATCH FOUND, SENDING CONFIRMATION:", data);
			$pongSocket.emit('confirmMatch', '');
		});
	}


</script>

<!--<Navbar></Navbar>-->
<div class="background">
	<ParticlesBackground properties={{minVelocity: 0.15, maxVelocity: 0.25, lineColor: '#958ebe'}}/>
</div>

<div class="content-wrapper">
	<section class="game">
		<Pong bind:currentMode/>
		<Button disabled={currentMode === 'MULTIPLAYER' || !$pongSocketConnected || matchmaking} on:click={setReady}>Start matchmaking</Button>
	</section>

	<section class="invite">
		{#each onlineFriends as friend}
			<div class="friend">
				<img src={friend.profilePicture} alt={friend.username}/>
				<h3>{friend.username}</h3>
				<div class="invite-icon" on:click={() => alert(`Inviting ${friend.username}`)}/>
				<div class="chat-icon" on:click={() => alert(`Chatting with ${friend.username}`)}/>
<!--					<button on:click={() => invite(friend.id)}>Invite</button>-->
			</div>
		{/each}
	</section>
</div>

<style lang="scss">

	.background
	{
		opacity: 0.6;

		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		z-index: -1;
	}

	.content-wrapper
	{
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		gap: 1rem;
		pointer-events: none; // to allow to click background through gap, need to reset it on childs

		section
		{
			padding: 0.5rem;
			width: 100%;
			height: 100%;
			pointer-events: auto;
			background-color: rgba(28, 19, 42, 1);
		}
	}

	.game
	{
		flex: 3 1 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 2rem;
	}

	.invite
	{
		flex: 1 1 0;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		gap: 5px;
		overflow-y: auto;
	}

	.friend
	{
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: left;
		align-items: center;
		padding: 0.75rem;
		border-radius: 0.5rem;
		height: 4.5rem;
		gap: .5rem;

		&:hover
		{
			background-color: rgba(65, 50, 88, 1);
		}

		img
		{
			height: 100%;
			aspect-ratio: 1 / 1;
			object-fit: cover;
			border-radius: 20%;
		}

		.invite-icon
		{
			aspect-ratio: 1 / 1;
			height: 80%;
			background-color: rgba(255, 255, 255, 0.5);
			border-radius: 20%;
			// align icon center
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;

			&:after
			{
				aspect-ratio: 1 / 1;
				height: 70%;
				content: url('/images/plus-solid.svg');
			}
		}

		.chat-icon
		{
			aspect-ratio: 1 / 1;
			height: 80%;
			background-color: rgba(255, 255, 255, 0.5);
			border-radius: 20%;
			// align icon center
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;

			&:after
			{
				aspect-ratio: 1 / 1;
				height: 50%;
				content: url('/images/message-solid.svg');
			}
		}

	}


	@media (max-width: 859px)
	{
		.invite
		{
			display: none;
		}
	}


</style>