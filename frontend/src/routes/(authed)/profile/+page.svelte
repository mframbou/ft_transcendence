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
		gap: 30px;
		padding: 20px 30px;
	}

	.profile-picture
	{
		aspect-ratio: 1;
		border-radius: 20%;
		object-fit: cover;
		height: 90%;
		margin-top: auto;

		cursor: pointer;
	}

	.username
	{
		margin-top: auto; // https://stackoverflow.com/questions/36130760/use-justify-content-flex-end-and-to-have-vertical-scrollbar
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-left: 10px;

		h1
		{
			font-family: NexaBlack;
			font-size: 1.6em;
			color: white;

			cursor: pointer;
		}

		h2
		{
			font-family: Montserrat;
			font-size: 1em;
			font-weight: 400;
			color: #958ebe;
		}
	}

	.buttons
	{
		display: flex;
		flex-direction: row;
		gap: 10px;
	}

	.username-buttons
	{
		display: flex;
		flex-direction: column;
		gap: 20px;
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
	import { user, fetchUser, matchesHistory } from '$lib/stores';
	import { goto } from '$app/navigation';
	import ParticlesBackground from '$lib/ParticlesBackground.svelte';
	import { onMount } from 'svelte';
	import { statusSocket } from '$lib/websocket-stores';

	// fetchUser every second
	onMount(() =>
	{
		$statusSocket.on('userStatusChanged', (data) =>
		{
			console.log('userStatusChanged', data);
			if ($user.login === data.login)
			{
				$user.status = data.status;
			}
		});

		return () =>
		{
			$statusSocket.off('userStatusChanged');
		};
	});


	interface IMatch
	{
		winner: any;
		loser: any;
		winnerScore: number;
		loserScore: number;
		outcome: 'victory' | 'defeat';
	}

	let matchHistory: IMatch[] = [];

	$: if ($matchesHistory)
	{
		matchHistory = $matchesHistory.map((match) =>
		{
			const winner = match.winner;
			const loser = match.loser;
			const winnerScore = match.winnerScore;
			const loserScore = match.loserScore;

			const outcome = ($user.login === winner.login) ? 'victory' : 'defeat';

			const matchResult: IMatch = {
				winner: winner,
				loser: loser,
				winnerScore: winnerScore,
				loserScore: loserScore,
				outcome: outcome,
			};

			return matchResult;

		});
	}

	interface IStat
	{
		name: string;
		value: string | number;
	}

	let stats: IStat[] = [];


	// $:

	$: if($user)
	{
		let winPercentage = Math.round(($user.wins / ($user.wins + $user.losses)) * 100);
		stats = [
			{
				name: 'Wins',
				value: $user.wins,
			},
			{
				name: 'Losses',
				value: $user.losses,
			},
			{
				name: 'Win %',
				value: (isNaN(winPercentage) || !isFinite(winPercentage)) ? 'Ø' : winPercentage,
			},
		];
	}

	async function redirectSettings()
	{
		await goto('/settings');
	}

</script>


<div class="wrapper">

		<div class="content">

			<div class="banner">
				{#if $user}
				<img on:click={redirectSettings} class="profile-picture" src={$user.profilePicture}>

				<div class="username-buttons">
					<div class="username">
						<h1 on:click={redirectSettings}>{$user.username}</h1>
						<h2>@{$user.login}</h2>
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
						{#if matchHistory.length > 0}
							{#each matchHistory as match}
								<div class="match" class:match-victory={match.outcome === 'victory'} class:match-defeat={match.outcome === 'defeat'} class:match-draw={match.outcome === 'draw'}>
									<h1 class="match-name"><strong>{match.winner.username}</strong><span class="user-separator">-</span>{match.loser.username}</h1>
									<span class="match-score"><strong>{match.winnerScore}</strong><span class="score-separator">-</span>{match.loserScore}</span>
								</div>
							{/each}
						{:else}
							<div class="no-match-history">
								<h1>No match history</h1>
							</div>
						{/if}
					</div>
				</section>
<!--				</div>-->
			</div>

		</div>

</div>