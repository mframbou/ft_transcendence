import { get, readable, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export const user = writable(undefined);
export const friends = writable(undefined);
export const otpVerifyAndClear = writable(undefined);

if (browser && get(user) === undefined)
{
	fetchUserJson().then(json =>
	{
		if (json)
			user.set(json);
	});
}

if (browser && get(friends) === undefined)
{
	fetchFriendsJson().then(json =>
	{
		if (json)
			friends.set(json);
	});
}

export const chatRooms: any = writable([]);

async function fetchUserJson()
{
	try
	{
		const res = await fetch('/api/users/me');
		if (res.ok)
		{
			const json = await res.json();
			return json;
		}

		console.log("User fetch failed: ", res.status);

		if (res.status === 404)
		{
			// 404 = user not found, probably removed from DB (or DB reset), so delete coookie by logging out
			// await fetch('/api/auth/logout');
			await goto('/api/auth/logout');
		}
	}
	catch (e)
	{
		console.log("Encountered error while fetching user: ", e);
	}
	return null;
}

export async function fetchUser(): Promise<boolean>
{
	const json = await fetchUserJson();
	if (json)
	{
		user.set(json);
		return true;
	}
	return false;
}

async function fetchFriendsJson()
{
	try
	{
		const res = await fetch('/api/friends/all');
		if (res.ok)
		{
			const json = await res.json();
			return json;
		}

		console.log("Friends fetch failed: ", res.status);
	}
	catch (e)
	{
		console.log("Encountered error while fetching friends: ", e);
	}
	return null;
}

export async function fetchFriends(): Promise<boolean>
{
	const json = await fetchFriendsJson();
	if (json)
	{
		friends.set(json);
		return true;
	}
	return false;
}