import { error } from '@sveltejs/kit';
import { gameRooms, fetchGameRooms } from '$lib/stores';
import { get } from 'svelte/store';

// @ts-ignore
export async function load({ fetch })
{
	const rooms = await fetchGameRooms(fetch);
	if (!rooms)
		throw error(500, 'Failed to fetch game rooms');

	return {
		rooms: get(gameRooms),
	};
}