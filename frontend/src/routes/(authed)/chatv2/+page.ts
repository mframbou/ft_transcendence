import { error } from '@sveltejs/kit';
import { select_option } from 'svelte/internal';
import { get } from 'svelte/store'
import { user }  from '../../../lib/stores';

async function loadData(fetch: any)
{
	try
	{
		const res = await fetch('/api/chat/rooms');

		if (!res.ok)
		{
			throw error(res.status, res.statusText);
		}

		const json = await res.json();
		return json;
	}
	catch(e)
	{
		throw error(404, 'rooms not found');
	}
}

// called before the page is rendered
// returned value is sent to data in +page.ts
export async function load({fetch})
{
	return {
		chatRooms: await loadData(fetch),
	}
}