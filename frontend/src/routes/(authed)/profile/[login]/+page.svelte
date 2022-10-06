<style lang="scss">
	.wrapper
	{
		height: 100%;
		width: 100%;
		background-color: #0C0813;
		overflow: auto;
	}

	.banner
	{
		$dim-color: rgba(0, 0, 0, 0.1);
		position: relative;
		width: 100%;
		flex: 1 1 0;
		background :linear-gradient($dim-color, $dim-color), url("/images/default-banner.png");

		background-size: cover;
		background-position: center;
		overflow: auto;

		display: flex;
		justify-items: start;
		// https://stackoverflow.com/questions/36130760/use-justify-content-flex-end-and-to-have-vertical-scrollbar
		//align-items: flex-end;
		gap: 30px;
		padding: 20px 30px;
	}

	.profile-picture
	{
		aspect-ratio: 1;
		border-radius: 20%;
		object-fit: cover;
		height: 90%;
	}

	.username
	{
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-left: 10px;

		h1
		{
			font-family: NexaBlack;
			font-size: 1.6em;
			color: white;
		}

		h2
		{
			font-family: Montserrat;
			font-size: 1em;
			font-weight: 400;
			color: #958ebe;
		}

		.user-status
		{
			text-transform: lowercase;

			&:first-line
			{
				text-transform: capitalize;
			}
		}
	}

	.buttons
	{
		display: flex;
		flex-direction: row;
		gap: 10px;
	}

	// https://stackoverflow.com/questions/36130760/use-justify-content-flex-end-and-to-have-vertical-scrollbar
	.username-buttons
	{
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		margin-top: auto;
	}

	.banner-button
	{
		display: inline-block;
		width: 12em;
		font-family: Montserrat;
		font-weight: 500;
		font-size: .9em;
	}

	$section-bg-color: rgba(28, 19, 42, 0.9);

	.user-section
	{
		backdrop-filter: blur(5px);

		max-width: 1920px;
		//min-height: 12em;
		//overflow: hidden;
		margin: 20px;
		padding: 15px;
		gap: 20px;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		background-color: $section-bg-color;
		border-radius: 10px;

		.user-section-title
		{
			font-family: Montserrat;
			font-weight: 800;
			font-size: 2em;

			color: white;
			width: 100%;
			border-bottom: 1px solid #565060;
			padding-bottom: 10px;
		}


		.stats-wrapper
		{
			width: 100%;

			//display: flex;
			//flex-direction: row;
			//justify-content: flex-start;
			//align-items: center;

			// Copypasta https://battlefieldtracker.com/bfv/profile/origin/Zekoyuu/overview
			// because flexbox make wrapped item fill the space
			display: grid;
			grip-gap: .75em;
			grid-template-columns: repeat(auto-fit, minmax(9rem,1fr));


			gap: 15px;

			.stat
			{
				padding: 10px;
				transition: background-color .2s;
				border-radius: 10px;

				&:hover
				{
					background-color: desaturate(lighten($section-bg-color, 15%), 10%);
				}
			}

			.stat-name
			{
				color: #958ebe;
				font-family: Montserrat;
				font-weight: 700;
				font-size: 1.2em;
			}

			.stat-value
			{
				color: white;
				font-family: NexaBlack;
				font-size: 1.5em;
			}
		}
	}

	.content
	{
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}

	.profile-content
	{
		position: relative;
		flex: 4 1 0;
		transform-style: preserve-3d;

		display: flex;
		flex-direction: column;
		overflow: auto;
	}

	.background
	{
		opacity: 0.6;

		z-index: -1;
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
	}

	.match-history-wrapper
	{
		display: flex;
		flex-direction: column;
		gap: 20px;
		width: 100%;
		overflow: auto;

		.match
		{
			padding: 10px;
			transition: background-color .2s;
			border-radius: 10px;
			width: 100%;

			display: flex;
			flex-direction: row;
			gap: 10px;
			align-items: baseline;
			justify-content: flex-start;

			&:hover
			{
				background-color: desaturate(lighten($section-bg-color, 15%), 10%);
			}
		}

		.match-name
		{
			font-family: Montserrat;
			font-weight: 500;
			font-size: 1.2em;
			color: white;

			strong
			{
				font-weight: 700;
			}
		}

		.match-score
		{
			font-family: Montserrat;
			font-weight: 500;
			font-size: 1.2em;
			color: white;

			strong
			{
				font-weight: 700;
			}
		}

		.user-separator, .score-separator
		{
			font-family: Montserrat;
			color: white;
			padding: 0 5px;
		}

		.match-victory
		{
			//background-color: desaturate(lighten($section-bg-color, 15%), 10%);
		}

		.match-defeat
		{
			//background-color: desaturate(lighten($section-bg-color, 10%), 10%);
		}

		.match-draw
		{
			//background-color: desaturate($section-bg-color, 10%);
		}

		.no-match-history
		{
			font-family: Montserrat;
			font-weight: 500;
			font-size: 1.2em;
			color: white;
			text-align: center;
		}


	}

	// Since it should scroll behavior is a bit different from normal user-section
	.match-history-section
	{
		overflow: hidden;
		min-height: 10em;
	}

