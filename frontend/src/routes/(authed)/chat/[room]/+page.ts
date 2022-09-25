import { error } from '@sveltejs/kit';
import { select_option } from 'svelte/internal';
import { get } from 'svelte/store'
import { user }  from '$lib/stores';

async function loadData(fetch: any, room: string)
{
    // code below for chatRoom to check if user is in the room

    //let my_user = get(user);
    //if (my_user.login != 'dsamain')
        //throw error(404, 'User not found');

	try
	{

        // get room

        //console.log(my_user);
        //let res;
		//res['room'] = await fetch(`/api/chat/rooms?name=${encodeURIComponent(room)}`);

        //let res = {room};
		//res.room = await fetch(`/api/chat/rooms?name=${encodeURIComponent(room)}`);

        console.log("${encodeURIComponent(room)}:  " + encodeURIComponent(room));

        let cur_room = await fetch(`/api/chat/rooms?name=${encodeURIComponent(room)}`).then(res => res.json());

        //if (cur_room)

        //for (let p of cur_room.participants) 
        //console.log("room: " + JSON.stringify(res.json()));

        //let res = {room: await fetch(`/api/chat/rooms?name=${encodeURIComponent(room)}`)};
        ////res.room = "test";
        //console.log("res.room : " + JSON.stringify(res.room.json()));






		//if (!res.test.ok)
		//{
            //console.log
			//throw error(res.test.status, res.test.statusText);
		//}

        return cur_room;
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
export async function load({params, fetch})
{
	return {
        chatRooms: await loadData(fetch, params.room),
	}
}