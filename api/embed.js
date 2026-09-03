export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { text } = await req.json()

    // Call Hugging Face inference API
    // We use all-MiniLM-L6-v2 — a small but excellent embedding model
    // It converts text into 384 numbers representing its meaning
    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true },
        }),
      }
    )

    if (!hfResponse.ok) {
      const err = await hfResponse.text()
      throw new Error(`HuggingFace error: ${err}`)
    }

    const embedding = await hfResponse.json()

    // HF returns a nested array [[...384 numbers...]]
    // We flatten it to a single array [...384 numbers...]
    const vector = Array.isArray(embedding[0]) ? embedding[0] : embedding

    return new Response(JSON.stringify({ embedding: vector }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('embed error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}