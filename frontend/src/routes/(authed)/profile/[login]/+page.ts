import { error } from '@sveltejs/kit';
import { resJson } from '$lib/utils';

async function loadUser(login: string, fetch: any)
{
	const res = await fetch(`/api/users/${login}`);
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
		throw error(404, 'An error occured while fetching user ' + e);
	}
}

// @ts-ignore
export async function load({params, fetch})
{
	return {
		login: params.login,
		user: await loadUser(params.login, fetch),
	}
}