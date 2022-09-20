
<script lang="ts">
    import Button from '$lib/Button.svelte';
	import { onMount } from 'svelte';
    import { chatSocketStore } from '../../../lib/stores';
    import RoomConfig from '../../../lib/RoomConfig.svelte';

    chatSocketStore.subscribe(() => {});
    let config: boolean = false;

    function createNewChatRoom() {
        $chatSocketStore.emit('createRoom', {name: 'default', password: 'default'});
        config = true;
    }


</script>

<Button on:click={createNewChatRoom}>Create New Chat Room</Button>

