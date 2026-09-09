import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [reflections, setReflections] = useState({})
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null) // holds the entry id being deleted
  const [search, setSearch] = useState('')
  const [activeMood, setActiveMood] = useState(null) // null = show all


  // Compute filtered entries whenever search or mood filter changes
  // This runs on every render — no useEffect needed, it's just a derived value
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = search.trim() === '' || 
      entry.content.toLowerCase().includes(search.toLowerCase().trim())
    
    const matchesMood = activeMood === null || 
      entry.mood_emoji === activeMood ||
      entry.mood?.emoji === activeMood

    return matchesSearch && matchesMood
  })

  // Get all unique moods that actually exist in the user's entries
  // So we only show mood filters that have entries
  const availableMoods = [...new Set(
    entries
      .map(e => e.mood_emoji || e.mood?.emoji)
      .filter(Boolean)
  )]

  useEffect(() => {
    fetchEntries()
  }, [user])

  const fetchEntries = async () => {
    setLoading(true)

    if (user) {
      // Fetch entries and reflections in parallel
      // Promise.all runs both queries at the same time instead of one after the other
      // This cuts the loading time roughly in half
      const [entriesResult, reflectionsResult] = await Promise.all([
        supabase
          .from('entries')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('reflections')
          .select('*')
          .order('created_at', { ascending: false }),
      ])

      if (entriesResult.data) setEntries(entriesResult.data)

      // Convert reflections array into a map keyed by entry_id
      // So you can do reflections[entryId] instead of searching the array every time
      if (reflectionsResult.data) {
        const reflMap = {}
        reflectionsResult.data.forEach(r => {
          reflMap[r.entry_id] = r
        })
        setReflections(reflMap)
      }

    } else {
      const stored = JSON.parse(localStorage.getItem('dear-brain-entries') || '[]')
      setEntries(stored)
    }

    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }
    const handleDelete = async (entryId) => {
    // First click sets deleting state — shows confirm button
    // Second click actually deletes
    if (deleting !== entryId) {
      setDeleting(entryId)
      return
    }

    // Confirmed — delete from Supabase
    // Reflection deletes automatically via cascade
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId)

    if (error) {
      console.error('delete error:', error)
      return
    }

    // Remove from local state so UI updates instantly without refetch
    setEntries(prev => prev.filter(e => e.id !== entryId))
    setReflections(prev => {
      const updated = { ...prev }
      delete updated[entryId]
      return updated
    })
    setSelected(null)
    setDeleting(null)
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
        {user && <p className="font-mono text-sage text-xs mt-1 opacity-70">● {user.email}</p>}
        <p className="font-mono text-dusty text-xs mt-2">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} in your diary
        </p>
        <div className="h-px bg-gradient-to-r from-blush/60 to-transparent mt-3" />
        {/* Search and mood filter — only show when there are entries */}
          {entries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 space-y-3"
            >
              {/* Search bar */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-pixel text-dusty/40 text-xs">
                  {'>'}
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="search your diary..."
                  className="w-full bg-cream/[0.03] border border-dusty/20 text-cream font-mono text-xs px-8 py-3 outline-none focus:border-dusty/50 transition-colors placeholder:text-dusty/30"
                />
                {/* Clear button — only shows when there's text */}
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-dusty/40 hover:text-dusty transition-colors text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Mood filter pills */}
              {availableMoods.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-pixel text-dusty/40 text-xs">filter:</span>
                  
                  {/* "All" pill */}
                  <button
                    onClick={() => setActiveMood(null)}
                    className={`font-mono text-xs px-3 py-1 border transition-colors ${
                      activeMood === null
                        ? 'border-dusty bg-dusty/20 text-cream'
                        : 'border-dusty/20 text-dusty/50 hover:border-dusty/50'
                    }`}
                  >
                    all
                  </button>

                  {/* One pill per unique mood in the diary */}
                  {availableMoods.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setActiveMood(activeMood === emoji ? null : emoji)}
                      className={`text-sm px-3 py-1 border transition-all ${
                        activeMood === emoji
                          ? 'border-blush bg-blush/20 scale-110'
                          : 'border-dusty/20 hover:border-dusty/40 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Results count — only shows when filtering */}
              {(search || activeMood) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-dusty/50 text-xs"
                >
                  {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
                  {search && ` for "${search}"`}
                  {activeMood && ` feeling ${activeMood}`}
                </motion.p>
              )}
            </motion.div>
          )}
      </motion.div>

      {loading ? (
        <div className="text-center py-24">
          <p className="font-pixel text-dusty text-xs animate-pulse">loading your diary...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="text-5xl mb-4">📭</div>
          <p className="font-pixel text-dusty text-xs leading-loose">
            {search || activeMood ? (
              <>
                nothing found.<br />
                <span
                  className="text-blush cursor-pointer hover:text-cream"
                  onClick={() => { setSearch(''); setActiveMood(null) }}
                >
                  clear filters
                </span>
              </>
            ) : (
              <>
                no entries yet.<br />
                <span
                  className="text-blush cursor-pointer hover:text-cream"
                  onClick={() => navigate('/write')}
                >
                  write your first one.
                </span>
              </>
            )}
          </p>
        </motion.div>
      ) : (
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-dusty/20" />
          <div className="space-y-6 pl-10">
            {filteredEntries.map((entry, i) => {
              const reflection = reflections[entry.id]
              return (
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
                    onClick={() => {
                              setDeleting(null) // cancel any pending delete confirm
                              setSelected(selected === entry.id ? null : entry.id)
                            }}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-pixel text-dusty text-xs">
                          {formatDate(entry.created_at || entry.createdAt)}
                        </span>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs ${reflection ? 'text-sage' : 'text-dusty/30'}`}
                            title={reflection ? 'brain reflection available' : 'no reflection yet'}
                          >
                            🧠
                          </span>
                          {(entry.mood_emoji || entry.mood?.emoji) && (
                            <span className="text-lg">{entry.mood_emoji || entry.mood?.emoji}</span>
                          )}

                          {/* Delete button — only shows when entry is expanded */}
                          {selected === entry.id && user && (
                            <motion.button
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onClick={e => {
                                e.stopPropagation() // prevent card toggle when clicking delete
                                handleDelete(entry.id)
                              }}
                              className={`font-pixel text-xs transition-colors px-2 py-1 ${
                                deleting === entry.id
                                  ? 'text-red-400 border border-red-400/50 bg-red-400/10'
                                  : 'text-dusty/30 hover:text-red-400'
                              }`}
                            >
                              {deleting === entry.id ? 'confirm delete?' : 'delete'}
                            </motion.button>
                          )}
                        </div>
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

                    {/* Brain reflection section — only shows when entry is expanded */}
                    <AnimatePresence>
                      {selected === entry.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-dusty/20 overflow-hidden"
                        >
                          <div className="p-4 bg-dusty/5">
                            <p className="font-pixel text-dusty text-xs mb-3">🧠 brain says:</p>

                            {reflection ? (
                              <>
                                <p className="font-mono text-cream/80 text-xs leading-relaxed">
                                  {reflection.ai_response}
                                </p>
                                {/* Show which past entries the brain connected */}
                                {reflection.linked_entry_ids?.length > 0 && (
                                  <p className="font-pixel text-dusty/40 text-xs mt-3">
                                    ↗ connected to {reflection.linked_entry_ids.length} past {reflection.linked_entry_ids.length === 1 ? 'entry' : 'entries'}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="font-mono text-dusty/40 text-xs leading-relaxed italic">
                                no reflection for this entry yet.
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}