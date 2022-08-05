<script lang="ts">
	export let name: string;
	let name2: string = "Pouet pouet";
	let test: number = 1.5;
	let pouet: string = 'test';

	let value = 1.5;

	let bgs = [
		{name: 'dsamain', bgitude: 100, id: 1},
		{name: 'oronda', bgitude: 5, id: 1}
	];

	$: valueDoubled = value * 2; // Reactive value, updates whenever value changes
	$: {
		// Will run whenever value or name2 changes
		console.log(value);
		console.log(name2);
	}

	const hello = () =>
	{
		name2 += " pouet";
		name2.replace(new RegExp("pouet", "g"), "pouet2");
	}

	const handleInput = (e) =>
	{
		name2 = e.target.value;
	}

	const handleInput2 = (e) =>
	{
		pouet = e.target.value;
	}
</script>

<main>
	<h1>Hello {name}! {name2} your iq is {test}</h1>
	<h2>1 way binding</h2>
	<button on:click={hello}>What would you like to do ?</button>
	<input type="text" on:input={handleInput}>
	<h2>2 way binding: {pouet}</h2>
	<button on:click={() => {pouet = "Test"}}>change text</button>
	<input type="text" on:input={handleInput2} value={pouet}>
	<h2>2 way binding shorter syntax</h2>
	<input type="text" bind:value={pouet}>
	<h3>Value {value} doubled is {valueDoubled}</h3>
	<button on:click={() => {value += 0.5}}>Increase value</button>


	{#each bgs as bg , i (bg.id)} <!-- unique key at the end (https://svelte.dev/tutorial/keyed-each-blocks)	-->
		<h3>{bg.name} (index {i}) has a bgitude of {bg.bgitude}</h3>
	{:else }
		<h3>No bgs found</h3>
	{/each}
</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>