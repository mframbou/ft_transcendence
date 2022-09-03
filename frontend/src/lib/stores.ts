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
			{
				user.set(await res.json());
				return;
			}

			console.log("User fetch failed: ", res.status);

			if (res.status === 404)
			{
				// 404 = user not found, probably removed from DB (or DB reset), so delete coookie by logging out
				await fetch('/api/auth/logout');
			}
		}
		catch (e)
		{
			console.log("Encountered error while fetching user: ", e);
		}
	}
}