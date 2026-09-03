// Calls our Vercel edge function to generate an embedding
export async function generateEmbedding(text) {
  const response = await fetch('/api/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error('failed to generate embedding')
  }

  const { embedding } = await response.json()
  return embedding
}

// Calls our Vercel edge function to generate a reflection
export async function generateReflection(entryContent, similarEntries = []) {
  const response = await fetch('/api/reflect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entryContent, similarEntries }),
  })

  if (!response.ok) {
    throw new Error('failed to generate reflection')
  }

  const { reflection } = await response.json()
  return reflection
}

// Finds past entries similar to the given embedding
// Calls a Supabase database function (match_entries) we created in SQL
export async function findSimilarEntries(supabase, embedding, userId, excludeEntryId = null) {
  const { data, error } = await supabase.rpc('match_entries', {
    query_embedding: embedding,
    match_user_id: userId,
    match_count: 3,
    match_threshold: 0.5,
  })

  if (error) {
    console.error('similarity search error:', error)
    return []
  }

  // Exclude the current entry from results (don't want it referencing itself)
  return data.filter(e => e.id !== excludeEntryId)
}