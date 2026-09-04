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
    const apiKey = process.env.HUGGINGFACE_API_KEY


    const hfResponse = await fetch(
      'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
      }
    )


    const rawText = await hfResponse.text()
  

    if (!hfResponse.ok) {
      throw new Error(`HuggingFace ${hfResponse.status}: ${rawText}`)
    }

    const data = JSON.parse(rawText)
    const embedding = Array.isArray(data[0]) ? data[0] : data
  

    return new Response(JSON.stringify({ embedding }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('embed error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}