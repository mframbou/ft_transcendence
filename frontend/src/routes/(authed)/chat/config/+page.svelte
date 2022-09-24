
<script lang="ts">
    import { goto } from "$app/navigation";


    let name: string = '';
    let is_private: boolean = false;

    function addRoom() {
        // addRoom request return a true/false
        fetch('/api/chat/addRoom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: name, is_private: is_private})
        }).then(res => res.json()).then(data => {
            console.log("addRoom " + (data ? "success" : "fail"));
        });
        goto('/chat/');
    } 

    $: console.log("is_private: " + is_private);
</script>

<div class='wrapper'>
    <h1>ugly ChatRoom configuration</h1>
    <div class='hflex'>  name <input type="text" bind:value={name}> </div>
    <div class='hflex'>  password <input type="text"> </div>
<label>
    <div class='hflex'> <input class="check" type=checkbox bind:checked={is_private}> private</div>
</label>

    <button on:click={addRoom}>create</button>
</div>

<!-- good css to be done -->
<style lang="scss">
    .check {
    }

    .wrapper
	{
		$bg-color: rgba(28, 19, 42, 0.9);

		backdrop-filter: blur(5px);

        display: flex;
        flex-direction: column;

        //position: relative;

		margin: 1px;
        height: 80%;
        //width: 80%;
        min-width: 500px;
		//widows: 100%;
		background-color: $bg-color;
		gap: 10px;
		border-radius: 10px;
        padding: 1%;

        input {
            width: 10%;
            height: 10%;
            margin: 0;
            padding: 1%;

            color: black;
        }

        button {
            //position: absolute;
            right: 10px;
            margin: 0;
            padding: 0;
            width: 20%;
            height: 10%;
            background-color: rgb(88, 146, 0);
            border-radius: 5px;
            color: white;
            font-size: 1.0em;

            &:hover {
                background-color: rgb(88, 146, 0, 0.8);
            }

            &:active {
                background-color: rgb(88, 146, 0, 0.6);
            }
        }
    }

    .hflex {
        display: flex;
        flex-direction: row;
        gap: 10px;
    }

</style>