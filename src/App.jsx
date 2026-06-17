import { useState, useCallback, useMemo, useEffect } from 'react'
import emailjs from '@emailjs/browser'

// ── EmailJS config ──
const SERVICE_ID  = 'service_fm46yfo'
const TEMPLATE_ID = 'template_q1t2gkh'
const PUBLIC_KEY  = 'AF9NqBEhEIBVUtzu3'

// ── Floating hearts data ──
const hearts = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  emoji: ['💕', '💗', '💖', '🩷', '✨', '🌸'][i % 6],
  left: `${Math.random() * 100}%`,
  size: `${0.9 + Math.random() * 1.2}rem`,
  duration: `${6 + Math.random() * 10}s`,
  delay: `${Math.random() * 8}s`,
}))

// ── Confetti generator ──
function generateConfetti() {
  const colors = ['#f78da7', '#667eea', '#43e97b', '#ffcc02', '#ff6b6b', '#764ba2', '#38f9d7']
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    duration: `${1.2 + Math.random() * 2}s`,
    delay: `${Math.random() * 0.8}s`,
    size: `${6 + Math.random() * 8}px`,
    rotation: `${Math.random() * 360}deg`,
  }))
}

export default function App() {
  // "question" | "datepicker" | "success"
  const [screen, setScreen] = useState('question')
  const [chosenDate, setChosenDate] = useState('')
  const [sending, setSending] = useState(false)
  const [noPos, setNoPos] = useState(null) // { top, left } for evading "No"

  const confetti = useMemo(() => (screen === 'success' ? generateConfetti() : []), [screen])

  // ── Initialize EmailJS on mount ──
  useEffect(() => {
    emailjs.init(PUBLIC_KEY)
  }, [])

  // ── Evade handler ──
  const handleNoHover = useCallback(() => {
    const btnW = 130
    const btnH = 52
    const pad = 20
    const maxX = window.innerWidth - btnW - pad
    const maxY = window.innerHeight - btnH - pad
    const newLeft = Math.random() * maxX + pad / 2
    const newTop  = Math.random() * maxY + pad / 2
    setNoPos({ top: newTop, left: newLeft })
  }, [])

  // ── Send email ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!chosenDate || sending) return

    setSending(true)

    // Format the date nicely for the email
    const dateObj = new Date(chosenDate + 'T00:00:00')
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // Send exact variables matching the EmailJS template
    const templateParams = {
      to_email: 'tasjidhasansafayet@gmail.com', // Keep this just in case it's in the "To" field
      name: 'Tasjid',
      time: currentTime,
      hangout_date: formattedDate,
    }

    console.log('Sending email with params:', templateParams)

    try {
      const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
      console.log('EmailJS SUCCESS:', response.status, response.text)
      setChosenDate('')
      setScreen('success')
    } catch (err) {
      console.error('EmailJS FAILED:', err)
      alert('Oops! Something went wrong sending the email. Check the console for details.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating hearts background */}
      <div className="floating-hearts">
        {hearts.map((h) => (
          <span
            className="heart"
            key={h.id}
            style={{
              left: h.left,
              fontSize: h.size,
              animationDuration: h.duration,
              animationDelay: h.delay,
            }}
          >
            {h.emoji}
          </span>
        ))}
      </div>

      {/* Confetti on success */}
      {screen === 'success' && (
        <div className="confetti-container">
          {confetti.map((c) => (
            <div
              className="confetti-piece"
              key={c.id}
              style={{
                left: c.left,
                width: c.size,
                height: c.size,
                background: c.color,
                animationDuration: c.duration,
                animationDelay: c.delay,
                transform: `rotate(${c.rotation})`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Card */}
      <div className={`card ${screen === 'success' ? 'card-success' : ''}`}>

        {/* ── STATE 1: The Question ── */}
        {screen === 'question' && (
          <div className="state-wrapper" key="question">
            <span className="question-emoji">🥺</span>
            <h1 className="question-title">Will we hangout?</h1>
            <p className="question-subtitle">Choose wisely... one of these buttons has a mind of its own.</p>

            <div className="button-row">
              <button
                className="btn btn-yes"
                id="btn-yes"
                onClick={() => setScreen('datepicker')}
              >
                Yes 💚
              </button>

              {noPos === null ? (
                // Render inline initially
                <button
                  className="btn btn-no"
                  id="btn-no"
                  onMouseEnter={handleNoHover}
                >
                  No 💔
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* ── STATE 2: Date Picker ── */}
        {screen === 'datepicker' && (
          <div className="state-wrapper" key="datepicker">
            <span className="question-emoji">🥰</span>
            <h1 className="date-header">Ouu, you actually pressed Yes! 🥰</h1>
            <p className="date-subtext">
              Now pick a date, and let's make it official. <br />
              When are we linking up?
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="date"
                className="date-input"
                id="date-input"
                value={chosenDate}
                onChange={(e) => setChosenDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <button
                type="submit"
                className="btn-confirm"
                id="btn-confirm"
                disabled={!chosenDate || sending}
              >
                {sending ? 'Sending...' : 'Confirm Date 🚀'}
              </button>
            </form>
          </div>
        )}

        {/* ── STATE 3: Success ── */}
        {screen === 'success' && (
          <div className="state-wrapper" key="success">
            <span className="success-emoji">🎉</span>
            <h1 className="success-title">It's a Date!</h1>
            <p className="success-message">
              Everything's locked in and the details have been sent
              straight to <strong>Tasjid's inbox</strong>. <br />
              See you soon! 💫
            </p>
          </div>
        )}
      </div>

      {/* Evading "No" button (rendered outside the card when evading) */}
      {screen === 'question' && noPos !== null && (
        <button
          className="btn btn-no btn-no-evading"
          id="btn-no-evading"
          style={{ top: noPos.top, left: noPos.left }}
          onMouseEnter={handleNoHover}
        >
          No 💔
        </button>
      )}
    </>
  )
}
