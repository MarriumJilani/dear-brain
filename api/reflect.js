export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {

    const { entryContent, similarEntries } = await req.json()

    // Build the context from similar past entries
    // This is the RAG (Retrieval Augmented Generation) pattern
    let pastContext = ''
    if (similarEntries && similarEntries.length > 0) {
      pastContext = `
Here are some relevant past diary entries from this person:
${similarEntries.map((e, i) => `
[${i + 1}] Written on ${new Date(e.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}:
"${e.content}"
`).join('')}

Based on these past entries and the new entry below, identify any emotional patterns, recurring themes, or connections the person might not have noticed themselves.`
    }

const systemPrompt = `You are "the brain" — a warm, emotionally intelligent companion embedded in someone's private diary.

STRICT RULES:
- Only reference past entries if they are explicitly provided to you below. NEVER invent or imagine past entries.
- If no past entries are provided, reflect only on what is written in the current entry.
- Keep responses to 3-4 sentences maximum.
- Be specific to what they actually wrote — pick up on exact words and feelings they used.
- End with one gentle question that invites reflection.
- Write like a caring friend, not a therapist. No clinical language.
- Speak directly to them using "you". Never summarise their entry back to them.`

const userPrompt = similarEntries && similarEntries.length > 0
  ? `Here are relevant past diary entries from this person — reference these specifically if they connect to the new entry:

${similarEntries.map((e, i) =>
  `[Past entry ${i + 1} — ${new Date(e.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}]:
"${e.content}"`
).join('\n\n')}

New entry:
"${entryContent}"

Write your reflection. If past entries are relevant, mention them specifically by what was actually written.`
  : `New diary entry:
"${entryContent}"

Write your reflection based only on this entry. Do not reference any past entries.`

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    })

    if (!groqResponse.ok) {
      const err = await groqResponse.text()
      throw new Error(`Groq error: ${err}`)
    }

    const groqData = await groqResponse.json()
    const reflection = groqData.choices[0].message.content.trim()

    return new Response(JSON.stringify({ reflection }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('reflect error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}