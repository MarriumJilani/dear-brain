import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const TAGLINES = [
  'a diary with a brain.',
  'your thoughts, connected.',
  'remember everything.',
  'process your emotions.',
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [taglineIndex, setTaglineIndex] = useState(0)
  const [stars, setStars] = useState([])

  // Generate random stars once when component first loads
  useEffect(() => {
    const generated = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
    }))
    setStars(generated)
  }, [])

  // Cycle through taglines every 2.8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex(i => (i + 1) % TAGLINES.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-ink relative overflow-hidden flex flex-col items-center justify-center px-4">

      {/* Stars — absolutely positioned dots scattered around */}
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-cream"
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2 + star.delay, repeat: Infinity, delay: star.delay }}
        />
      ))}

      {/* Corner UI decoration — makes it feel like a game HUD */}
      <div className="absolute top-4 left-4 text-dusty font-pixel text-xs opacity-40">{'> sys.boot'}</div>
      <div className="absolute top-4 right-4 text-dusty font-pixel text-xs opacity-40">v1.0.0</div>
      <div className="absolute bottom-4 left-4 text-dusty font-pixel text-xs opacity-40">[●●●○○] loading</div>

      {/* Main content */}
      <motion.div
        className="text-center z-10 max-w-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Floating emoji */}
        <motion.div
          className="mb-2"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-6xl">📓</span>
        </motion.div>

        <h1 className="font-pixel text-cream text-2xl mb-3 leading-relaxed glow-pink">
          Dear Brain
        </h1>

        {/* Rotating tagline with fade animation */}
        <div className="h-8 flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={taglineIndex}
              className="font-mono text-dusty text-sm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              {TAGLINES[taglineIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="font-mono text-cream/60 text-sm leading-loose mb-10 max-w-sm mx-auto">
          write your feelings. <br />
          the brain remembers everything. <br />
          it connects the dots you missed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.button
            onClick={() => navigate('/write')}
            className="font-pixel text-xs bg-blush text-ink px-6 py-4 pixel-border hover:bg-cream transition-colors duration-200 w-full sm:w-auto"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            start writing
          </motion.button>
          <motion.button
            onClick={() => navigate('/timeline')}
            className="font-pixel text-xs bg-transparent text-dusty border-2 border-dusty px-6 py-4 hover:border-cream hover:text-cream transition-colors duration-200 w-full sm:w-auto"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            my timeline
          </motion.button>
        </div>

        <p className="font-mono text-dusty/50 text-xs mt-8">
          <span className="cursor-pointer hover:text-dusty transition-colors" onClick={() => navigate('/login')}>
            {'>'} sign in to sync your diary
          </span>
        </p>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-dusty/40 to-transparent" />
    </div>
  )
}