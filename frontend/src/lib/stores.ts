import { writable } from 'svelte/store';
import { getBackendUrl } from './utils';

export const test = writable(false);

// const currentUser = writable(null);
const loading = writable(false);
const error = writable(false);
const user = writable({});

// https://svelte.dev/repl/b2d671b8119845ca903667f1b3a96e31?version=3.37.0
export function getUser(update: boolean = true)
{

	async function fetchUser()
	{

		// const currrentUserJson = get(currentUser);
		// if (currrentUserJson) {
		// 	user.set(currrentUserJson);
		// 	return;
		// }

		loading.set(true);
		error.set(false);

		try
		{
			const response = await fetch(getBackendUrl('/users/me'), {
				credentials: 'include', // To send auth cookies
			});
			if (response.status !== 200)
			{
				error.set(response);
				loading.set(false);
				return;
			}
			const data = await response.json();
			user.set(data);
		}
		catch (e)
		{
			error.set(e);
		}
		loading.set(false);
	}

	fetchUser();

	return [user, loading, error, fetchUser];
}