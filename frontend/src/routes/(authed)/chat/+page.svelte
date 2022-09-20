
<script lang="ts">
    import Button from '$lib/Button.svelte';
	import { onMount } from 'svelte';
    import { chatSocketStore } from '../../../lib/stores';

    chatSocketStore.subscribe(() => {});

    function createNewChatRoom() {
        console.log('clicked');
        $chatSocketStore.emit('createRoom', '');
    }

</script>


<br>
<Button on:click={createNewChatRoom}>Create new Chat room</Button>