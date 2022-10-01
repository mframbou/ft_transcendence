import { error, redirect } from '@sveltejs/kit';
import { resJson } from '$lib/utils';
import { user, fetchUser } from '../../../../lib/stores';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

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
	const login = params.login;

	if (!get(user))
		await fetchUser(fetch);

	// @ts-ignore
	if (get(user).login === login && browser)
		document.location.replace('/profile'); // to avoid adding to history

	return {
		login: login,
		user: await loadUser(params.login, fetch),
	}
}