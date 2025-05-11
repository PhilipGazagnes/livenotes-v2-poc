<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSongs } from '../lib/supabase';
import { saveSong, getAllSongs, deleteAllData } from '../lib/db';

const songs = ref([]);
const isOnline = ref(navigator.onLine);
const isWarmingUp = ref(false);
const progress = ref(0);
const browserSupport = ref({
  indexedDB: 'indexedDB' in window,
  serviceWorker: 'serviceWorker' in navigator
});

onMounted(async () => {
  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  
  // Listen for online/offline events
  window.addEventListener('online', () => isOnline.value = true);
  window.addEventListener('offline', () => isOnline.value = false);
  
  // Load songs from IndexedDB
  await loadSongs();
});

async function loadSongs() {
  try {
    songs.value = await getAllSongs();
  } catch (error) {
    console.error('Error loading songs:', error);
  }
}

async function warmUp() {
  isWarmingUp.value = true;
  progress.value = 0;
  
  try {
    // Fetch songs from Supabase
    const fetchedSongs = await getSongs();
    
    // Save each song to IndexedDB
    for (let i = 0; i < fetchedSongs.length; i++) {
      const song = fetchedSongs[i];
      await saveSong({
        ...song,
        lastUpdated: Date.now()
      });
      
      progress.value = Math.round((i + 1) / fetchedSongs.length * 100);
    }
    
    await loadSongs();
    alert('Warm up complete! You can now use the app offline.');
  } catch (error) {
    console.error('Error warming up:', error);
    alert('There was an error warming up the app. Please try again.');
  } finally {
    isWarmingUp.value = false;
  }
}

async function clearData() {
  try {
    await deleteAllData();
    songs.value = [];
    alert('All data cleared!');
  } catch (error) {
    console.error('Error clearing data:', error);
    alert('There was an error clearing data. Please try again.');
  }
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-md">
    <h1 class="text-2xl font-bold mb-4">Song Book POC</h1>
    
    <!-- Browser Support Check -->
    <div v-if="!browserSupport.indexedDB || !browserSupport.serviceWorker" 
         class="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
      <p class="font-bold">Browser Compatibility Issue</p>
      <p>Caching is not available - please upgrade to a modern browser to benefit from great offline experience.</p>
    </div>
    
    <!-- Online/Offline Status -->
    <div :class="isOnline ? 'bg-green-100 border-green-500' : 'bg-yellow-100 border-yellow-500'" 
         class="border-l-4 p-4 mb-4">
      <p class="font-bold">{{ isOnline ? 'Online' : 'Offline' }}</p>
      <p>{{ isOnline ? 'You can warm up the app.' : 'You are currently offline.' }}</p>
    </div>
    
    <!-- Warm Up Button -->
    <div class="mb-6">
      <button 
        @click="warmUp" 
        :disabled="isWarmingUp || !isOnline"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {{ isWarmingUp ? 'Warming Up...' : 'Warm Up App' }}
      </button>
      
      <button 
        @click="clearData" 
        class="ml-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Clear Data
      </button>
      
      <div v-if="isWarmingUp" class="mt-4">
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            class="bg-blue-600 h-2.5 rounded-full" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <p class="text-sm mt-1">Progress: {{ progress }}%</p>
      </div>
    </div>
    
    <!-- Songs List -->
    <div>
      <h2 class="text-xl font-semibold mb-2">Songs</h2>
      <div v-if="songs.length === 0" class="text-gray-500">No songs found</div>
      <ul v-else class="space-y-2">
        <li v-for="song in songs" :key="song.id" class="p-3 bg-gray-100 rounded">
          <router-link :to="{ name: 'song', params: { id: song.id }}" class="block">
            <h3 class="font-bold">{{ song.name }}</h3>
            <p class="text-sm text-gray-600">{{ song.artist }}</p>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template> 