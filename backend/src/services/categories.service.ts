import { supabase } from '../lib/supabase'
import { Category } from '../types'

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return (data as Category[]) || []
}

export async function createCategory(name: string, slug: string, description?: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug, description: description || null })
    .select()
    .single()

  if (error || !data) throw new Error(error?.message || 'Error al crear categoría')
  return data as Category
}

export async function updateCategory(id: string, updates: { name?: string; description?: string }): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw new Error(error?.message || 'Error al actualizar categoría')
  return data as Category
}
