import { error } from '@sveltejs/kit';
import { resJson } from '$lib/utils';

async function fetchGameRoom(id: string, fetch: any)
{

	const res = await fetch(`/api/game/rooms?id=${encodeURIComponent(id)}`);

	if (!res.ok)
	{
		const json = await resJson(res);

		let message = res.statusText;
		if (json)
			message = json.message;

		throw error(res.status, message);
	}

	try
	{
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