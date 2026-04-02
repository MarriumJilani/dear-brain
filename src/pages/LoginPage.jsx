import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = () => {
    setStatus('auth coming in week 2 — for now, just explore the UI!')
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button onClick={() => navigate('/')} className="font-pixel text-dusty text-xs hover:text-cream transition-colors mb-8 block">
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
                className="w-full bg-ink border border-dusty/30 text-cream font-mono text-sm px-4 py-3 outline-none focus:border-blush transition-colors"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              onClick={handleSubmit}
              className="w-full font-pixel text-xs bg-blush text-ink py-4 pixel-border hover:bg-cream transition-colors mt-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {mode === 'login' ? 'sign in ✦' : 'create diary ✦'}
            </motion.button>
          </div>

          {status && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-sage text-xs mt-4">
              {'>'} {status}
            </motion.p>
          )}

          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="font-mono text-dusty/50 text-xs mt-6 hover:text-dusty transition-colors block"
          >
            {mode === 'login' ? "don't have an account? sign up" : 'already have one? sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}


