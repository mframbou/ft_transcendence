import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export const user = writable(null, (set) => {
	if (browser)
	{
		fetchUserJson().then((json) => {
			if (json)
				set(json);
		});
	}

	return () => {};
});

export const friends = writable(null, (set) =>
{
	if (browser)
	{
		fetchFriendsJson().then((json) =>
		{
			if (json)
				set(json);
		});
	}

	return () => {};
});

export const gameRooms = writable(null, (set) => {
	if (browser)
	{
		fetchGameRoomsJson().then((json) => {
			if (json)
				set(json);
		});
	}

	return () => {};
});

export const otpVerifyAndClear = writable(undefined);

export const chatRooms: any = writable([]);

async function fetchGameRoomsJson(customFetch?: any)
{
	try
	{
		let res;
		if (typeof(customFetch) !== 'undefined')
			res = await customFetch('/api/game/rooms');
		else
			res = await fetch('/api/game/rooms');

		if (res.ok)
		{
			const json = await res.json();
			return json;
		}

		console.log("GameRooms fetch failed: ", res.status);
	}
	catch (e)
	{
		console.log("Encountered error while fetching gameRooms: ", e);
	}
	return null;
}

export async function fetchGameRooms(customFetch?: any): Promise<boolean>
{
	const json = await fetchGameRoomsJson(customFetch);
	if (json)
	{
		gameRooms.set(json);
		return true;
	}
	return false;
}

async function fetchUserJson(customFetch?: any)
{
	try
	{
		let res;
		if (typeof(customFetch) !== 'undefined')
			res = await customFetch('/api/users/me');
		else
			res = await fetch('/api/users/me');

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

export async function fetchUser(customFetch?: any): Promise<boolean>
{
	const json = await fetchUserJson(customFetch);
	if (json)
	{
		user.set(json);
		return true;
	}
	return false;
}

async function fetchFriendsJson(customFetch?: any)
{
	try
	{
		let res;
		if (typeof(customFetch) !== 'undefined')
			res = await customFetch('/api/users/me/friends');
		else
			res = await fetch('/api/users/me/friends');

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

export async function fetchFriends(customFetch?: any): Promise<boolean>
{
	const json = await fetchFriendsJson(customFetch);
	if (json)
	{
		friends.set(json);
		return true;
	}
	return false;
}