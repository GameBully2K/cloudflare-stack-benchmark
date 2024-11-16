<script lang="ts">
	import { page } from '$app/stores'
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	async function logout() {
		const res = await fetch('/api/logout', { method: 'POST' })
		if (res.ok) {
			location.href = '/login';
		} else {
			console.error('Logout failed');
		}
	}

	let kvReadLatency = null as number | null;
	let kvWriteLatency = null as number | null;
	async function testKv() {
		const res = await fetch('/api/benchmark/kv', { method: 'POST' })
		if (res.ok) {
			const data = await res.json() as { read: number, write: number };
			kvReadLatency = data.read;
			kvWriteLatency = data.write;
		} else {
			console.error('KV Benchmark failed');
		}
	}

	let d1ReadLatency = null as number | null;
	let d1WriteLatency = null as number | null;
	let d1DeleteLatency = null as number | null;
	
	async function testD1() {
		const res = await fetch('/api/benchmark/d1', { method: 'POST' })
		if (res.ok) {
			const data = await res.json() as { read: number, write: number, delete: number };
			d1ReadLatency = data.read;
			d1WriteLatency = data.write;
			d1DeleteLatency = data.delete;
		} else {
			console.error('D1 Benchmark failed');
		}
	}

			

</script>

<main>
	<div class="flex p-6 justify-between">
		<h2 class="h2 font-semibold">Hello, <b>{$page.data.firstName ?? $page.data.username ?? "Not Set"}</b></h2>
		<button type="button" class="btn variant-filled w-1/4 md:w-[8em] " on:click={logout}>
			logout
		</button>
	</div>
	
	<div class="flex flex-row">
		{#if ($page.data.username)}
			<form class="flex flex-col gap-4 p-4 md:w-1/4 " method="POST" use:enhance>
				<h2 class="h2">Change Info</h2>
				<input class="input p-2" type="text" name="username" id="username" value={$page.data.username}/>
				<input class="input p-2" type="text" name="firstName" id="firstName" value={$page.data.firstName}/>
				<input class="input p-2" type="text" name="lastName" id="lastName" value={$page.data.lastName}/>
				<input class="input p-2" type="text" name="email" id="email" value={$page.data.email}/>
				<button class="btn variant-filled" type="submit">Update</button>
				<p>{form?.message ?? ''}</p>
			</form>
		{/if}
		<div class="flex flex-col gap-4 p-4 md:w-3/4 ">
			<h2 class="h2"> Benchmark </h2>
			<div class="benchmarkLists flex flex-col gap-4">
				<div id="kvBenchmark" class="flex justify-between items-center">
					<h3 class="h3 w-1/6">CL KV </h3>
					<p>Write Latency</p>
					<input type="number" class="input w-1/6" placeholder="awaiting" bind:value={kvWriteLatency} disabled />
					<p>Read Latency</p>
					<input type="number" class="input w-1/6" placeholder="awaiting" bind:value={kvReadLatency} disabled />
					<button type="button" class="btn variant-filled md:w-[8em] " on:click={testKv}>
						test
					</button>
				</div>
				<div id="d1Benchmark" class="flex justify-between items-center">
					<h3 class="h3 w-1/6">D1</h3>
					<p>Write Latency</p>
					<input type="number" class="input w-1/6" placeholder="awaiting" bind:value={d1WriteLatency} disabled />
					<p>Read Latency</p>
					<input type="number" class="input w-1/6" placeholder="awaiting" bind:value={d1ReadLatency} disabled />
					<p>Delete Latency</p>
					<input type="number" class="input w-1/6" placeholder="awaiting" bind:value={d1DeleteLatency} disabled />
					<button type="button" class="btn variant-filled md:w-[8em] " on:click={testD1}>
						test
					</button>
			</div>
		</div>
	</div>
	
</main>