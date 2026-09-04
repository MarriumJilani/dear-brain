<div align="center">

# 📓 dear brain

### *we write diaries. but what if your diary could write back?*

Most diaries just store what happened. dear brain actually *thinks* about it — connecting your feelings across weeks and months, finding the patterns you were too close to see.

**[→ try it live](https://dear-brain.vercel.app)**

![](https://img.shields.io/badge/status-live-a8c5a0?style=flat-square) ![](https://img.shields.io/badge/stack-React%20%2B%20Supabase%20%2B%20Groq-9b8ea8?style=flat-square) ![](https://img.shields.io/badge/AI-RAG%20pipeline-e8c4c4?style=flat-square)

</div>

---

## the idea

You write about a fight with Sara. Six weeks later you write that Sara gave you cold vibes at the mall.

Your diary remembers the fight. The brain connects them.

> *"It sounds like the cold vibes you felt at the mall echo that 'huge fight with Sara' you wrote about, where 'she said things that really hurt me and I don't know if I can forgive her.' The contrast between her acting like nothing happened and the chill in her tone must feel even more jarring."*

That's not a generic AI response. That's your history, reflected back at you.

---

## what it does

**Write** — a lined paper diary with mood tagging, writing prompts, and a typewriter aesthetic that makes journalling feel like entering a private world.

**Remember** — every entry is converted into a semantic vector and stored. The brain doesn't just keyword-search your past. It understands *meaning* — so "I feel invisible at home" connects to "nobody noticed I was upset" even though they share no words.

**Reflect** — after every save, the brain searches your entire diary history for emotionally related entries, then writes a response that's specific to *you* — your words, your people, your patterns.

**Connect** — entries that link to past ones show *"↗ connected to N past entries"* so you can see the thread the brain pulled.

---

## how the AI memory works

This is a RAG (Retrieval-Augmented Generation) pipeline — the same architecture used in production AI products.

```
you write an entry
        ↓
semantic embedding generated (384-dimension vector representing meaning)
        ↓
pgvector searches your diary history for similar vectors
        ↓
top 3 most semantically related past entries retrieved
        ↓
LLM receives: today's entry + your relevant history + system prompt
        ↓
reflection written — grounded in your actual past, not invented
        ↓
response + linked entry IDs saved to database
```

Two entries connect based on emotional similarity, not word overlap. The brain finds what you forgot you wrote.

---

## tech stack

| | |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion |
| **Database** | Supabase (PostgreSQL + Auth + Row Level Security) |
| **Vector search** | pgvector — cosine similarity on 384-dim embeddings |
| **Embeddings** | HuggingFace `all-MiniLM-L6-v2` |
| **LLM** | Groq `openai/gpt-oss-20b` |
| **API layer** | Vercel Edge Functions — API keys never reach the browser |
| **Deployment** | Vercel — auto-deploys on every GitHub push |

Built entirely on free tiers. No cloud bill.

---

## security

Every user's diary is private by design — not just by convention. Supabase Row Level Security enforces at the database level that you can only ever read, write, or update your own entries. Even a direct database query with the public API key returns nothing across users. The AI API keys live only in Vercel's server environment, never in client-side code.

---

## what this project demonstrates

- **RAG architecture** — embeddings, vector similarity search, and LLM composition working together
- **Full-stack ownership** — frontend, auth, database schema, serverless API, and deployment
- **AI system design** — prompt engineering, context injection, graceful degradation when APIs fail
- **Database thinking** — pgvector indexing, RLS policies, relational schema design
- **Production habits** — environment separation, CI/CD, security-first API design

---

<div align="center">

**[→ open dear brain](https://dear-brain.vercel.app)**

*built by [Marrium Jilani](https://github.com/MarriumJilani)*

</div>
