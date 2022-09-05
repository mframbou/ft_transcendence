<script lang="ts">
	import { user } from '$lib/stores';

	function showProfilePictureModal(e)
	{

	}

</script>

<div class="profile-wrapper">
	{#if $user}
		<div class="profile">
			<h1>{$user.username}</h1>
			<div class="profile-picture-wrapper">
				<img class="profile-picture" on:click={showProfilePictureModal} src={$user.profilePicture}/>
			</div>
		</div>
	{:else}
		<div class="loading">Loading...</div>
	{/if}
</div>

<style lang="scss">

	.profile-picture-wrapper
	{
		cursor: pointer;
		position: relative;
		width: 20em;
		height: 20em;


		&:hover:after
		{
			position: absolute;
			bottom: 0;
			left: 0;
			content: 'Upload a new profile picture';
			color: white;
			width: 100%;
			text-align: center;
			background-color: rgba(0,0,0,0.5);
			padding: 10px 0;
		}

		img
		{
			width: 100%;
			border-radius: 4px;
			object-fit: cover; // to make square
			aspect-ratio: 1;
		}
	}

	.profile-wrapper
	{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}


</style>