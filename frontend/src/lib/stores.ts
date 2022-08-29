import { writable } from 'svelte/store';

// https://svelte.dev/repl/b2d671b8119845ca903667f1b3a96e31?version=3.37.0
export function getUser(hostname: string) {
	const loading = writable(false);
	const error = writable(false);
	const user = writable({});

	async function get() {
		console.log("Loading true");
		loading.set(true);
		error.set(false);

		try {
			const response = await fetch(`http://${hostname}:3000/users/me`, {
				credentials: 'include', // To send auth cookies
			});
			const data = await response.json();
			user.set(data);
		}
		catch (e) {
			error.set(e);
		}
		console.log("Loading false");
		loading.set(false);
	}

	get();

	return [user, loading, error, get];
}