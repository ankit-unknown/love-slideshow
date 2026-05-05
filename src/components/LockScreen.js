import React, { useState, useCallback } from 'react';
import './LockScreen.css';

const PASSCODE = '788909';
const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del'];

export default function LockScreen({ onUnlock }) {
  const [code, setCode] = useState('');
  const [shaking, setShaking] = useState(false);
  const [status, setStatus] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  // ✅ FIX: memoized verify
  const verify = useCallback((entered) => {
    if (entered === PASSCODE) {
      setStatus('welcome');
      setUnlocking(true);
      setTimeout(onUnlock, 1200);
    } else {
      setShaking(true);
      setStatus('wrong');
      setTimeout(() => {
        setShaking(false);
        setStatus('');
        setCode('');
      }, 800);
    }
  }, [onUnlock]);

  // ✅ FIX: added verify in dependency array
  const press = useCallback((key) => {
    if (shaking || unlocking) return;

    if (key === 'del') {
      setCode(c => c.slice(0, -1));
      setStatus('');
      return;
    }
    if (key === '') return;

    setCode(prev => {
      const next = prev + key;
      if (next.length === 6) {
        setTimeout(() => verify(next), 180);
      }
      return next.length <= 6 ? next : prev;
    });
  }, [shaking, unlocking, verify]);

  return (
    <div className={`ls-overlay${unlocking ? ' ls-unlocking' : ''}`}>
      <div className="ls-orb ls-orb-a" />
      <div className="ls-orb ls-orb-b" />

      <div className="ls-top">
        <div className="ls-icon">🌸</div>
        <h1 className="ls-title">For You, My Love</h1>
        <p className="ls-sub">Enter your secret code</p>
      </div>

      <div className={`ls-dots${shaking ? ' ls-shake' : ''}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`ls-dot${i < code.length ? ' ls-dot-filled' : ''}`}
          />
        ))}
      </div>

      <div className="ls-ornament">
        <span className="ls-orn-line" />
        <span className="ls-orn-heart">♥</span>
        <span className="ls-orn-line ls-orn-line-r" />
      </div>

      <div className="ls-keypad">
        {KEYS.map((k, i) => (
          <button
            key={i}
            className={`ls-key${k === '' ? ' ls-key-empty' : ''}${
              k === 'del' ? ' ls-key-del' : ''
            }`}
            onClick={() => press(k)}
            aria-label={k === 'del' ? 'Delete' : k === '' ? '' : k}
            tabIndex={k === '' ? -1 : 0}
          >
            {k === 'del' ? '⌫' : k}
          </button>
        ))}
      </div>

      <p
        className={`ls-msg${
          status === 'wrong' ? ' ls-msg-error' : ''
        }${status === 'welcome' ? ' ls-msg-success' : ''}`}
      >
        {status === 'wrong'
          ? 'Try again, love ♥'
          : status === 'welcome'
          ? 'Welcome ♥'
          : 'Enter 6-digit code'}
      </p>
    </div>
  );
}
