import { chatRooms } from '$lib/stores';
import { error } from '@sveltejs/kit';
import { select_option } from 'svelte/internal';
import { get } from 'svelte/store'
//import { chatRooms, user }  from '$lib/stores';

async function loadData(fetch: any, room: string)
{
    let out: any = {room:"", participant:""};

    out.room = await fetch(`/api/chat/rooms?name=${encodeURIComponent(room)}`).then((res) => {
        if (res.ok)
            return res.json();
        throw error(404, 'Room not found');
    });

    out.user = await fetch(`/api/users/me`).then(res => res.json());
    if (!out.user) {
        throw error(404, 'User not found');
    }

    out.participant = out.room.participants.find((p: any) => p.userId == out.user.id);
    if (!out.participant) {
        throw error(404, 'Looks like you are not a participant of this room');
    }

    return out;
}


async function load_test(fetch: any) {
    return {a:'a', b:'b'};
}
// called before the page is rendered
// returned value is sent to data in +page.ts
export async function load({params, fetch})
{
    return await loadData(fetch, params.room);
}