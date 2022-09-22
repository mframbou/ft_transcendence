import { error } from '@sveltejs/kit';
import { select_option } from 'svelte/internal';
import { get } from 'svelte/store'
import { user }  from '../../../lib/stores';

async function loadData(fetch: any)
{
    // code below for chatRoom to check if user is in the room

    //let my_user = get(user);
    //if (my_user.login != 'dsamain')
        //throw error(404, 'User not found');

	try
	{
        //console.log(my_user);
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