import { error } from '@sveltejs/kit';

async function loadUser(login: string)
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

export async function load({params})
{
	return {
		login: params.login,
		user: await loadUser(params.login),
	}
}