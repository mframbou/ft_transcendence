<script lang="ts">
	import ParticlesBackground from "$lib/ParticlesBackground.svelte";
	import Pong from "$lib/Pong.svelte";
	import { fetchUser, friends, user, addNotification } from '$lib/stores';
	import Button from "$lib/Button.svelte";
	import {
		pongSocket,
		pongSocketConnected, statusSocket
	} from '$lib/websocket-stores.js';
	import { resJson } from '../../../lib/utils';
	import { error } from '@sveltejs/kit';
	import { slide, fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	let onlineFriends = [];
	let currentMode : 'SINGLEPLAYER' | 'MULTIPLAYER' | 'SPECTATOR' = 'SINGLEPLAYER';
	let matchmaking: boolean = false;
	let matchmakingTime: number = 0;
	let matchmakingTimeInterval: number = null;
	let opponentPlayer = null;

	export let data;

	function secondsToMinutesSeconds(seconds: number) {
		const minutes = Math.floor(seconds / 60);
		const secondsLeft = seconds % 60;
		return `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
	}

	$: if(matchmaking && matchmakingTimeInterval === null) // otherwise it runs every second idk why it reruns since matchmaing does not change, probably because matchmakingTime does
	{
		matchmakingTimeInterval = window.setInterval(() => {
			matchmakingTime++;
		}, 1000);
	}

	else if (!matchmaking && matchmakingTimeInterval !== null)
	{
		window.clearInterval(matchmakingTimeInterval);
		matchmakingTimeInterval = null;
		matchmakingTime = 0;
	}

	$: if($friends)
	{
		onlineFriends = $friends.friends.filter(friend => friend.status === 'ONLINE');
	}

	function listenForMatch()
	{
		$pongSocket.once('matchFound', async (data) => {
			console.log('matchfound');
			matchmaking = false;
			console.log("MATCH FOUND, SENDING CONFIRMATION:", data);

			if (!$user)
				await fetchUser();

			const opponent = (data.player1.login === $user.login) ? data.player2 : data.player1; // still works when playing against yourself

			opponentPlayer = $user;
			if (opponent.login !== $user.login)
			{
				const res = await fetch(`/api/users/${opponent.login}`);
				if (!res.ok)
				{
					const json = await resJson(res);

					let message = res.statusText;
					if (json)
						message = json.message;

					throw error(res.status, message);
				}

				try
				{
					opponentPlayer = await res.json();
				}
				catch(e)
				{
					throw error(404, 'An error occured while fetching opponent user ' + e);
				}
			}
			console.log('confirming match');
			$pongSocket.emit('confirmMatch', '');
		});
	}

	function setReady()
	{
		console.log("CLIENT READY");
		$pongSocket.emit('startMatchmaking', '');
		matchmaking = true;

		listenForMatch();
	}

	function handleGameFinished(event)
	{
		const myScore = event.detail.player1Score;
		const opponentScore = event.detail.player2Score;

		// alert(`Game finished! Your score: ${myScore}, opponent score: ${opponentScore}`);
		opponentPlayer = null;
	}

	let pongWidth: number;
	let playerInfosDiv: HTMLDivElement;

	$: if (playerInfosDiv)
	{
		playerInfosDiv.style.width = `${pongWidth}px`;
	}


	let pongBallAspect: 'square' | 'circle' = 'square';
	let pongKeepAspectRatio: boolean = true;

	function handleWindowResize()
	{
		const mobileModeQuery = window.matchMedia('(min-width: 860px)');

		if (mobileModeQuery.matches)
		{
			pongBallAspect = 'circle';
			pongKeepAspectRatio = true;
		}
		else
		{
			pongBallAspect = 'square';
			pongKeepAspectRatio = false;
		}
	}

	function acceptDuelInvitation(data: any)
	{
		console.log('accepted duel invitation from', data.senderLogin, data.senderId);
		listenForMatch();
		$pongSocket.emit('acceptDuel', {senderId: data.senderId});
	}

	onMount(() => {
		//
		// if (data.duelId)
		// 	startDuel(data.duelId);

		$statusSocket.on('userStatusChanged', (data) =>
		{
			console.log('user status changed', data);
			if ($friends && $friends.friends)
			{
				console.log('friends', $friends.friends);
				for (let friend of $friends.friends)
				{
					if (friend.login === data.login)
					{
						console.log('friend user status changed', data);
						friend.status = data.status;
						onlineFriends = $friends.friends.filter(friend => friend.status === 'ONLINE');
						break;
					}
				}
			}
		});

		$pongSocket.on('duelInvitation', (data) => {
			console.log('duel invitation');
			const acceptButton = { text: 'Accept', action: () => acceptDuelInvitation(data) };
			const declineButton = { text: 'Decline', action: () => {} };
			addNotification({content: `You have been invited to a duel by ${data.senderLogin}!`}, [acceptButton, declineButton]);
		});

		handleWindowResize();
	})

	function startDuel(login: string)
	{
		if ($pongSocketConnected)
		{
			listenForMatch();
			$pongSocket.emit('startDuel', {login: login});
		}
	}

</script>

<svelte:window on:resize={handleWindowResize}/>

<!--<Navbar></Navbar>-->
<div class="background">
	<ParticlesBackground properties={{minVelocity: 0.15, maxVelocity: 0.25, lineColor: '#958ebe'}}/>
</div>

<div class="content-wrapper">
	<section class="game">
		<div class="player-infos" bind:this={playerInfosDiv}>
			{#if opponentPlayer}
				<a class="match-user" href={'/profile'} in:slide>
					<img src={$user.profilePicture} alt="avatar"/>
					<span class="username">
						{$user.username}
					</span>
				</a>
				<span in:fade>Multiplayer</span>
				<a class="match-user" href = {opponentPlayer.login === $user.login ? '/profile' : `/profile/${opponentPlayer.login}`} in:slide>
					<span class="username">
						{opponentPlayer.username}
					</span>
					<img src={opponentPlayer.profilePicture} alt="avatar"/>
				</a>
			{:else}
				<span in:fade>Singleplayer</span>
			{/if}
		</div>
		<Pong ballAspect={pongBallAspect} preserveRatio={pongKeepAspectRatio} bind:width={pongWidth} bind:currentMode on:game-end={handleGameFinished}/>

		<div class="matchmaking-button">
			<Button disabled={currentMode === 'MULTIPLAYER' || !$pongSocketConnected || matchmaking} on:click={setReady}>
				{#if matchmaking}
					Matchmaking ({secondsToMinutesSeconds(matchmakingTime)})
				{:else}
					Start matchmaking
				{/if}
			</Button>
		</div>
	</section>


	<section class="invite">
		{#each onlineFriends as friend}
			<div class="friend">
				<img src={friend.profilePicture} alt={friend.username}/>
				<h3 class="friend-username">{friend.username}</h3>
				<div style="margin-left:auto" class="invite-icon icon" on:click={() => startDuel(friend.login)}/>
				<div class="chat-icon icon" on:click={() => alert(`Chatting with ${friend.username}`)}/>
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
		overflow: hidden; // to allow shrinking on resize
		flex: 3 1 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		.player-infos
		{
			//width: 100%; // keep it auto so it's the same width as pong
			display: flex;
			background-color: rgb(44, 36, 56);
			//border-bottom: 2px solid rgb(35, 24, 52);
			// spread items (first one being on the far left and last one being on the far right)
			justify-content: space-between;
			align-items: center;
			height: clamp(2.5rem, 7%, 7rem);

			border-radius: 0.5rem 0.5rem 0 0;
			overflow: hidden;

			// https://stackoverflow.com/questions/57859754/flexbox-space-between-but-center-if-one-element
			// to center if only one child
			*
			{
				&:only-child
				{
					margin: 0 auto;
				}
			}

			.match-user
			{
				display: flex;
				align-items: center;
				gap: 0.5rem;
				height: 100%;
				padding: 0.8rem;

				// remove a style
				text-decoration: none;

				img
				{
					height: 100%;
					aspect-ratio: 1 / 1;
					object-fit: cover;
					border-radius: 20%;
				}

				border-radius: inherit;
				transition: background-color 0.2s ease-in-out;

				&:hover
				{
					background-color: rgba(149, 142, 190, 0.2);
				}
			}
		}

		.matchmaking-button
		{
			margin-top: 1.5rem;
		}
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

		.icon
		{
			transition: background-color .2s ease-in-out;

			&:hover
			{
				background-color: #4255FE;
			}

			&:active
			{
				background-color: #2E3B9E;
			}
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
				content: url("/images/plus-solid.svg");
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
				content: url("/images/message-solid.svg");
			}
		}

		.friend-username
		{
			overflow: hidden;
			text-overflow: ellipsis;
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