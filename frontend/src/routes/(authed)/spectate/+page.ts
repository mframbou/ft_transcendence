import { error } from '@sveltejs/kit';

async function fetchGameRooms(fetch: any)
{
	try
	{
		const res = await fetch(`/api/game/rooms`);

		if (!res.ok)
		{
			throw error(res.status, res.statusText);
		}

		const json = await res.json();
		return json;
	}
	catch(e)
	{
		throw error(404, 'An error occured while fetching game rooms ' + e);
	}
}


// @ts-ignore
export async function load({ fetch })
{
	return {
		rooms: await fetchGameRooms(fetch),
	};
}