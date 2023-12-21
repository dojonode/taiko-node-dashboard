<script context="module">
	import TaikoHeart from '../assets/TaikoHeart.png';
	import GithubIcon from '../assets/icons/Github.png';
	import TwitterIcon from '../assets/icons/Twitter.png';
	import DiscordIcon from '../assets/icons/Discord.png';
</script>

<div class="footer relative md:top-[35px] top-[0px] bottom-1 mb-1">
  <div class="flex items-center justify-center mb-2 gap-4">
    <a href="https://twitter.com/dojonode" target="_blank">
      <img src={TwitterIcon} class="icon" alt="twitter icon" />
    </a>
    <a href="https://github.com/dojonode/taiko-node-dashboard" target="_blank">
      <img src={GithubIcon} class="icon" alt="github icon" />
    </a>
    <a href="https://discord.gg/taikoxyz" target="_blank">
      <img src={DiscordIcon} class="icon" alt="discord icon" />
    </a>
  </div>
	<p>
		made with <img class="w-4 inline align-sub" src={TaikoHeart} alt="Taiko heart icon" /> by
	</p>
	<p>wolfez and helios</p>
</div>

<style>
	.footer {
		color: hsl(var(--twc-cardSubBodyColor));
		text-align: center;
		padding: 20px;
		padding-bottom: 40px;
	}

  .icon{
    width: 20px;
  }
</style>
