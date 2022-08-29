import { writable, get } from 'svelte/store';

// const currentUser = writable(null);

// https://svelte.dev/repl/b2d671b8119845ca903667f1b3a96e31?version=3.37.0
export function getUser(hostname: string) {
	const loading = writable(false);
	const error = writable(false);
	const user = writable({});

	async function getUser() {

		// const currrentUserJson = get(currentUser);
		// if (currrentUserJson) {
		// 	user.set(currrentUserJson);
		// 	return;
		// }

		loading.set(true);
		error.set(false);

		try {
			console.log("Fetching user");
			const response = await fetch(`http://${hostname}:3000/users/me`, {
				credentials: 'include', // To send auth cookies
			});
			const data = await response.json();
			user.set(data);
			// currentUser.set(data);
			console.log(JSON.stringify(data, null, 2));
		}
		catch (e) {
			error.set(e);
		}
		loading.set(false);
	}

	getUser();

	return [user, loading, error, getUser];
}