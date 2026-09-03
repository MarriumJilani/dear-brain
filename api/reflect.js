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

    const systemPrompt = `You are "the brain" — a warm, emotionally intelligent AI companion embedded in someone's private diary. You are not a therapist. You are like a very perceptive, caring friend who has read all their diary entries and genuinely wants to help them understand themselves better.

Your response style:
- Warm but not saccharine. Real but not harsh.
- 3-5 sentences maximum. This is a diary reflection, not an essay. Can be long if there is a requirement of empathy.
- If you spot a pattern or connection to past entries, mention it gently and specifically.
- End with either a gentle observation or a soft question that invites reflection.
- Never use clinical language. Write like a thoughtful friend, not a therapist.
- Use "you" not "the writer". Speak directly to them.
- Don't summarise what they wrote back to them. They know what they wrote. React to it.
- Add a little bit of mystical whimsy to the writing style.`

    const userPrompt = `${pastContext}

New diary entry:
"${entryContent}"

Write your reflection:`

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
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