import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  })
}

function getPreview(text, length = 120) {
  return text.length > length ? text.slice(0, length) + '...' : text
}

export default function TimelinePage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState(null)

  // Read entries from localStorage when page loads
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('dear-brain-entries') || '[]')
    setEntries(stored)
  }, [])

  return (
    <div className="min-h-screen bg-ink px-4 py-8 max-w-2xl mx-auto">

      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/')} className="font-pixel text-dusty text-xs hover:text-cream transition-colors">
          {'<'} back
        </button>
        <button onClick={() => navigate('/write')} className="font-pixel text-xs bg-blush text-ink px-4 py-2 hover:bg-cream transition-colors">
          + new entry
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-pixel text-cream text-base glow-pink mb-1">your timeline</h1>
        <p className="font-mono text-dusty text-xs mt-2">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} in your diary
        </p>
        <div className="h-px bg-gradient-to-r from-blush/60 to-transparent mt-3" />
      </motion.div>

      {entries.length === 0 ? (
        <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="text-5xl mb-4">📭</div>
          <p className="font-pixel text-dusty text-xs leading-loose">
            no entries yet.<br />
            <span className="text-blush cursor-pointer hover:text-cream" onClick={() => navigate('/write')}>
              write your first one.
            </span>
          </p>
        </motion.div>
      ) : (
        <div className="relative">
          {/* The vertical line running down the left — the "timeline" */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-dusty/20" />

          <div className="space-y-6 pl-10">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="relative"
              >
                {/* The dot on the timeline */}
                <div className="absolute -left-7 top-3 w-2.5 h-2.5 rounded-full bg-dusty border-2 border-ink" />

                {/* Entry card — clicking expands/collapses it */}
                <div
                  className={`border transition-all duration-200 cursor-pointer ${
                    selected === entry.id
                      ? 'border-blush/60 bg-blush/5'
                      : 'border-dusty/20 hover:border-dusty/50 bg-cream/[0.02]'
                  }`}
                  onClick={() => setSelected(selected === entry.id ? null : entry.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-pixel text-dusty text-xs">{formatDate(entry.createdAt)}</span>
                      {entry.mood && <span className="text-lg">{entry.mood.emoji}</span>}
                    </div>

                    {selected === entry.id ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="paper-texture p-4 mt-2"
                      >
                        <p className="font-mono text-ink text-sm leading-relaxed whitespace-pre-wrap"
                           style={{ fontFamily: "'Lora', serif" }}>
                          {entry.content}
                        </p>
                      </motion.div>
                    ) : (
                      <p className="font-mono text-cream/50 text-xs leading-relaxed">
                        {getPreview(entry.content)}
                      </p>
                    )}
                  </div>

                  {/* AI brain placeholder — this is where Week 3 fills in */}
                  {selected === entry.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="border-t border-dusty/20 p-4 bg-dusty/5"
                    >
                      <p className="font-pixel text-dusty text-xs mb-2">🧠 brain says:</p>
                      <p className="font-mono text-dusty/60 text-xs leading-relaxed italic">
                        coming in week 3 — the brain will connect your entries and reflect back patterns you might have missed.
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}