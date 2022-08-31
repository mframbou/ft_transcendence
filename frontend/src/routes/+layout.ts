import { browser } from '$app/env';
import { getUser } from '$lib/stores';

export async function load({})
{
	let [user, loading, error, updateUser] = getUser(false);

	if (browser)
	{
		error.subscribe(async e => {
			if (e !== false)
			{
				// redirect to login page
				window.location.href = '/';
			}
		});
	}

}