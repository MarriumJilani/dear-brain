import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

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
  const { user, signOut } = useAuth()
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [user])

  const fetchEntries = async () => {
    setLoading(true)

    if (user) {
      // Logged in — fetch from Supabase
      // .order('created_at', { ascending: false }) means newest first
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setEntries(data)
      }
    } else {
      // Not logged in — read from localStorage
      const stored = JSON.parse(localStorage.getItem('dear-brain-entries') || '[]')
      setEntries(stored)
    }

    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-8 max-w-2xl mx-auto">

      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/')} className="font-pixel text-dusty text-xs hover:text-cream transition-colors">
          {'<'} back
        </button>
        <div className="flex items-center gap-4">
          {user ? (
            <button onClick={handleSignOut} className="font-mono text-dusty/50 text-xs hover:text-dusty transition-colors">
              sign out
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="font-mono text-dusty/50 text-xs hover:text-dusty transition-colors">
              sign in to sync
            </button>
          )}
          <button onClick={() => navigate('/write')} className="font-pixel text-xs bg-blush text-ink px-4 py-2 hover:bg-cream transition-colors">
            + new entry
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-pixel text-cream text-base glow-pink mb-1">your timeline</h1>
        {user && (
          <p className="font-mono text-sage text-xs mt-1 opacity-70">● {user.email}</p>
        )}
        <p className="font-mono text-dusty text-xs mt-2">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} in your diary
        </p>
        <div className="h-px bg-gradient-to-r from-blush/60 to-transparent mt-3" />
      </motion.div>

      {loading ? (
        <div className="text-center py-24">
          <p className="font-pixel text-dusty text-xs animate-pulse">loading your diary...</p>
        </div>
      ) : entries.length === 0 ? (
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
                <div className="absolute -left-7 top-3 w-2.5 h-2.5 rounded-full bg-dusty border-2 border-ink" />
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
                      <span className="font-pixel text-dusty text-xs">
                        {formatDate(entry.created_at || entry.createdAt)}
                      </span>
                      {(entry.mood_emoji || entry.mood?.emoji) && (
                        <span className="text-lg">{entry.mood_emoji || entry.mood?.emoji}</span>
                      )}
                    </div>

                    {selected === entry.id ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="paper-texture p-4 mt-2">
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