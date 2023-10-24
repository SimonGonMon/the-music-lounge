<script>
	import {
		Content,
		Header,
		SkipToContent,
		HeaderGlobalAction,
		HeaderUtilities
	} from 'carbon-components-svelte';
	import { LogoGithub } from 'carbon-icons-svelte';
	import 'carbon-components-svelte/css/all.css';

	let isSideNavOpen = false;
</script>

<div class="app">
	<Header company="The Music Lounge |" platformName="Spotify" bind:isSideNavOpen>
		<svelte:fragment slot="skip-to-content">
			<SkipToContent />
		</svelte:fragment>

		<HeaderUtilities style="margin-left: auto;">
			<HeaderGlobalAction>
				<a href="https://github.com/SimonGonMon/the-music-lounge" target="_blank">
					<LogoGithub class="h-6 w-6" style="fill: white;" />
				</a>
			</HeaderGlobalAction>
		</HeaderUtilities>
	</Header>

	<Content>
		<main style="padding-bottom: 3rem;">
			<slot />
		</main>
	</Content>
</div>
