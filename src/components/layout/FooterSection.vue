<template>
  <div class="footer-container">
    <a href="https://github.com/Yuuzi261/BA-Gift-Planner" target="_blank" class="github-link">
      <img :src="githubIconUrl" alt="Github Icon" />
    </a>
    <div class="developer-credits">
      Developed by © 2025
      <a href="https://github.com/Yuuzi261" target="_blank" rel="noopener noreferrer">Yuuzi</a>
      <span v-if="appVersion"> 🥑 {{ appVersion }}</span>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { getAssetsFile } from '@utils/getAssetsFile'

  const githubIconUrl = computed(() => getAssetsFile('icon/github.svg'))

  const appVersion = __APP_VERSION__
</script>

<style scoped>
  .footer-container {
    display: flex;
    padding-top: 0.75rem;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #6c757d;
  }

  .github-link img {
    width: 20px;
    height: 20px;
    filter: opacity(0.6);
    transition: filter 0.3s ease;
    vertical-align: middle;
  }

  .github-link:hover img {
    filter: opacity(1);
  }

  .developer-credits {
    font-size: 0.85rem;
    line-height: 1.2;
  }

  .developer-credits a {
    color: inherit;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .developer-credits a:hover {
    color: #343a40;
    text-decoration: underline;
  }

  /* Dark Mode Styles */
  .dark-mode .footer-container {
    color: #98a6b3;
  }
  .dark-mode .github-link img {
    filter: invert(1) opacity(0.6);
  }
  .dark-mode .github-link:hover img {
    filter: invert(1) opacity(1);
  }
  .dark-mode .developer-credits a:hover {
    color: #e9ecef;
    text-decoration: underline;
  }
</style>
