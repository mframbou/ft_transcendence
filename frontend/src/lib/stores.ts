import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export const otpVerifyAndClear = writable(undefined);
export const chatRooms = writable([]);
export let notifications = writable([]);

let notifId = 0;
export function addNotification(notif: any, actions?: {text: string, action: () => Promise<void>}[])
{
	notifId++;
	const notifs = get(notifications);
	notifs.push({id: notifId, text: notif.content, link: notif.link, actions: actions});
	notifications.set(notifs);
	console.log('added notif', notif.title + "-----" + notif.content);
}

export const { store: user, fetchFunction: fetchUser } = createStandardFetchStore('/api/users/me', 'user');
export const { store: friends, fetchFunction: fetchFriends } = createStandardFetchStore('/api/friends/all', 'friends');
export const { store: gameRooms, fetchFunction: fetchGameRooms } = createStandardFetchStore('/api/game/rooms', 'gameRooms');
export const { store: users, fetchFunction: fetchUsers } = createStandardFetchStore('/api/users', 'users');
export const { store: blockedUsers, fetchFunction: fetchBlockedUsers } = createStandardFetchStore('/api/blacklist/blocked_users', 'blockedUsers');
export const { store: matchesHistory, fetchFunction: fetchMatchesHistory } = createStandardFetchStore('/api/game/history', 'matchesHistory');

// declare function type
type FetchFunction = (customFetch?: any) => Promise<boolean>;
function createStandardFetchStore(url: string, name: string): {store: any, fetchFunction: FetchFunction}
{
	let fetching = false;

	const store = writable(null, (set) =>
	{
		if (browser && !fetching && get(store) === null)
		{
			fetchStandardJson().then((json) => {
				if (json)
					set(json);
			});
		}

		return () => {};
	});

	async function fetchStandardJson(customFetch?: any)
	{
		console.log(`Fetching ${name}...`);
		fetching = true;
		try
		{
			let res;
			if (typeof(customFetch) !== 'undefined')
				res = await customFetch(url);
			else
				res = await fetch(url);

			fetching = false;
			if (res.ok)
			{
				const json = await res.json();
				return json;
			}

			console.log(`Fetch for '${name}' failed, status: ${res.status}`);
		}
		catch (e)
		{
			console.log(`Encountered error while fetching '${name}': ${e}`);
		}
		fetching = false;
		return null;
	}

	async function fetchFunction(customFetch?: any): Promise<boolean>
	{
		const json = await fetchStandardJson(customFetch);
		if (json)
		{
			store.set(json);
			return true;
		}
		return false;
	}

	return {store, fetchFunction};
}