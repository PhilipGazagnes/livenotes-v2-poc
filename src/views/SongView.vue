<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getSongData as fetchSongData } from '../lib/supabase';
import { getSongData, saveSongData } from '../lib/db';

const props = defineProps<{
  id: string
}>();

const song = ref(null);
const songData = ref(null);
const isOnline = ref(navigator.onLine);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
  // Listen for online/offline events
  window.addEventListener('online', () => isOnline.value = true);
  window.addEventListener('offline', () => isOnline.value = false);
  
  await loadSongData();
});

watch(() => props.id, async () => {
  await loadSongData();
});

async function loadSongData() {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Try to get song data from IndexedDB first
    const storedData = await getSongData(Number(props.id));
    
    if (storedData) {
      songData.value = storedData.data;
      isLoading.value = false;
      return;
    }
    
    // If not in IndexedDB and online, fetch from Supabase
    if (isOnline.value) {
      const data = await fetchSongData(Number(props.id));
      songData.value = data;
      
      // Save to IndexedDB for offline use
      await saveSongData(Number(props.id), data);
    } else {
      error.value = 'Song data not available offline. Please warm up the app first.';
    }
  } catch (err) {
    console.error('Error loading song data:', err);
    error.value = 'Failed to load song data. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-md">
    <div class="mb-4">
      <router-link to="/" class="text-blue-500 hover:underline">&larr; Back to Songs</router-link>
    </div>
    
    <div v-if="isLoading" class="text-center py-8">
      <p>Loading song data...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 p-4">
      <p>{{ error }}</p>
    </div>
    
    <div v-else>
      <h1 class="text-2xl font-bold mb-4">Song Data</h1>
      
      <div class="bg-gray-100 p-4 rounded">
        <pre class="whitespace-pre-wrap overflow-auto">{{ JSON.stringify(songData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template> 