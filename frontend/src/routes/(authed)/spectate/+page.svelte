<script lang="ts">
	export let data;

	const gameRooms = data.rooms;

</script>

{#if gameRooms.length > 0}
	{#each gameRooms as room}
		<div class="room">
			<a class="room-name" href={`/spectate/${room.id}`}>
				<span class="player-1">{room.player1.login}</span>
				<span class="versus">VS</span>
				<span class="player-2">{room.player2.login}</span>
			</a>
		</div>
	{/each}
{:else}
	<span class="no-rooms">No rooms available</span>
{/if}