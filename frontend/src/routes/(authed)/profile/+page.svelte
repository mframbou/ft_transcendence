<script lang="ts">
	import { user, fetchUser } from '$lib/stores';


</script>

<div class="profile-wrapper">
	{#if $user}
		<div class="profile">
			<h1>{$user.username}</h1>
			<img src={$user.profilePicture}/>
		</div>
	{:else}
		<div class="loading">Loading...</div>
	{/if}
</div>

<style lang="scss">

	.profile-wrapper
	{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	img
	{
		margin: 20px;
		width: 20em;
		border-radius: 0.2em;
		object-fit: cover; // to make square
		aspect-ratio: 1;
	}

</style>