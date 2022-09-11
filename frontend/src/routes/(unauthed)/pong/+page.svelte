<style lang="scss">
	.wrapper
	{
		height: 100vh;
		width: 100vw;
		background-color: #0C0813;
		overflow: hidden;
	}

	.content
	{
		margin-top: 85px;
	}


	.banner
	{
		$dim-color: rgba(0, 0, 0, 0.1);
		position: relative;
		width: 100%;
		height: 20em;
		background :linear-gradient($dim-color, $dim-color), url("/images/default-banner.png");

		background-size: cover;
		background-position: center;

		display: flex;
		justify-items: start;
		align-items: flex-end;
		gap: 30px;
		padding: 20px 30px;
	}

	.profile-picture
	{
		aspect-ratio: 1;
		border-radius: 20%;
		object-fit: cover;
		height: 80%;
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

	.stats
	{
		$bg-color: #1c132a;

		max-width: 1920px;

		.stats-title
		{
			font-family: Montserrat;
			font-weight: 800;
			font-size: 2em;

			color: white;
			width: 100%;
			border-bottom: 1px solid #6d647a;
			padding-bottom: 10px;
		}

		margin: 20px;
		padding: 15px;
		gap: 20px;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		background-color: $bg-color;
		border-radius: 10px;

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
				//flex-grow: 1;
				background-color: $bg-color;
				transition: background-color .2s;
				border-radius: 10px;

				&:hover
				{
					background-color: desaturate(lighten($bg-color, 15%), 10%);
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

</style>

<script lang="ts">

	import Pong from '$lib/Pong.svelte';
	import Button from '$lib/Button.svelte';
	import NavbarV2 from '$lib/NavbarV2.svelte';

	interface IStat
	{
		name: string;
		value: string | number;
	}

	let stats: IStat[] = [
		{
			name: 'Wins',
			value: 152,
		},
		{
			name: 'Losses',
			value: 108,
		},
		{
			name: 'Win %',
			value: '71.05',
		},
	];

</script>

<NavbarV2/>
<div class="wrapper">
	<div class="content">

		<div class="banner">
			<img class="profile-picture" src="https://cdn.intra.42.fr/users/dsamain.jpg">

			<div class="username-buttons">
				<div class="username">
					<h1>BelloPepito</h1>
					<h2>@dsamain</h2>
				</div>

				<div class="buttons">
					<Button on:click={() => alert('test')}>
						<span class="banner-button">Add friend</span>
					</Button>

					<Button border={false} --background="linear-gradient(to right bottom, rgba(255, 255, 255, .25), rgba(255, 255, 255, .20))" on:click={() => alert('test')}>
						<span class="banner-button">Message</span>
					</Button>

					<Button border={false} --background="linear-gradient(to right bottom, rgba(255, 255, 255, .25), rgba(255, 255, 255, .20))" on:click={() => alert('test')}>
						<span>...</span>
					</Button>
				</div>
			</div>
		</div>

		<div class="stats">
			<h1 class="stats-title">Stats</h1>
			<div class="stats-wrapper">
				{#each stats as stat}
					<div class="stat">
						<h1 class="stat-name">{stat.name}</h1>
						<span class="stat-value">{stat.value}</span>
					</div>
				{/each}
			</div>

		</div>

	</div>
</div>

<!--<Pong/>-->