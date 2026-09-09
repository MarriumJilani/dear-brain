<div align="center">

# 📓 dear brain

### *we write diaries. but what if your diary could write back?*

> sole developer — concept, design, frontend, backend, AI pipeline, deployment

*a solo full-stack AI project — designed, built, and deployed in 5 weeks*

**[→ try it live](https://dear-brain.vercel.app)**

![](https://img.shields.io/badge/status-live-a8c5a0?style=flat-square) ![](https://img.shields.io/badge/stack-React%20%2B%20Supabase%20%2B%20Groq-9b8ea8?style=flat-square) ![](https://img.shields.io/badge/AI-RAG%20pipeline-e8c4c4?style=flat-square) ![](https://img.shields.io/badge/cost-$0-d4a96a?style=flat-square)

</div>

---

## the idea

Most diaries just store what happened. dear brain actually *thinks* about it — reading everything you've ever written, finding the emotional threads across months, and reflecting back the patterns you were too close to see.

Built solo in 5 weeks using a production RAG architecture. Runs entirely on free APIs.

You write about a fight with Sara. Six weeks later you write that Sara gave you cold vibes at the mall. Your diary remembers the fight. The brain connects them.

> *"It sounds like the cold vibes you felt at the mall echo that 'huge fight with Sara' you wrote about, where 'she said things that really hurt me and I don't know if I can forgive her.' The contrast between her acting like nothing happened and the chill in her tone must feel even more jarring."*

That's not a generic AI response. That's your history, reflected back at you.

---

## screenshots

<!-- Landing page -->
![dear brain landing page](https://raw.githubusercontent.com/MarriumJilani/dear-brain/main/docs/assets/landing.png)

<!-- Write page with paper texture -->
![writing a diary entry](https://raw.githubusercontent.com/MarriumJilani/dear-brain/main/docs/assets/write.png)

<!-- Brain reflection with cross-entry connection -->
![brain reflection connecting past entries](https://raw.githubusercontent.com/MarriumJilani/dear-brain/main/docs/assets/reflection.png)

<!-- Search and mood filter -->
![mood filter](https://raw.githubusercontent.com/MarriumJilani/dear-brain/main/docs/assets/filter.png)

![search](https://raw.githubusercontent.com/MarriumJilani/dear-brain/main/docs/assets/search.png)

---

## how the AI memory works

This is a RAG (Retrieval-Augmented Generation) pipeline — the same architecture used in production AI products.

```
you write an entry
        ↓
HuggingFace converts it to a 384-dimension semantic vector
        ↓
pgvector searches your diary history for similar vectors
        ↓
top 3 most semantically related past entries retrieved
        ↓
Groq LLM receives: today's entry + your relevant history + system prompt
        ↓
reflection written — grounded in your actual past, not invented
        ↓
response + linked entry IDs saved to database
```

Two entries connect based on emotional similarity, not word overlap. "I feel invisible at home" connects to "nobody noticed I was upset" even though they share no words. The brain finds what you forgot you wrote.

---

## features

- **AI reflection** — after every entry, the brain responds like a thoughtful friend who has read everything you've ever written
- **cross-entry memory** — semantic vectors + pgvector finds emotionally related past entries before every reflection
- **real-time search** — filter your entire diary history by keyword instantly
- **mood filter** — filter entries by how you were feeling that day
- **delete entries** — with a two-click confirmation gate so nothing goes by accident
- **guest preview** — visitors get a one-time brain reflection before signup to feel the magic before committing
- **auth + privacy** — every diary is private by design via Supabase Row Level Security
- **retro UI** — scanline overlay, pixel fonts, blinking cursors, paper texture, star field

---

## tech stack

| layer | technology | why |
|---|---|---|
| **Frontend** | React 18 + Vite | component architecture, fast dev experience |
| **Styling** | TailwindCSS + Framer Motion | utility-first CSS, fluid animations |
| **Database** | Supabase (PostgreSQL) | managed postgres, auth, RLS, free tier |
| **Vector search** | pgvector | cosine similarity on 384-dim embeddings |
| **Embeddings** | HuggingFace `all-MiniLM-L6-v2` | semantic vectors, free inference API |
| **LLM** | Groq `openai/gpt-oss-20b` | fast inference, generous free tier |
| **API layer** | Vercel Edge Functions | serverless, API keys never reach the browser |
| **Deployment** | Vercel + GitHub Actions | auto-deploys on every push |

**Total running cost: $0.** Built entirely on free tiers.

---

## security

Every user's diary is private by design — not just by convention. Supabase Row Level Security enforces at the database level that you can only read, write, or update your own entries. Even with the public API key, a direct database query returns nothing across users. AI API keys live only in Vercel's server environment and never reach client-side code.

---

## what this project demonstrates

- **RAG architecture** — embeddings, vector similarity search, and LLM composition working together end to end
- **Full-stack ownership** — frontend, auth, database schema, serverless API, and deployment owned by one person
- **AI system design** — prompt engineering, context injection, graceful degradation when external APIs fail
- **Database thinking** — pgvector indexing, RLS policies, foreign keys, cascade deletes
- **Production habits** — environment separation, CI/CD pipeline, security-first API design
- **UX engineering** — confirmation gates for destructive actions, real-time filtering, guest-to-user conversion flows
- **Debugging complex systems** — tracing failures across React → Vercel Edge → HuggingFace → Supabase → pgvector

---

<div align="center">

**[→ open dear brain](https://dear-brain.vercel.app)**

*built by [Marrium Jilani](https://github.com/MarriumJilani) · [LinkedIn](https://www.linkedin.com/in/marrium-jilani-a78101217/)*

</div>