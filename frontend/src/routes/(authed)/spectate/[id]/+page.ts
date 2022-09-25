import { error } from '@sveltejs/kit';

async function fetchGameRoom(id: string, fetch: any)
{
	try
	{
		const res = await fetch(`/api/game/rooms?id=${encodeURIComponent(id)}`);

		if (!res.ok)
		{
			throw error(res.status, res.statusText);
		}

		const json = await res.json();
		return json;
	}
	catch(e)
	{
		throw error(404, 'An error occured while fetching game room ' + e);
	}
}


// @ts-ignore
export async function load({ params, fetch })
{
	return {
		room: await fetchGameRoom(params.id, fetch),
	};
}