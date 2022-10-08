import { chatRooms } from '$lib/stores';
import { error } from '@sveltejs/kit';
import { outro_and_destroy_block, select_option } from 'svelte/internal';
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
    console.log("out.room: ", out.room);

    out.user = await fetch(`/api/users/me`).then(res => res.json());
    console.log(`USER USER USER USER: ${JSON.stringify(out.user)}`);
    if (!out.user) {
        throw error(404, 'User not found');
    }

    if (out.room.banned.find((cur) => cur == out.user.login)) {
        throw error(404, 'You are banned from this room');
    }

    out.participant = out.room.participants.find((p: any) => p.userId == out.user.id);
    if (!out.participant) {
        throw error(404, 'Looks like you are not a participant of this room');
    }

    console.log("out : ", out);

    out.room.messages.sort((a, b) => {
        return (a.timestamp == b.timestamp ? 0 : (a.timestamp < b.timestamp ? -1 : 1));
    });

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