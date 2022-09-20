import { error } from '@sveltejs/kit';

async function loadUser(login: string, fetch: any)
{
	try
	{
		const res = await fetch(`/api/users/${login}`);

		if (!res.ok)
		{
			throw error(res.status, res.statusText);
		}

		const json = await res.json();
		return json;
	}
	catch(e)
	{
		throw error(404, 'User not found');
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