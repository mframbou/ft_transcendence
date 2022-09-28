import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

let fetchingUser: boolean = false;
let fetchingFriends: boolean = false;
let fetchingGameRooms: boolean = false;
let fetchingUsers: boolean = false;

export const user = writable(null, (set) => {
	if (browser && !fetchingUser && get(user) === null) // dont get if already set (but allow refetch)
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
	if (browser && !fetchingFriends && get(friends) === null)
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
	if (browser && !fetchingGameRooms && get(gameRooms) === null)
	{
		fetchGameRoomsJson().then((json) => {
			if (json)
				set(json);
		});
	}

	return () => {};
});

export const users = writable(null, (set) => {
	if (browser && !fetchingUsers && get(users) === null)
	{
		fetchUsersJson().then((json) => {
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
	fetchingGameRooms = true;
	try
	{
		let res;
		if (typeof(customFetch) !== 'undefined')
			res = await customFetch('/api/game/rooms');
		else
			res = await fetch('/api/game/rooms');

		fetchingGameRooms = false;
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
	fetchingGameRooms = false;
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
	fetchingUser = true;
	try
	{
		let res;
		if (typeof(customFetch) !== 'undefined')
			res = await customFetch('/api/users/me');
		else
			res = await fetch('/api/users/me');

		fetchingUser = false;
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
	fetchingUser = false;
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
	fetchingFriends = true;
	try
	{
		let res;
		if (typeof(customFetch) !== 'undefined')
			res = await customFetch('/api/friends/all');
		else
			res = await fetch('/api/friends/all');

		fetchingFriends = false;
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
	fetchingFriends = false;
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

async function fetchUsersJson(customFetch?: any)
{
	fetchingUsers = true;
	try
	{
		let res;
		if (typeof(customFetch) !== 'undefined')
			res = await customFetch('/api/users');
		else
			res = await fetch('/api/users');

		fetchingUsers = false;
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
	fetchingUsers = false;
	return null;
}

export async function fetchUsers(customFetch?: any): Promise<boolean>
{
	const json = await fetchUserJson(customFetch);
	if (json)
	{
		user.set(json);
		return true;
	}
	return false;
}
