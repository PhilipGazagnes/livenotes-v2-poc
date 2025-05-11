import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getSongs() {
  const { data, error } = await supabase.rpc('get_songs')
  
  if (error) {
    console.error('Error fetching songs:', error)
    throw error
  }
  
  return data
}

export async function getSongData(songId: number) {
  const { data, error } = await supabase.rpc('get_song_data', { song_id: songId })
  
  if (error) {
    console.error(`Error fetching song data for ID ${songId}:`, error)
    throw error
  }
  
  return data
} 