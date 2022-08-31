import { get, writable } from 'svelte/store';

export const user = writable(undefined);

if (get(user) === undefined)
{
	console.log("User is undefined, fetching it");
	fetchUser();
}
export async function fetchUser()
{
	try
	{
		const res = await fetch('/api/users/me');
		if (res.ok)
			user.set(await res.json());
		else
			console.log("User fetch failed: ", res.status);
	}
	catch (e)
	{
		console.log("Encountered error while fetching user: ", e);
	}
}