</style>

<script lang="ts">
	import { user, friends, fetchFriends, fetchGameRooms, gameRooms, blockedUsers, fetchBlockedUsers } from '$lib/stores';
	import { goto } from '$app/navigation';
	import Button from '$lib/Button.svelte';
	import ParticlesBackground from '$lib/ParticlesBackground.svelte';
	import { onMount } from 'svelte';
	import { statusSocket } from '$lib/websocket-stores';

	export let data;
	let targetUser = data.user;
	let error = null;
	let friendLoading: boolean = false;
	let isUserBlocked: boolean = false;

	interface IStat
	{
		name: string;
		value: string | number;
	}

	$: if ($blockedUsers)
	{
		isUserBlocked = $blockedUsers.some((blockedUser) => blockedUser.login === targetUser.login);
	}

	let stats: IStat[] = [];

	let matchHistory: any[] = [];

	$: if(targetUser)
	{
		let winPercentage = Math.round((targetUser.wins / (targetUser.wins + targetUser.losses)) * 100);
		stats = [
			{
				name: 'Wins',
				value: targetUser.wins,
			},
			{
				name: 'Losses',
				value: targetUser.losses,
			},
			{
				name: 'Win %',
				value: (isNaN(winPercentage) || !isFinite(winPercentage)) ? 'Ø' : winPercentage,
			},
		];
	}

	onMount(() =>
	{
		$statusSocket.on('userStatusChanged', (data) =>
		{
			console.log('userStatusChanged', data);
			if (targetUser && targetUser.login === data.login)
			{
				targetUser.status = data.status;
			}
		});

		return () =>
		{
			$statusSocket.off('userStatusChanged');
		};
	});

	async function addFriend()
	{
		friendLoading = true;

		const res = await fetch('/api/friends/add', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				login: targetUser.login,
			}),
		});

		await fetchFriends();
		friendLoading = false;
	}

	async function removeFriend()
	{
		friendLoading = true;

		const res = await fetch('/api/friends/remove', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				login: targetUser.login,
			}),
		});

		if (!res.ok)
		{
			alert('An error occured while reemoving friend: ' + await res.text());
			return;
		}

		await fetchFriends();
		friendLoading = false;
	}

	async function getUserMatchLink()
	{
		await fetchGameRooms();
		if ($gameRooms)
		{
			const room = $gameRooms.find(room => room.player1.login === targetUser.login || room.player2.login === targetUser.login);
			if (room)
			{
				await goto('/game/' + room.id);
			}
		}
	}

	let moreMenuShown: boolean = false;
	let blockingUser: boolean = false;

	async function handleBlockButtonClick()
	{
		blockingUser = true;

		if ($blockedUsers && $blockedUsers.some(user => user.login === targetUser.login))
		{
			await fetch('/api/blacklist/unblock', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					login: targetUser.login,
				}),
			});
		}
		else
		{
			await fetch('/api/blacklist/block', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					login: targetUser.login,
				}),
			});
			console.log('blocked');
			await fetchFriends(); // to remove friend if user was friend or pending
		}

		await fetchBlockedUsers();
		blockingUser = false;
	}

