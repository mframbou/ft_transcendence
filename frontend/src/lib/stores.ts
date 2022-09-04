import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';

export const user = writable(undefined);
export const otpVerifyAndClear = writable(undefined);

if (browser && get(user) === undefined) // otherwises it runs on the first request (and only first requestm weird)
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