<script lang="ts">

	import { onDestroy, onMount } from 'svelte';
	import ParticlesBackground from '$lib/ParticlesBackground.svelte';
	import { statusSocket } from '$lib/websocket-stores';
	import { friends, users, user, blockedUsers, fetchFriends } from '$lib/stores';

	let availableUsers = [];


	$: if ($users)
	{
		availableUsers = $users.filter((usr) => {

			if ($user && $user.login === usr.login)
				return false;

			if ($friends)
			{
				if ($friends.friends.find((f) => f.login === usr.login) !== undefined)
					return false;
				if ($friends.pendingSent.find((f) => f.login === usr.login) !== undefined)
					return false;
				if ($friends.pendingReceived.find((f) => f.login === usr.login) !== undefined)
					return false;
			}

			if ($blockedUsers && $blockedUsers.find((b) => b.login === usr.login) !== undefined)
				return false;

			return true;
		});
	}

	onMount(() => {

		fetchFriends();

		$statusSocket.on('userStatusChanged', (data) =>
		{
			console.log('user status changed', data);
			if ($friends && $friends.friends)
			{
				for (let friend of $friends.friends)
				{
					if (friend.login === data.login)
					{
						console.log('friend user status changed', data);
						friend.status = data.status;
						break;
					}
				}
			}
		});
	});

	onDestroy(() => {
		$statusSocket.off('userStatusChanged');
	});

</script>

<style lang="scss">

	section
	{
		$section-bg-color: rgba(28, 19, 42, 0.9);

		backdrop-filter: blur(5px);
		max-width: 1920px;
		min-height: 9em;
		max-height: fit-content;
		margin: 20px;
		padding: 15px;
		gap: 20px;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		background-color: $section-bg-color;
		border-radius: 10px;

		// it seems that backdrop filter moves section to the foreground
		backdrop-filter: blur(5px);

		h1
		{
			font-family: Montserrat;
			font-weight: 800;
			font-size: 2rem;
			color: white;
			width: 100%;
			border-bottom: 1px solid #565060;
			padding-bottom: 10px;
		}

		.friends-list-wrapper
		{
			display: flex;
			flex-direction: column;
			gap: 20px;
			width: 100%;
			overflow: auto;

			.friend
			{
				// remove link style
				text-decoration: none;
				color: inherit;

				padding: 10px;
				transition: background-color .2s;
				border-radius: 10px;
				width: 100%;

				display: flex;
				flex-direction: row;
				gap: 15px;
				justify-content: flex-start;

				&:hover
				{
					background-color: desaturate(lighten($section-bg-color, 15%), 10%);
				}

				.friend-infos
				{
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: flex-start;
				}

				.friend-username
				{
					font-family: Montserrat;
					font-weight: 600;
					font-size: 1.2rem;
				}

				// To make status from ONLINE to Online (capitalize only changes first letter)
				.friend-status
				{
					text-transform: lowercase;
					color: #958ebe;

					&::first-line
					{
						text-transform: capitalize;
					}
				}

				.friend-profile-picture
				{
					height: 50px;
					aspect-ratio: 1/1;
					object-fit: cover;
					border-radius: 20%;
					background-color: #958ebe;
				}
			}
		}
	}

	.wrapper
	{
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		pointer-events: none;

		section
		{
			pointer-events: auto;
		}
	}

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


</style>

<div class="background">
	<ParticlesBackground properties={{minVelocity: 0.35, maxVelocity: 0.5, lineColor: '#958ebe'}}/>
</div>

<div class="wrapper">

	<section class="friends-list">
		<h1>Friends</h1>
		<div class="friends-list-wrapper">
			{#if $friends && $friends.friends.length > 0}
				{#each $friends.friends as friend}
					<a class="friend" href={`/profile/${friend.login}`}>
						<img class="friend-profile-picture" src={friend.profilePicture} alt="profile-picture"/>
						<div class="friend-infos">
							<span class="friend-username">{friend.username}</span>
							<span class="friend-status">{friend.status}</span>
						</div>
					</a>
				{/each}
			{:else}
				<div class="no-friends">
					<h2>You have no friends yet.</h2>
				</div>
			{/if}
		</div>
	</section>

	<section class="pending-friends-received">
		<h1>Pending friend requests received</h1>
		<div class="friends-list-wrapper">
			{#if $friends && $friends.pendingReceived.length > 0}
				{#each $friends.pendingReceived as friend}
					<a class="friend" href={`/profile/${friend.login}`}>
						<img class="friend-profile-picture" src={friend.profilePicture} alt="profile-picture"/>
						<div class="friend-infos">
							<span class="friend-username">{friend.username}</span>
							<span class="friend-status">{friend.status}</span>
						</div>
					</a>
				{/each}
			{:else}
				<div class="no-friends">
					<h2>You have no pending friend requests received.</h2>
				</div>
			{/if}
		</div>
	</section>

	<section class="pending-friends-sent">
		<h1>Pending friend requests sent</h1>
		<div class="friends-list-wrapper">
			{#if $friends && $friends.pendingSent.length > 0}
				{#each $friends.pendingSent as friend}
					<a class="friend" href={`/profile/${friend.login}`}>
						<img class="friend-profile-picture" src={friend.profilePicture} alt="profile-picture"/>
						<div class="friend-infos">
							<span class="friend-username">{friend.username}</span>
							<span class="friend-status">{friend.status}</span>
						</div>
					</a>
				{/each}
			{:else}
				<div class="no-friends">
					<h2>You have no pending friend requests sent.</h2>
				</div>
			{/if}
		</div>
	</section>

	<section class="find-new-frineds">
		<h1>Find new friends</h1>
		<div class="friends-list-wrapper">
			{#if availableUsers.length > 0}
				{#each availableUsers as potentialFriend}
					<a class="friend" href={`/profile/${potentialFriend.login}`}>
						<img class="friend-profile-picture" src={potentialFriend.profilePicture} alt="profile-picture"/>
						<div class="friend-infos">
							<span class="friend-username">{potentialFriend.username}</span>
							<span class="friend-status">{potentialFriend.status}</span>
						</div>
					</a>
				{/each}
			{:else}
				<div class="no-friends">
					<h2>There are no users you can add as friend.</h2>
				</div>
			{/if}
		</div>
	</section>

</div>

