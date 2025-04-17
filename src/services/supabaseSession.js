// src/services/supabaseSession.js
import { supabase } from './supabase'

export async function createSession(name, data) {
  const user = (await supabase.auth.getUser()).data.user
  const { error } = await supabase.from('sessions').insert([
    {
      user_id: user.id,
      name,
      data,
    },
  ])
  if (error) throw error
}

export async function getUserSessions() {
  const user = (await supabase.auth.getUser()).data.user
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function deleteSession(id) {
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) throw error
} 