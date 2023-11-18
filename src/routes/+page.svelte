<script>
	import {
		Table,
		ContentSwitcher,
		Switch,
		Search,
		InlineNotification,
		InlineLoading,
		Tile
	} from 'carbon-components-svelte';

	let selectedIndex = 0;
	let value = '';
	let error = '';
	let loadingStatus = 'inactive';
	let hasSearched = false;

	/**
	 * @type {any[]}
	 */
	let songs = [];

	/**
	 * @type {string | any[]}
	 */
	let searchResults = [];

	/**
	 * @param {{ key: string; }} event
	 */
	async function handleKeyDown(event) {
		if (event.key === 'Enter') {
			hasSearched = true;
			const searchQuery = value.trim();
			if (searchQuery === '') {
				error = 'Search query cannot be empty';
				return;
			}
			loadingStatus = 'active';
			error = '';
			const selectedContent = ['song', 'artist', 'album'][selectedIndex];
			let endpoint = '';
			if (selectedContent === 'song') {
				endpoint = '/api/searchSong';
			} else if (selectedContent === 'artist') {
				endpoint = '/api/searchArtist';
			} else if (selectedContent === 'album') {
				endpoint = '/api/searchAlbum';
			}

			try {
				const response = await fetch(`${endpoint}?q=${encodeURIComponent(searchQuery)}`);
				const result = await response.json();
				if (result.error) {
					error = `Error searching for ${selectedContent}`;
					loadingStatus = 'error';
				} else {
					if (selectedContent === 'song') {
						searchResults = result.tracks.items;
					} else if (selectedContent === 'artist') {
						searchResults = result.artists.items;
					} else if (selectedContent === 'album') {
						searchResults = [result.album];
						songs = result.tracks;
					}
					loadingStatus = 'finished';
				}
			} catch (e) {
				error = 'Error searching for content';
				loadingStatus = 'error';
			}

			setTimeout(() => {
				loadingStatus = 'inactive';
			}, 3000);
		}
	}

	/**
	 * @param {number} duration_ms
	 */
	function formatDuration(duration_ms) {
		const minutes = Math.floor(duration_ms / 60000);
		const seconds = Math.floor((duration_ms % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	/**
	 * @param {number} followers
	 */
	function formatFollowers(followers) {
		if (followers >= 1000000) {
			return `${(followers / 1000000).toFixed(1)}M`;
		} else if (followers >= 1000) {
			return `${(followers / 1000).toFixed(1)}K`;
		} else {
			return followers.toString();
		}
	}
</script>

<svelte:head>
	<title>The Music Lounge | Spotify API Tester</title>
	<meta name="description" content="Spotify API test app" />
</svelte:head>

<div style="max-width: 600px; margin: 0 auto;">
	<section>
		<h1 style="margin-bottom: 25px;" class="bx--type-expressive-heading-01 bx--text-center">
			Choose what you want to search
		</h1>

		<ContentSwitcher style="margin-bottom: 25px;" bind:selectedIndex>
			<Switch name="song">Song</Switch>
			<Switch name="artist">Artist</Switch>
			<Switch name="album">Album</Switch>
		</ContentSwitcher>

		<div style="position: relative;">
			<Search
				bind:value
				labelText="Search"
				on:keydown={handleKeyDown}
				disabled={loadingStatus === 'active'}
			/>
			<div style="position: absolute; top: 50%; right: -40px; transform: translateY(-50%);">
				<InlineLoading status={loadingStatus} />
			</div>
		</div>

		{#if error}
			<InlineNotification lowContrast kind="error" title={error} />
		{:else if searchResults.length > 0}
			{#each searchResults as result, i}
				{#if result.type === 'track'}
					<Tile style="margin-top: 25px;">
						<div style="display: flex; align-items: center;">
							<img
								src={result.album.images[0].url}
								alt={result.name}
								style="width: 100px; height: 100px; margin-right: 1rem;"
							/>
							<div style="display: flex; flex-direction: column;">
								<h2 style="font-size: 2rem; margin-bottom: 0.5rem;">{result.name}</h2>
								<p style="font-size: 1rem; margin-bottom: 0.5rem;">
									{result.artists.map((artist) => artist.name).join(', ')}
								</p>
								<p style="font-size: 0.8rem; margin-bottom: 0.5rem;">
									Released on {result.album.release_date} from the album "{result.album.name}"
								</p>
								<p style="font-size: 0.8rem;">Length: {formatDuration(result.duration_ms)}</p>
							</div>
						</div>
					</Tile>
				{:else if result.type === 'artist'}
					<Tile style="margin-top: 25px;">
						<div style="display: flex; align-items: center;">
							<img
								src={result.images[0].url}
								alt={result.name}
								style="width: 100px; height: 100px; margin-right: 1rem;"
							/>
							<div style="display: flex; flex-direction: column;">
								<h2 style="font-size: 2rem; margin-bottom: 0.5rem;">{result.name}</h2>
								<p style="font-size: 1rem; margin-bottom: 0.5rem;">
									{formatFollowers(result.followers.total)} followers
								</p>
								<p style="font-size: 0.8rem; margin-bottom: 0.5rem;">{result.genres.join(', ')}</p>
							</div>
						</div>
					</Tile>
				{:else if result.type === 'album'}
					<Tile style="margin-top: 25px;">
						<div style="display: flex; align-items: center;">
							<img
								src={result.images[0].url}
								alt={result.name}
								style="width: 100px; height: 100px; margin-right: 1rem;"
							/>
							<div style="display: flex; flex-direction: column;">
								<h2 style="font-size: 2rem; margin-bottom: 0.5rem;">{result.name}</h2>
								<p style="font-size: 1rem; margin-bottom: 0.5rem;">
									{result.artists.map((artist) => artist.name).join(', ')}
								</p>
								<p style="font-size: 0.8rem; margin-bottom: 0.5rem;">
									Released on {result.release_date}
								</p>
							</div>
						</div>

						<Table style="margin-top: 25px;">
							<thead>
								<tr>
									<th>Song</th>
									<th>Artist</th>
									<th>Duration</th>
								</tr>
							</thead>
							<tbody>
								{#each songs as song}
									<tr>
										<td>{song.name}</td>
										<td>{song.artists.map((artist) => artist.name).join(', ')}</td>
										<td>{formatDuration(song.duration_ms)}</td>
									</tr>
								{/each}
							</tbody>
						</Table>
					</Tile>
				{/if}
			{/each}
		{:else if searchResults.length === 0 && value !== '' && loadingStatus !== 'active' && hasSearched}
			<InlineNotification
				lowContrast
				kind="error"
				title="No results found"
				subtitle={`No results found for "${value}"`}
			/>
		{/if}
		<!-- <p>Selected index: {selectedIndex}</p>
		<p>Search query: {value}</p> -->
	</section>

	<style>
		section {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			flex: 0.6;
		}

		h1 {
			width: 100%;
		}
	</style>
</div>