</script>


<div class="wrapper">

	<div class="content">

		<div class="banner">
			{#if targetUser}
				<img class="profile-picture" src={targetUser.profilePicture}>

				<div class="username-buttons">
					<div class="username">
						<h1>{targetUser.username}</h1>
						<h2>@{targetUser.login}</h2>
						<h2 class="user-status">{targetUser.status} {#if targetUser.status === 'IN_GAME'}<a class="spectate-user" href={getUserMatchLink}>Spectate</a>{/if}</h2>
					</div>

					<div class="buttons">

						{#if $friends}
							{#if $friends.friends.some(friend => friend.login === targetUser.login) === false}
								<!-- Not friend -->
								{#if $friends.pendingSent.some(friend => friend.login === targetUser.login)}
									<Button disabled={friendLoading} on:click={removeFriend}>
										<span class="banner-button">Cancel friend request</span>
									</Button>
								{:else}
									<Button disabled={friendLoading || isUserBlocked} on:click={addFriend}>
										{#if $friends?.pendingReceived.some(friend => friend.login === targetUser.login)}
											<span class="banner-button">Accept friend request</span>
										{:else}
											<span class="banner-button">Add friend</span>
										{/if}
									</Button>
								{/if}

							{:else}
								<!-- Friend -->
								<Button disabled={friendLoading} on:click={removeFriend}>
									<span class="banner-button">Remove friend</span>
								</Button>

								<Button border={false} --background="linear-gradient(to right bottom, rgba(255, 255, 255, .25), rgba(255, 255, 255, .20))" on:click={() => alert('message')}>
									<span class="banner-button">Message</span>
								</Button>

							{/if}

							<div class="more-button" on:mouseleave={() => moreMenuShown = false}>
								<Button border={false}
												disabled={moreMenuShown && blockingUser}
												--background={moreMenuShown ? 'linear-gradient(to right bottom, rgb(230 39 39), rgb(214 35 35))' : 'linear-gradient(to right bottom, rgba(255, 255, 255, .25), rgba(255, 255, 255, .20))'}
												on:click={async () => moreMenuShown ? await handleBlockButtonClick() : moreMenuShown = true}>
									{#if moreMenuShown}
										<div class="more-menu">
											{#if $blockedUsers && $blockedUsers.some(user => user.login === targetUser.login) === false}
												Block
											{:else}
												Unblock
											{/if}
										</div>
									{:else}
										<span>...</span>
									{/if}
								</Button>
							</div>
						{/if}
					</div>

				</div>
			{/if}
		</div>

		<div class="profile-content">
			<div class="background">
				<ParticlesBackground properties={{minVelocity: 0.35, maxVelocity: 0.5, lineColor: '#958ebe'}}/>
			</div>

			<section class="user-section">
				<h1 class="user-section-title">Stats</h1>
				<div class="stats-wrapper">
					{#each stats as stat}
						<div class="stat">
							<h1 class="stat-name">{stat.name}</h1>
							<span class="stat-value">{stat.value}</span>
						</div>
					{/each}
				</div>
			</section>

			<section class="user-section match-history-section">
				<h1 class="user-section-title">Match history</h1>
				<div class="match-history-wrapper">
					{#if matchHistory.length === 0}
						<div class="no-match-history">
							<h1>No match history</h1>
						</div>
					{:else}
						{#each matchHistory as match}
							<div class="match" class:match-victory={match.outcome === 'victory'} class:match-defeat={match.outcome === 'defeat'} class:match-draw={match.outcome === 'draw'}>
								<h1 class="match-name"><strong>{targetUser.username}</strong><span class="user-separator">-</span>{match.oponnent}</h1>
								<span class="match-score"><strong>{match.score.you}</strong><span class="score-separator">-</span>{match.score.opponent}</span>
							</div>
						{/each}
					{/if}
				</div>
			</section>
			<!--				</div>-->
		</div>

	</div>

</div>