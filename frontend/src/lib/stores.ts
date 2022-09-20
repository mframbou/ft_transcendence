import { readable, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { chatSocket, pongSocket, statusSocket } from '$lib/socket-io';
import { goto } from '$app/navigation';

export const user = writable(await fetchUserJson());
export const friends = writable(await fetchFriendsJson());
export const otpVerifyAndClear = writable(undefined);

// https://svelte.dev/tutorial/readable-stores
export const statusTrackerSocket = readable({}, set => {
	if (!browser) return;

	const socket = statusSocket;
	socket.open();
	console.log("status socket connected");

	return () => {
		socket.close();
		console.log("status socket disconnected");
	};
})

export const pongSocketStore = readable(pongSocket, set => {
	if (!browser) return;

	const socket = pongSocket;
	socket.open();
	console.log("pong socket connected");

	return () => {
		socket.close();
		console.log("pong socket disconnected");
	};
})

export const chatSocketStore = readable(chatSocket, set => {
	if (!browser) return;

	const socket = chatSocket;
	socket.open();
	console.log("chat socket connected");

	return () => {
		socket.close();
		console.log("chat socket disconnected");
	};
})

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
		const res = await fetch('/api/friends');
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