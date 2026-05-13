import { createClient } from '@supabase/supabase-js';
import { Center } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch all activity centers from the 'centers' table.
 */
export async function getCenters(): Promise<Center[]> {
  // Prevent calling Supabase if keys are not configured
  if (supabaseUrl.includes('placeholder')) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('centers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase fetch failed (likely missing table or RLS):', error.message);
      return [];
    }

    return data as Center[];
  } catch (err) {
    return [];
  }
}

/**
 * Fetch a single center by ID.
 */
export async function getCenterById(id: string): Promise<Center | null> {
  const { data, error } = await supabase
    .from('centers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching center ${id}:`, error);
    return null;
  }

  return data as Center;
}

/**
 * Update a center record (Admin only).
 */
export async function updateCenter(id: string, updates: Partial<Center>) {
  const { data, error } = await supabase
    .from('centers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Insert new centers (Admin only/Bulk Import).
 */
export async function insertCenters(centers: Omit<Center, 'id'>[]) {
  const { data, error } = await supabase
    .from('centers')
    .insert(centers)
    .select();

  if (error) {
    throw error;
  }

  return data;
}
