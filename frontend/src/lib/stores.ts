import { get, writable } from 'svelte/store';
import { browser } from '$app/env';

export const user = writable(undefined);
export const otpVerifyAndClear = writable(undefined);

if (get(user) === undefined)
{
	console.log("User is undefined, fetching it");
	fetchUser();
}

export async function fetchUser()
{
	if (browser) // Otherwise server will try to call /api/users/me while not on proxy
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
}