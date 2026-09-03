import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TextareaAutosize from 'react-textarea-autosize'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { generateEmbedding, generateReflection, findSimilarEntries } from '../lib/ai'

const MOODS = [
  { emoji: '✨', label: 'magical' },
  { emoji: '😔', label: 'sad' },
  { emoji: '🔥', label: 'angry' },
  { emoji: '🌸', label: 'soft' },
  { emoji: '😰', label: 'anxious' },
  { emoji: '💫', label: 'dreamy' },
  { emoji: '😤', label: 'frustrated' },
  { emoji: '🌿', label: 'calm' },
  { emoji: '💔', label: 'heartbroken' },
  { emoji: '🎉', label: 'happy' },
]

const PROMPTS = [
  'what happened today that you keep thinking about?',
  "how did your body feel today?",
  "what did you say that you wish you hadn't?",
  'what are you not saying out loud?',
  'describe today in three words, then explain why.',
  'who took up space in your mind today?',
  'what would you tell yourself from this morning?',
]

// Shows what the brain is currently doing — gives the user feedback
// during the AI processing steps which can take a few seconds
const BRAIN_STEPS = [
  'reading your entry...',
  'searching your memory...',
  'finding patterns...',
  'writing reflection...',
]

function getDateString() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

export default function WritePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [selectedMood, setSelectedMood] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [brainStep, setBrainStep] = useState(0)
  const [error, setError] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [prompt, setPrompt] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
  }, [])

  useEffect(() => {
    if (showPrompt && charIndex < prompt.length) {
      const timeout = setTimeout(() => setCharIndex(i => i + 1), 30)
      return () => clearTimeout(timeout)
    }
  }, [showPrompt, charIndex, prompt])

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0)
    setWordCount(content.trim() ? words.length : 0)
  }, [content])

  // Cycle through brain status messages while AI is processing
  useEffect(() => {
    if (!saving) return
    const interval = setInterval(() => {
      setBrainStep(s => (s + 1) % BRAIN_STEPS.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [saving])

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    setError('')

    if (user) {
      try {
        // Step 1 — save the entry text first so we have an ID
        setBrainStep(0)
        const { data: entryData, error: entryError } = await supabase
          .from('entries')
          .insert({
            user_id: user.id,
            content: content.trim(),
            mood_emoji: selectedMood?.emoji || null,
            mood_label: selectedMood?.label || null,
          })
          .select()
          .single()

        if (entryError) throw entryError

        const entryId = entryData.id

        // Step 2 — generate embedding for this entry
        // The embedding represents the *meaning* of the text as numbers
        setBrainStep(1)
        let similarEntries = []

        try {
          const embedding = await generateEmbedding(content.trim())

          // Step 3 — update the entry row with its embedding
          await supabase
            .from('entries')
            .update({ embedding })
            .eq('id', entryId)

          // Step 4 — find past entries with similar meaning
          setBrainStep(2)
          similarEntries = await findSimilarEntries(supabase, embedding, user.id, entryId)

        } catch (embedError) {
          // Embedding failed — not critical, continue without memory
          // The reflection will still work, just without past context
          console.warn('embedding failed, continuing without memory:', embedError)
        }

        // Step 5 — generate AI reflection
        // Passes the entry + any similar past entries for pattern finding
        setBrainStep(3)
        const reflection = await generateReflection(content.trim(), similarEntries)

        // Step 6 — save the reflection to the database
        await supabase
          .from('reflections')
          .insert({
            entry_id: entryId,
            user_id: user.id,
            ai_response: reflection,
            linked_entry_ids: similarEntries.map(e => e.id),
          })

      } catch (err) {
        console.error('save error:', err)
        setError('something went wrong. your entry was saved but the brain had trouble reflecting.')
      }

    } else {
      // Not logged in — localStorage fallback (no AI, no memory)
      const entry = {
        id: Date.now().toString(),
        content,
        mood: selectedMood,
        createdAt: new Date().toISOString(),
      }
      const existing = JSON.parse(localStorage.getItem('dear-brain-entries') || '[]')
      localStorage.setItem('dear-brain-entries', JSON.stringify([entry, ...existing]))
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => navigate('/timeline'), 2000)
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-8 max-w-2xl mx-auto">

      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/')} className="font-pixel text-dusty text-xs hover:text-cream transition-colors">
          {'<'} back
        </button>
        <div className="flex items-center gap-3">
          {user && <span className="font-mono text-sage text-xs opacity-70">● syncing to cloud</span>}
          <span className="font-pixel text-dusty text-xs opacity-60">{getDateString()}</span>
        </div>
      </div>

      <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h1 className="font-pixel text-cream text-base mb-1 glow-pink">
          today's entry <span className="animate-blink">█</span>
        </h1>
        <div className="h-px bg-gradient-to-r from-blush/60 to-transparent mt-3" />
      </motion.div>

      <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <p className="font-pixel text-dusty text-xs mb-3 opacity-70">{'>'} how are you feeling?</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(mood => (
            <motion.button
              key={mood.label}
              onClick={() => setSelectedMood(mood)}
              className={`px-3 py-2 font-mono text-xs border transition-all duration-200 ${
                selectedMood?.label === mood.label
                  ? 'border-blush bg-blush/20 text-cream'
                  : 'border-dusty/30 text-dusty hover:border-dusty hover:text-cream'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              {mood.emoji} {mood.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div className="mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <button
          onClick={() => { setShowPrompt(true); setCharIndex(0) }}
          className="font-pixel text-dusty/50 text-xs hover:text-dusty transition-colors"
        >
          {'>'} need a prompt? click here
        </button>
        <AnimatePresence>
          {showPrompt && (
            <motion.p
              className="font-mono text-sage text-sm mt-2 leading-relaxed"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              "{prompt.slice(0, charIndex)}"
              {charIndex < prompt.length && <span className="animate-blink">█</span>}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div className="relative mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="paper-texture rounded-sm border border-aged/40 p-6 glow-purple relative">
          <div className="absolute left-12 top-0 bottom-0 w-px bg-red-300/30" />
          <TextareaAutosize
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="dear brain, today..."
            minRows={10}
            className="w-full bg-transparent resize-none outline-none font-mono text-ink text-sm leading-7 pl-6 placeholder:text-ink/30"
            style={{ fontFamily: "'Lora', serif", lineHeight: '28px' }}
            autoFocus
          />
        </div>
        <div className="absolute bottom-3 right-4 font-pixel text-ink/30 text-xs">{wordCount}w</div>
      </motion.div>

      {error && (
        <p className="font-mono text-red-400 text-xs mb-4">{'>'} {error}</p>
      )}

      <AnimatePresence mode="wait">
        {saving ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            {/* Animated brain indicator */}
            <motion.span
              className="text-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              🧠
            </motion.span>
            <span className="font-pixel text-dusty text-xs animate-pulse">
              {BRAIN_STEPS[brainStep]}
            </span>
          </motion.div>
        ) : !saved ? (
          <motion.div className="flex gap-4 items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.button
              onClick={handleSave}
              disabled={!content.trim()}
              className={`font-pixel text-xs px-6 py-4 pixel-border transition-all duration-200 ${
                content.trim()
                  ? 'bg-sage text-ink hover:bg-cream cursor-pointer'
                  : 'bg-dusty/20 text-dusty/40 cursor-not-allowed'
              }`}
              whileHover={content.trim() ? { scale: 1.04 } : {}}
              whileTap={content.trim() ? { scale: 0.97 } : {}}
            >
              save entry ✦
            </motion.button>
            {content.trim() && (
              <span className="font-mono text-dusty/50 text-xs">
                {user ? '☁ will sync + get reflection' : '⚠ not signed in — saves locally only'}
              </span>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="font-pixel text-sage text-xs">
            ✓ entry saved. the brain is listening...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}