import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('please fill in both fields.')
      return
    }
    if (password.length < 6) {
      setError('password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError('')
    setStatus('')

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message.toLowerCase())
        setLoading(false)
      } else {
        setStatus('welcome back. loading your diary...')
        setTimeout(() => navigate('/timeline'), 1200)
      }
    } else {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message.toLowerCase())
        setLoading(false)
      } else {
        setStatus('account created! check your email to confirm, then sign in.')
        //as of now we dont get anything on email
        setLoading(false)
      }
    }
  }

  // Allow pressing Enter to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/')}
          className="font-pixel text-dusty text-xs hover:text-cream transition-colors mb-8 block"
        >
          {'<'} back
        </button>

        <div className="border border-dusty/30 p-8 bg-cream/[0.02] glow-purple">
          <h1 className="font-pixel text-cream text-sm mb-1 glow-pink">
            {mode === 'login' ? 'welcome back' : 'create account'}
          </h1>
          <p className="font-mono text-dusty/50 text-xs mb-8">
            {mode === 'login' ? 'your diary is waiting.' : 'start your journey.'}
          </p>

          <div className="space-y-4">
            <div>
              <label className="font-pixel text-dusty text-xs block mb-2">{'>'} email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-ink border border-dusty/30 text-cream font-mono text-sm px-4 py-3 outline-none focus:border-blush transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="font-pixel text-dusty text-xs block mb-2">{'>'} password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-ink border border-dusty/30 text-cream font-mono text-sm px-4 py-3 outline-none focus:border-blush transition-colors"
                placeholder="••••••••"
                
              />
            </div>

            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full font-pixel text-xs py-4 pixel-border transition-colors mt-2 ${
                loading
                  ? 'bg-dusty/30 text-dusty/50 cursor-not-allowed'
                  : 'bg-blush text-ink hover:bg-cream cursor-pointer'
              }`}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? 'please wait...' : mode === 'login' ? 'sign in ✦' : 'create diary ✦'}
            </motion.button>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-mono text-red-400 text-xs mt-4"
              >
                {'>'} {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Success message */}
          <AnimatePresence>
            {status && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-mono text-sage text-xs mt-4"
              >
                {'>'} {status}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setStatus('') }}
            className="font-mono text-dusty/50 text-xs mt-6 hover:text-dusty transition-colors block"
          >
            {mode === 'login' ? "don't have an account? sign up" : 'already have one? sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}