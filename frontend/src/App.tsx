import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';

// ═══ Icons ═══
const I = ({ name, size = 20, style }: { name: string; size?: number; style?: React.CSSProperties }) => {
  const d: Record<string, string> = {
    github: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
    zap: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z',
    upload: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',
    file: 'M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2zM14 2v6h6',
    trash: 'M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2',
    edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z',
    logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
    check: 'M20 6L9 17l-5-5',
    x: 'M18 6L6 18M6 6l12 12',
    info: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4M12 8h.01',
    chart: 'M18 20V10M12 20V4M6 20v-6',
    wand: 'M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M15 9h.01M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5',
    eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z',
    eyeOff: 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22',
    plus: 'M12 5v14M5 12h14',
    key: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.78 7.78 5.5 5.5 0 017.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4',
    folder: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
    download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
    settings: 'M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2zM12 8a4 4 0 100 8 4 4 0 000-8z',
    moon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
    sun: 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14 7 7 0 000-14z',
    warning: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
    'book-open': 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
    'check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
    'arrow-left': 'M19 12H5 M12 19l-7-7 7-7',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={d[name] || ''} />
    </svg>
  );
};

// ═══ Toast ═══
let tId = 0;
function useToast() {
  const [ts, setTs] = useState([]);
  const show = useCallback((m) => {
    const id = ++tId;
    setTs(p => [...p, { id, m }]);
    setTimeout(() => setTs(p => p.filter(t => t.id !== id)), 2500);
  }, []);
  return { ts, show };
}
const Snackbar = ({ ts }) => (
  <div className="snackbar-area">{ts.map(t => <div key={t.id} className="snackbar">{t.m}</div>)}</div>
);

// ═══ API ═══
const api = {
  get: (u) => fetch(u),
  post: (u, b) => fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }),
  postForm: (u, f) => fetch(u, { method: 'POST', body: f }),
  put: (u, b) => fetch(u, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }),
  del: (u) => fetch(u, { method: 'DELETE' }),
};

const LAO: Record<string, string> = { A: 'ກ', B: 'ຂ', C: 'ຄ', D: 'ງ' };

const MODELS = [
  // ─── Google Gemini ───
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', desc: '\u0ec4\u0ea7 \u0ec1\u0ea5\u0eb0 \u0e9b\u0eb0\u0ea2\u0eb1\u0e94 (\u0ec1\u0e99\u0eb0\u0e99\u0eb3)', badge: 'Gemini' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini', desc: '\u0e9b\u0eb0\u0eaa\u0eb4\u0e94\u0e97\u0eb4\u0e9e\u0eb2\u0e9a\u0eaa\u0eb9\u0e87 & \u0ea7\u0ebd\u0e81\u0e8a\u0eb1\u0e9a\u0e8a\u0ec9\u0ead\u0e99', badge: 'Gemini' },
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', provider: 'gemini', desc: '\u0ec3\u0eab\u0ea1\u0ec8\u0ea5\u0ec8\u0eb2\u0eaa\u0eb8\u0e94! \u0eaa\u0eb0\u0eab\u0ebc\u0eb2\u0e94 \u0ec1\u0ea5\u0eb0 \u0e9c\u0eb0\u0ea5\u0e97\u0ee4\u0e94\u0e94\u0eb5\u0ec0\u0ea5\u0eb5\u0e94', badge: 'Gemini' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'gemini', desc: '\u0ec3\u0eab\u0ea1\u0ec8! \u0ec4\u0ea7 \u0e9e\u0ead\u0ec3\u0e88 \u0eaa\u0eb3\u0ea5\u0eb1\u0e9a\u0e87\u0eb2\u0e99\u0ec3\u0eab\u0e8d\u0ec8', badge: 'Gemini' },
  // ─── OpenAI ───
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', desc: '\u0ec2\u0ea1\u0ec0\u0e94\u0ea7\u0ead\u0eb0\u0ec0\u0e99\u0e81\u0e9b\u0eb0\u0eaa\u0ebb\u0e87 \u0e82\u0ead\u0e87 OpenAI', badge: 'OpenAI' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', desc: '\u0ec4\u0ea7 \u0ec1\u0ea5\u0eb0 \u0e82\u0eb0\u0edc\u0eb2\u0e94\u0e99\u0ec9\u0ead\u0e8d \u0e82\u0ead\u0e87 OpenAI', badge: 'OpenAI' },
  { id: 'gpt-5', name: 'GPT-5', provider: 'openai', desc: '\u0ec3\u0eab\u0ea1\u0ec8\u0ea5\u0ec8\u0eb2\u0eaa\u0eb8\u0e94! \u0ec1\u0e81\u0ec9\u0e9b\u0eb1\u0e8d\u0eab\u0eb2\u0ec4\u0e94\u0ec9\u0ec0\u0e81\u0ec8\u0e87\u0e97\u0eb5\u0ec8\u0eaa\u0eb8\u0e94', badge: 'OpenAI' },
  { id: 'gpt-5.5', name: 'GPT-5.5', provider: 'openai', desc: '\u0ec3\u0eab\u0ea1\u0ec8! \u0e81\u0eb2\u0e99\u0e84\u0eb4\u0e94\u0e9e\u0edd\u0e99\u0e97\u0eb2\u0e99\u0eb5\u0ec4\u0ea7\u0e97\u0eb5\u0ec8\u0eaa\u0eb8\u0e94', badge: 'OpenAI' },
  // ─── Anthropic Claude ───
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', desc: '\u0e84\u0eb4\u0e94\u0ea7\u0eb4\u0ec0\u0e84\u0eb2\u0eb0\u0e94\u0eb5\u0ec0\u0ea5\u0eb5\u0e94 \u0e82\u0ead\u0e87 Anthropic', badge: 'Claude' },
  { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', provider: 'anthropic', desc: '\u0ec3\u0eab\u0ea1\u0ec8! \u0ec0\u0e81\u0eb1\u0ec8\u0e87 \u0ec4\u0ea7 \u0e9c\u0eb0\u0ea5\u0e97\u0ee4\u0e94\u0e94\u0eb5', badge: 'Claude' },
  { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', provider: 'anthropic', desc: '\u0ec3\u0eab\u0ea1\u0ec8! \u0ec0\u0e81\u0eb1\u0ec8\u0e87\u0e97\u0eb5\u0ec8\u0eaa\u0eb8\u0e94 \u0ea7\u0eb4\u0ec0\u0e84\u0eb2\u0eb0\u0e9c\u0eb0\u0ea5 \u0ec0\u0e81\u0eb1\u0ec8\u0e87\u0ec0\u0ea5\u0eb5\u0e94', badge: 'Claude' },
  { id: 'claude-opus-4-8', name: 'Claude Opus 4.8', provider: 'anthropic', desc: '\u0ec3\u0eab\u0ea1\u0ec8\u0ea5\u0ec8\u0eb2\u0eaa\u0eb8\u0e94! Adaptive Reasoning \u0eaa\u0eb0\u0eab\u0ebc\u0eb2\u0e94\u0e97\u0eb5\u0ec8\u0eaa\u0eb8\u0e94', badge: 'Claude' },
];

function ModelSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedModel = MODELS.find(m => m.id === value) || MODELS[0];

  const renderIcon = (provider, size = 18) => {
    if (provider === 'gemini') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <defs>
            <linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4285F4" />
              <stop offset="50%" stopColor="#9B72CB" />
              <stop offset="100%" stopColor="#D96570" />
            </linearGradient>
          </defs>
          <path d="M12 2C12 2 12.5 7.5 17.5 7.5C12.5 7.5 12 13 12 13C12 13 11.5 7.5 6.5 7.5C11.5 7.5 12 2 12 2Z" fill="url(#gemini-grad)" />
          <path d="M17 13C17 13 17.3 16.5 20.5 16.5C17.3 16.5 17 20 17 20C17 20 16.7 16.5 13.5 16.5C16.7 16.5 17 13 17 13Z" fill="url(#gemini-grad)" />
        </svg>
      );
    }
    if (provider === 'openai') {
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" style={{ color: '#10a37f', flexShrink: 0 }}>
          <path d="M14.949 6.547a3.94 3.94 0 0 0-.348-3.273 4.11 4.11 0 0 0-4.4-1.934A4.1 4.1 0 0 0 8.423.2 4.15 4.15 0 0 0 6.305.086a4.1 4.1 0 0 0-1.891.948 4.04 4.04 0 0 0-1.158 1.753 4.1 4.1 0 0 0-1.563.679A4 4 0 0 0 .554 4.72a3.99 3.99 0 0 0 .502 4.731 3.94 3.94 0 0 0 .346 3.274 4.11 4.11 0 0 0 4.402 1.933c.382.425.852.764 1.377.995.526.231 1.095.35 1.67.346 1.78.002 3.358-1.132 3.901-2.804a4.1 4.1 0 0 0 1.563-.68 4 4 0 0 0 1.14-1.253 3.99 3.99 0 0 0-.506-4.716m-6.097 8.406a3.05 3.05 0 0 1-1.945-.694l.096-.054 3.23-1.838a.53.53 0 0 0 .265-.455v-4.49l1.366.778q.02.011.025.035v3.722c-.003 1.653-1.361 2.992-3.037 2.996m-6.53-2.75a2.95 2.95 0 0 1-.36-2.01l.095.057L5.29 12.09a.53.53 0 0 0 .527 0l3.949-2.246v1.555a.05.05 0 0 1-.022.041L6.473 13.3c-1.454.826-3.311.335-4.15-1.098m-.85-6.94A3.02 3.02 0 0 1 3.07 3.949v3.785a.51.51 0 0 0 .262.451l3.93 2.237-1.366.779a.05.05 0 0 1-.048 0L2.585 9.342a2.98 2.98 0 0 1-1.113-4.094zm11.216 2.571L8.747 5.576l1.362-.776a.05.05 0 0 1 .048 0l3.265 1.86a3 3 0 0 1 1.173 1.207 2.96 2.96 0 0 1-.27 3.2 3.05 3.05 0 0 1-1.36.997V8.279a.52.52 0 0 0-.276-.445m1.36-2.015-.097-.057-3.226-1.855a.53.53 0 0 0-.53 0L6.249 6.153V4.598a.04.04 0 0 1 .019-.04L9.533 2.7a3.07 3.07 0 0 1 3.257.139c.474.325.843.778 1.066 1.303.223.526.289 1.103.191 1.664zM5.503 8.575 4.139 7.8a.05.05 0 0 1-.026-.037V4.049c0-.57.166-1.127.476-1.607s.752-.864 1.275-1.105a3.08 3.08 0 0 1 3.086 0z" fill="currentColor" />
        </svg>
      );
    }
    if (provider === 'anthropic') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ color: '#D97752', flexShrink: 0 }}>
          <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="custom-dropdown-container" ref={containerRef}>
      <button 
        type="button" 
        className="custom-dropdown-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-dropdown-value">
          {renderIcon(selectedModel.provider, 20)}
          <span>{selectedModel.name}</span>
        </span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 16 16" 
          fill="currentColor"
          style={{ 
            transition: 'transform var(--motion-std)', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--md-outline)' 
          }}
        >
          <path d="M8 11L3 6h10z" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="custom-dropdown-menu" role="listbox">
          {MODELS.map(m => {
            const isSel = m.id === value;
            return (
              <div 
                key={m.id} 
                className={`custom-dropdown-item ${isSel ? 'selected' : ''}`}
                role="option"
                aria-selected={isSel}
                onClick={() => {
                  onChange(m.id);
                  setIsOpen(false);
                }}
              >
                <div className="custom-dropdown-item-left">
                  {renderIcon(m.provider, 18)}
                  <div className="custom-dropdown-item-text">
                    <span className="custom-dropdown-item-title">
                      {m.name}
                      <span className="custom-dropdown-item-badge">{m.badge}</span>
                    </span>
                    <span className="custom-dropdown-item-desc">{m.desc}</span>
                  </div>
                </div>
                {isSel && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══ APP ═══
export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });

  const [sources, setSources] = useState([]);
  const [selSrcIds, setSelSrcIds] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [systemPrompts, setSystemPrompts] = useState(['default']);

  const [cfg, setCfg] = useState({
    numQ: 10, diff: 'medium', type: 'multiple_choice',
    lang: 'lao', custom: '', shuffle: false, model: 'gemini-2.5-flash', systemPrompt: 'default'
  });
  const [dottedLines, setDottedLines] = useState(3);
  const [previewSubjInstructions, setPreviewSubjInstructions] = useState('ຈົ່ງຕອບຄຳຖາມລຸ່ມນີ້ໃສ່ບ່ອນວ່າງ:');
  const [genLoading, setGenLoading] = useState(false);
  const [showExp, setShowExp] = useState(true);

  const [view, setView] = useState('test');
  const [uploading, setUploading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [configOpen, setConfigOpen] = useState(false);

  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);
  const [rangeDialogFile, setRangeDialogFile] = useState(null);
  const [rangeDialogPages, setRangeDialogPages] = useState(0);
  const [rangeDialogStart, setRangeDialogStart] = useState(1);
  const [rangeDialogEnd, setRangeDialogEnd] = useState(1);

  const [previewSchool, setPreviewSchool] = useState('ໂຮງຮຽນ ມັດທະຍົມສົມບູນ...');
  const [previewSubject, setPreviewSubject] = useState('ວິຊາ: ບົດຮຽນທົ່ວໄປ');
  const [previewMotto, setPreviewMotto] = useState('ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ\nສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນາຖາວອນ\n------000-------');
  const [previewExamNo, setPreviewExamNo] = useState('........');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewTime, setPreviewTime] = useState('90');
  const [previewSection, setPreviewSection] = useState('I. ພາກປາລະໄນ');
  const [previewInstructions, setPreviewInstructions] = useState('ຈົ່ງເລືອກເອົາຂໍ້ທີ່ຖືກຕ້ອງທີ່ສຸດພຽງຂໍ້ດຽວຈາກຄຳຖາມລຸ່ມນີ້:');
  const [previewTotalScore, setPreviewTotalScore] = useState(10);

  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [colorTheme, setColorTheme] = useState(() => localStorage.getItem('colorTheme') || 'purple');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color', colorTheme);
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

  const { ts, show } = useToast();
  const fileRef = useRef(null);

  const [dialog, setDialog] = useState(null); // { type: 'alert' | 'confirm', title: '', message: '', onConfirm: () => void, onCancel?: () => void }

  const showAlert = (message, title = 'ແຈ້ງເຕືອນ') => {
    setDialog({ type: 'alert', title, message, onConfirm: () => {} });
  };

  const showConfirm = (message, onConfirm, title = 'ຢືນຢັນ') => {
    setDialog({ type: 'confirm', title, message, onConfirm });
  };

  useEffect(() => { checkAuth(); }, []);

  // ─── Auth ───
  const checkAuth = async () => {
    try {
      const r = await api.get('/api/auth/me');
      const d = await r.json();
      if (r.ok && d.logged_in) {
        setUser({ username: d.username, isGuest: d.is_guest, profile_pic: d.profile_pic });
        loadSources(); loadStats(); restoreLastTest(); loadSystemPrompts();
      }
    } catch (e) { console.error(e); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const ep = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const r = await api.post(ep, authForm);
      const d = await r.json();
      if (r.ok) {
        setUser({ username: d.username, isGuest: d.is_guest || false, profile_pic: d.profile_pic });
        setAuthForm({ username: '', password: '' });
        loadSources(); loadStats(); restoreLastTest(); loadSystemPrompts();
        show(authMode === 'login' ? 'ເຂົ້າລະບົບສຳເລັດ' : 'ລົງທະບຽນສຳເລັດ');
      } else showAlert(d.error);
    } catch { showAlert('ເກີດຂໍ້ຜິດພາດ'); }
  };

  const handleGuest = async () => {
    try {
      const r = await api.post('/api/auth/guest', {});
      const d = await r.json();
        if (r.ok) { setUser({ username: d.username, isGuest: true, profile_pic: d.profile_pic }); loadSources(); loadStats(); loadSystemPrompts(); show('ເຂົ້າໃຊ້ໃນໂໝດທົດລອງ'); }
    } catch { showAlert('ເກີດຂໍ້ຜິດພາດ'); }
  };

  const handleLogout = async () => {
    await api.post('/api/auth/logout', {});
    localStorage.removeItem('last_test_id');
    setUser(null); setSources([]); setStats(null); setActiveTest(null); setSelSrcIds([]);
  };

  // ─── Data ───
  const loadSources = async () => { try { const r = await api.get('/api/sources'); if (r.ok) setSources(await r.json()); } catch {} };
  const loadStats = async () => { try { const r = await api.get('/api/dashboard/stats'); if (r.ok) setStats(await r.json()); } catch {} };
  const loadSystemPrompts = async () => { try { const r = await api.get('/api/system-prompts'); if (r.ok) setSystemPrompts(await r.json()); } catch {} };

  const loadTest = async (testId) => {
    try {
      const r = await api.get(`/api/tests/${testId}`);
      if (r.ok) {
        const t = await r.json();
        setActiveTest(t);
        setPreviewTitle(t.title);
        localStorage.setItem('last_test_id', testId);
        setView('test');
      }
    } catch {}
  };

  // Restore last active test after login
  const restoreLastTest = async () => {
    const lastId = localStorage.getItem('last_test_id');
    if (lastId) await loadTest(parseInt(lastId));
  };

  const toggleSourceSelect = (id) => {
    setSelSrcIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      const selectedNames = sources.filter(s => next.includes(s.id)).map(s => s.filename).join(', ');
      if (next.length > 0) {
        show(`ເລືອກ: ${selectedNames}`);
      } else {
        show('ຍົກເລີກການເລືອກທັງໝົດ');
      }
      return next;
    });
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const nameLower = file.name.toLowerCase();
    const isPdf = nameLower.endsWith('.pdf');
    const isDocx = nameLower.endsWith('.docx');
    const isImage = nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.png');

    if (!isPdf && !isDocx && !isImage) {
      showAlert('ຮອງຮັບສະເພາະໄຟລ໌ PDF, DOCX ແລະ ຮູບພາບເທົ່ານັ້ນ');
      return;
    }

    if (isPdf) {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      try {
        const r = await api.postForm('/api/sources/upload/info', fd);
        const d = await r.json();
        if (r.ok && d.is_pdf) {
          setRangeDialogFile(file);
          setRangeDialogPages(d.total_pages);
          setRangeDialogStart(1);
          setRangeDialogEnd(d.total_pages);
          setRangeDialogOpen(true);
        } else {
          showAlert(d.error || 'ບໍ່ສາມາດອ່ານຂໍ້ມູນ PDF ໄດ້');
        }
      } catch {
        showAlert('ເກີດຂໍ້ຜິດພາດໃນການກວດສອບ PDF');
      } finally {
        setUploading(false);
      }
    } else {
      await performUpload(file);
    }
  };

  const performUpload = async (file, pageStart = null, pageEnd = null) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    if (pageStart !== null) fd.append('page_start', pageStart);
    if (pageEnd !== null) fd.append('page_end', pageEnd);

    try {
      const r = await api.postForm('/api/sources/upload', fd);
      const d = await r.json();
      if (r.ok) {
        show('ອັບໂຫລດສຳເລັດ');
        await loadSources();
        setSelSrcIds([d.id]);
        loadStats();
      } else {
        showAlert(d.error);
      }
    } catch {
      showAlert('ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫລດ');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const deleteSource = (id) => {
    showConfirm('ລົບໄຟລ໌ນີ້?', async () => {
      const r = await api.del(`/api/sources/${id}`);
      if (r.ok) { setSelSrcIds(prev => prev.filter(x => x !== id)); loadSources(); loadStats(); show('ລົບແລ້ວ'); }
    });
  };

  // ─── Quiz ───
  const generateTest = async () => {
    if (selSrcIds.length === 0) { show('ເລືອກໄຟລ໌ກ່ອນ'); return; }
    
    setGenLoading(true); setConfigOpen(false);
    try {
      const key = localStorage.getItem('gemini_api_key') || '';
      const openai_key = localStorage.getItem('openai_api_key') || '';
      const anthropic_key = localStorage.getItem('anthropic_api_key') || '';
      const r = await api.post('/api/tests/generate', {
        source_id: selSrcIds[0],
        source_ids: selSrcIds,
        num_questions: cfg.numQ, difficulty: cfg.diff,
        question_type: cfg.type, custom_instructions: cfg.custom,
        language: cfg.lang, shuffle_options: cfg.shuffle, 
        model: cfg.model || 'gemini-2.5-flash',
        system_prompt: cfg.systemPrompt || 'default',
        api_keys: { gemini: key, openai: openai_key, anthropic: anthropic_key }
      });
      const d = await r.json();
      if (r.ok) { setActiveTest(d); loadStats(); show('ສ້າງບົດສອບເສັງສຳເລັດ!'); }
      else showAlert(d.error);
    } catch { showAlert('ເກີດຂໍ້ຜິດພາດໃນການສ້າງບົດສອບເສັງ'); }
    setGenLoading(false);
  };

  const updateQ = async (id, data) => {
    const r = await api.put(`/api/questions/${id}`, data);
    if (r.ok && activeTest) {
      setActiveTest(p => ({ ...p, questions: p.questions.map(q => q.id === id ? { ...q, ...data } : q) }));
      setEditModal(null); show('ແກ້ໄຂແລ້ວ'); loadStats();
    }
  };

  const deleteQ = (id) => {
    showConfirm('ລົບຄຳຖາມນີ້?', async () => {
      const r = await api.del(`/api/questions/${id}`);
      if (r.ok && activeTest) {
        setActiveTest(p => ({ ...p, questions: p.questions.filter(q => q.id !== id) }));
        show('ລົບແລ້ວ'); loadStats();
      }
    });
  };

  const convertToRichDoc = async () => {
    if (!activeTest) return;
    showConfirm('ຕ້ອງການປ່ຽນເປັນເອກະສານທົ່ວໄປບໍ? (ຈະບໍ່ສາມາດສັບປ່ຽນຂໍ້ສອບ ຫຼື ສ້າງຄຳຕອບອັດຕະໂນມັດໄດ້ອີກ)', async () => {
      const html = `
        <div style="text-align: center; font-size: 14px; margin-bottom: 24px; line-height: 1.4; font-family: 'Times New Roman', serif;">
          ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ<br/>
          ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນາຖາວອນ<br/>
          ------000-------
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
          <div style="flex: 1;">ໂຮງຮຽນ: ${previewSchool}</div>
          <div>ເລກທີ: ........</div>
        </div>
        <div style="text-align: center; font-size: 18px; margin-bottom: 16px; margin-top: 16px; font-weight: bold;">
          ຫົວບົດສອບເສັງ: ${activeTest.title}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
          <div style="flex: 1;">ວິຊາ: ${previewSubject}</div>
          <div>ເວລາ: 90 ນາທີ</div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <tbody>
            <tr>
              <td style="border: 1px solid #49454F; padding: 8px; vertical-align: top; width: 45%; line-height: 1.8;">
                <div>ຊື່ ແລະ ນາມສະກຸນ: ....................................................</div>
                <div>ຫ້ອງ: ....................................................</div>
                <div>ວັນທີ: ....................................................</div>
                <div>ເລກໂຕະ: ....................................................</div>
              </td>
              <td style="border: 1px solid #49454F; padding: 8px; vertical-align: top; width: 15%; text-align: center;">
                <div style="margin-bottom: 40px;">ຄະແນນ</div>
              </td>
              <td style="border: 1px solid #49454F; padding: 8px; vertical-align: top; width: 20%; text-align: center;">
                <div style="margin-bottom: 40px;">ຄຳເຫັນຂອງຄູ</div>
              </td>
              <td style="border: 1px solid #49454F; padding: 8px; vertical-align: top; width: 20%; text-align: center;">
                <div style="margin-bottom: 40px;">ລາຍເຊັນຄູອາຈານ</div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div style="font-size: 14px; margin-bottom: 28px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>I. ພາກປາລະໄນ</span>
            <span>ຄະແນນພາກປາລະໄນ ....................</span>
          </div>
          <div style="margin-top: 8px;">
            ຈົ່ງເລືອກເອົາຂໍ້ທີ່ຖືກຕ້ອງທີ່ສຸດພຽງຂໍ້ດຽວຈາກຄຳຖາມລຸ່ມນີ້: (ຂໍ້ລະ ${(10/activeTest.questions.length).toFixed(2)})
          </div>
        </div>

        ${activeTest.questions.map((q, i) => `
          <div style="margin-bottom: 16px;">
            <div style="font-weight: bold; margin-bottom: 8px;">ຂໍ້ ${i+1}. ${q.question_text}</div>
            <table style="width: 100%; border: none; margin-left: 20px;">
              <tr>
                <td style="width: 50%; padding-bottom: 4px;">ກ. ${q.option_a}</td>
                <td style="width: 50%; padding-bottom: 4px;">ຂ. ${q.option_b}</td>
              </tr>
              <tr>
                <td style="width: 50%;">ຄ. ${q.option_c}</td>
                <td style="width: 50%;">ງ. ${q.option_d}</td>
              </tr>
            </table>
          </div>
        `).join('')}
      `;
      try {
        const r = await api.put(`/api/tests/${activeTest.id}/rich_text`, { rich_text_content: html });
        if (r.ok) {
          setActiveTest(p => ({ ...p, rich_text_content: html }));
          show('ປ່ຽນເປັນເອກະສານສຳເລັດ');
        }
      } catch { showAlert('ເກີດຂໍ້ຜິດພາດ'); }
    });
  };

  const addQ = async (data) => {
    if (!activeTest) return;
    const r = await api.post('/api/questions', { test_id: activeTest.id, ...data });
    const d = await r.json();
    if (r.ok) {
      setActiveTest(p => ({ ...p, questions: [...p.questions, { id: d.id, ...data }] }));
      setEditModal(null); show('ເພີ່ມແລ້ວ'); loadStats();
    }
  };

  const deleteTest = () => {
    if (!activeTest) return;
    showConfirm('ລົບບົດສອບເສັງ ແລະ ຄຳຖາມທັງໝົດ?', async () => {
      const r = await api.del(`/api/tests/${activeTest.id}`);
      if (r.ok) {
        setActiveTest(null);
        loadStats();
        show('ລົບບົດສອບເສັງແລ້ວ');
      }
    });
  };

  const selSources = sources.filter(s => selSrcIds.includes(s.id));

  // ═══ AUTH ═══
  if (!user) return (
    <div className="auth-scrim">
      <div className="auth-panel animate-in">
        <div className="auth-icon"><I name="zap" size={36} /></div>
        <h1>Test LM</h1>
        <p className="auth-sub">ລະບົບສ້າງບົດສອບເສັງອັດສະລິຍະ</p>
        <div className="auth-toggle">
          <button className={`auth-toggle-btn ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>ເຂົ້າລະບົບ</button>
          <button className={`auth-toggle-btn ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>ລົງທະບຽນ</button>
        </div>
        <form onSubmit={handleAuth}>
          <div className="md-field"><label>ຊື່ຜູ້ໃຊ້</label><input className="md-input" required placeholder="ຊື່ຜູ້ໃຊ້" value={authForm.username} onChange={e => setAuthForm(p => ({ ...p, username: e.target.value }))} /></div>
          <div className="md-field"><label>ລະຫັດຜ່ານ</label><input className="md-input" type="password" required placeholder="ລະຫັດຜ່ານ" value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} /></div>
          <button type="submit" className="md-btn-filled">{authMode === 'login' ? 'ເຂົ້າລະບົບ' : 'ສ້າງບັນຊີ'}</button>
        </form>
        <div className="md-divider">ຫຼື</div>
        <button className="md-btn-tonal" onClick={handleGuest}>ທົດລອງໃຊ້ (ຜູ້ເຂົ້າຊົມ)</button>
        <p className="auth-note">ຜູ້ໃຊ້ທົດລອງ ໃຊ້ຖານຂໍ້ມູນຮ່ວມ</p>
      </div>
      <Snackbar ts={ts} />
    </div>
  );

  // ═══ MAIN ═══
  return (
    <div className="app-shell">
      {/* ═══ Sources Sidebar ═══ */}
      <aside className="sources-sidebar">
        <div className="sb-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="sb-logo">
            <div className="sb-logo-icon"><I name="zap" size={18} /></div>
            <span className="sb-logo-text">Test LM</span>
          </div>
          <a href="https://github.com/idea90/test-lm" target="_blank" rel="noopener noreferrer" className="github-link" title="GitHub Repository">
            <I name="github" size={20} />
          </a>
        </div>

        {/* Upload */}
        <div className="sb-upload"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag'); }}
          onDragLeave={e => e.currentTarget.classList.remove('drag')}
          onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag'); if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]); }}
        >
          <input ref={fileRef} type="file" accept=".pdf,.docx,.jpg,.jpeg,.png" hidden onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
          {uploading ? <div className="md-spinner" /> : <>
            <I name="upload" size={16} />
            <span>ອັບໂຫລດໄຟລ໌ບົດຮຽນ</span>
          </>}
        </div>

        <div className="sb-label">ແຫຼ່ງຂໍ້ມູນ <span className="sb-count">{sources.length}</span></div>

        {/* Source list */}
        <div className="sb-list">
          {sources.length === 0 && (
            <div className="sb-empty">
              <I name="folder" size={24} />
              <p>ອັບໂຫລດໄຟລ໌ບົດຮຽນເພື່ອເລີ່ມ</p>
            </div>
          )}
          {sources.map(s => {
            const isSelected = selSrcIds.includes(s.id);
            return (
              <div key={s.id} className={`sb-item ${isSelected ? 'active' : ''}`} onClick={() => toggleSourceSelect(s.id)}>
                <input 
                  type="checkbox" 
                  checked={isSelected} 
                  readOnly 
                  style={{ cursor: 'pointer', width: 16, height: 16, accentColor: 'var(--md-primary)', marginRight: 2 }}
                />
                <div className="sb-item-icon"><I name="file" size={14} /></div>
                <div className="sb-item-info">
                  <div className="sb-item-name" title={s.filename}>{s.filename}</div>
                  <div className="sb-item-meta">{(s.file_size / 1024).toFixed(1)} KB</div>
                </div>
                <button className="sb-item-del" onClick={e => { e.stopPropagation(); deleteSource(s.id); }}><I name="trash" size={12} /></button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sb-footer" style={{ display: 'flex', alignItems: 'center', padding: '12px', borderTop: '1px solid var(--md-outline-variant)' }}>
          <button className="icon-btn" onClick={() => setSettingsOpen(true)} title="ຕັ້ງຄ່າທົ່ວໄປ"><I name="settings" size={16} /></button>
          <div className="sb-user" onClick={() => setProfileOpen(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }} title="ຕັ້ງຄ່າບັນຊີ">
            {user.profile_pic ? (
              <img src={user.profile_pic} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--md-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="sb-user-name" style={{ lineHeight: '1.2' }}>{user.username}</span>
              {user.isGuest && <span className="sb-guest" style={{ fontSize: 10 }}>ທົດລອງ</span>}
            </div>
          </div>
          <button className="icon-btn" onClick={handleLogout} title="ອອກ"><I name="logout" size={16} /></button>
        </div>
      </aside>

      {/* ═══ Main Center ═══ */}
      <main className="center-area">
        {/* Top toolbar */}
        <div className="toolbar">
          <div className="toolbar-tabs">
            <button className={`toolbar-tab ${view === 'test' ? 'active' : ''}`} onClick={() => setView('test')}>
              <I name="file" size={16} /> ປຶ້ມບົດສອບເສັງ
            </button>
            <button className={`toolbar-tab ${view === 'stats' ? 'active' : ''}`} onClick={() => { setView('stats'); loadStats(); }}>
              <I name="chart" size={16} /> ສະຖິຕິ
            </button>
          </div>

          <div className="toolbar-actions">
            {view === 'test' && (
              <>
                <button className="toolbar-chip" onClick={() => setConfigOpen(true)}>
                  <I name="settings" size={14} /> ຕັ້ງຄ່າ
                </button>
                <button className="toolbar-generate" disabled={genLoading || selSrcIds.length === 0} onClick={generateTest}>
                  {genLoading ? <><div className="md-spinner on-primary" style={{ width: 16, height: 16 }} /> ກຳລັງສ້າງ...</> : <><I name="wand" size={16} /> ສ້າງບົດສອບເສັງ</>}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Test View: Center Preview ── */}
        {view === 'test' && (
          <div className="center-scroll">
            {activeTest ? (
              <div className="preview-wrapper animate-up">
                {/* Action row above the sheet */}
                <div className="preview-action-row">
                  <div>
                    <div className="preview-title">{activeTest.title}</div>
                    <div className="preview-sub">{activeTest.questions.length} ຄຳຖາມ · {cfg.diff === 'easy' ? 'ງ່າຍ' : cfg.diff === 'medium' ? 'ປານກາງ' : 'ຍາກ'}</div>
                  </div>
                  <div className="preview-btns">

                    {!activeTest.rich_text_content && (
                      <button className="icon-btn" onClick={() => setShowExp(p => !p)} title="ສະແດງ/ເຊື່ອງຄຳຕອບ"><I name={showExp ? 'eyeOff' : 'eye'} size={16} /></button>
                    )}
                    {!activeTest.rich_text_content && (
                      <button className="icon-btn" onClick={() => setEditModal({ mode: 'add', qType: 'obj', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: '' })} title="ເພີ່ມ"><I name="plus" size={16} /></button>
                    )}
                    <button className="icon-btn" onClick={deleteTest} title="ລົບບົດສອບເສັງ" style={{ color: 'var(--md-error)' }}><I name="trash" size={16} /></button>

                    {!activeTest.rich_text_content && (
                      <button className="toolbar-chip" onClick={() => setDottedLines(p => p === 0 ? 3 : p === 3 ? 5 : 0)}>
                        ເສັ້ນຂຽນ: {dottedLines === 0 ? 'ປິດ' : `${dottedLines} ແຖວ`}
                      </button>
                    )}
                    {!activeTest.rich_text_content && (
                      <button className="toolbar-chip" onClick={convertToRichDoc}>
                        <I name="edit" size={14} /> ປ່ຽນເປັນເອກະສານ
                      </button>
                    )}
                    {!activeTest.rich_text_content && (
                      <button className="toolbar-chip" onClick={() => { show('ດາວໂຫລດ Word...'); window.location.href = `/api/tests/${activeTest.id}/export/docx`; }}>
                        <I name="download" size={14} /> ສົ່ງອອກ Word
                      </button>
                    )}
                  </div>
                </div>

                {/* The exam paper */}
                {activeTest.rich_text_content ? (
                  <div className="exam-paper" style={{ padding: 0 }}>
                    <div className="rich-toolbar" contentEditable={false}>
                      <button onClick={() => document.execCommand('bold')}>B</button>
                      <button onClick={() => document.execCommand('italic')}>I</button>
                      <button onClick={() => document.execCommand('underline')}>U</button>
                      <button onClick={() => {
                        const url = prompt('Image URL or Base64 (ສາມາດ paste ໃສ່ຮູບໂດຍກົງໄດ້):');
                        if (url) document.execCommand('insertImage', false, url);
                      }}><I name="plus" size={14} style={{display:'inline-block', verticalAlign:'middle'}}/> ໃສ່ຮູບ</button>
                      <div style={{flex: 1}} />
                      <button className="md-btn-filled" style={{border:'none', color:'#fff', background:'var(--md-primary)'}} onClick={async () => {
                        const html = document.getElementById('rich-editor').innerHTML;
                        await api.put(`/api/tests/${activeTest.id}/rich_text`, { rich_text_content: html });
                        show('ບັນທຶກເອກະສານສຳເລັດ');
                      }}>ບັນທຶກ</button>
                    </div>
                    <div 
                      id="rich-editor"
                      className="rich-editor-content"
                      contentEditable={true} 
                      suppressContentEditableWarning={true}
                      dangerouslySetInnerHTML={{ __html: activeTest.rich_text_content }}
                    />
                  </div>
                ) : (
                  <div className="exam-paper">
                    <div className="exam-paper-header-official">

                      {/* Editable Motto */}
                      <div className="lao-motto">
                        <textarea
                          className="inline-input"
                          defaultValue={previewMotto}
                          onBlur={e => setPreviewMotto(e.target.value)}
                          rows={3}
                          style={{ width: '100%', textAlign: 'center', resize: 'none', fontSize: '14px', fontFamily: "'Times New Roman', serif", lineHeight: 1.4 }}
                        />
                      </div>

                      <div className="school-row">
                        <div style={{ flex: 1 }}>ໂຮງຮຽນ: <input className="inline-input" defaultValue={previewSchool} onBlur={e => setPreviewSchool(e.target.value)} style={{ width: '180px' }} /></div>
                        <div>ເລກທີ: <input className="inline-input" defaultValue={previewExamNo} onBlur={e => setPreviewExamNo(e.target.value)} style={{ width: '80px' }} /></div>
                      </div>

                      {/* Title */}
                      <div className="title-row">
                        <strong>ຫົວບົດສອບເສັງ: <input
                          className="inline-input"
                          style={{ width: '300px', fontWeight: 'bold', fontSize: '16px' }}
                          defaultValue={previewTitle || activeTest.title}
                          onBlur={e => setPreviewTitle(e.target.value)}
                        /></strong>
                      </div>

                      <div className="subject-time-row">
                        <div style={{ flex: 1 }}>ວິຊາ: <input className="inline-input" defaultValue={previewSubject} onBlur={e => setPreviewSubject(e.target.value)} style={{ width: '180px' }} /></div>
                        <div>ເວລາ: <input className="inline-input" defaultValue={previewTime} onBlur={e => setPreviewTime(e.target.value)} style={{ width: '50px', textAlign: 'center' }} /> ນາທີ</div>
                      </div>

                      {/* Student table — labels editable */}
                      <table className="student-info-table">
                        <tbody>
                          <tr>
                            <td className="student-details-cell">
                              <div>ຊື່ ແລະ ນາມສະກຸນ: ....................................................</div>
                              <div>ຫ້ອງ: ....................................................</div>
                              <div>ວັນທີ: ....................................................</div>
                              <div>ເລກໂຕະ: ....................................................</div>
                            </td>
                            <td className="score-cell"><div className="cell-title">ຄະແນນ</div></td>
                            <td className="teacher-comment-cell"><div className="cell-title">ຄຳເຫັນຂອງຄູ</div></td>
                            <td className="teacher-sign-cell"><div className="cell-title">ລາຍເຊັນຄູອາຈານ</div></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Split Questions */}
                    {(() => {
                        const objQs = activeTest.questions.filter(q => q.option_a || q.option_b || q.option_c || q.option_d);
                        const subjQs = activeTest.questions.filter(q => !q.option_a && !q.option_b && !q.option_c && !q.option_d);
                        let globalQIndex = 0;
                        return (
                          <>
                            {/* Objective Section */}
                            {objQs.length > 0 && (
                              <>
                                <div className="exam-instructions-official">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', alignItems: 'center' }}>
                                    <input className="inline-input" defaultValue={previewSection} onBlur={e => setPreviewSection(e.target.value)} style={{ fontWeight: 'bold', width: '200px' }} />
                                    <span>ຄະແນນພາກປາລະໄນ: <input className="inline-input" type="number" defaultValue={previewTotalScore} onBlur={e => setPreviewTotalScore(Number(e.target.value) || 0)} style={{ width: '50px', textAlign: 'center', fontWeight: 'bold' }} /> ຂໍ້</span>
                                  </div>
                                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                                    <textarea className="inline-input" defaultValue={previewInstructions} onBlur={e => setPreviewInstructions(e.target.value)} rows={2} style={{ flex: 1, resize: 'none', fontSize: '14px' }} />
                                    <span style={{ whiteSpace: 'nowrap' }}>(ຂໍ້ລະ {(previewTotalScore / objQs.length).toFixed(2)})</span>
                                  </div>
                                </div>
                                {objQs.map((q) => {
                                  const i = globalQIndex++;
                                  return (
                                    <div key={q.id} className="exam-question">
                                      <div className="exam-q-row">
                                        <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1, gap: 6 }}>
                                          <strong style={{ whiteSpace: 'nowrap', paddingTop: 2 }}>ຂໍ້ {i + 1}.</strong>
                                          <textarea className="inline-input" defaultValue={q.question_text} rows={2} style={{ flex: 1, resize: 'none', fontSize: '14px', fontWeight: 500 }} onBlur={async e => {
                                            const updated = { ...q, question_text: e.target.value };
                                            setActiveTest(p => ({ ...p, questions: p.questions.map(x => x.id === q.id ? updated : x) }));
                                            await api.put(`/api/questions/${q.id}`, updated);
                                          }} />
                                        </div>
                                        <div className="exam-q-actions">
                                          <button className="icon-btn sm" onClick={() => setEditModal({ mode: 'edit', qType: 'obj', id: q.id, ...q })}><I name="edit" size={13} /></button>
                                          <button className="icon-btn sm" onClick={() => deleteQ(q.id)}><I name="trash" size={13} /></button>
                                        </div>
                                      </div>
                                      <div className="exam-options-grid">
                                        {['A','B','C','D'].map(o => (
                                          <div key={o} className={`exam-opt ${showExp && q.correct_option === o ? 'correct' : ''}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                                            <span style={{ whiteSpace: 'nowrap', paddingTop: 2 }}>{LAO[o]}.</span>
                                            <textarea className="inline-input" defaultValue={q[`option_${o.toLowerCase()}`]} rows={1} style={{ flex: 1, resize: 'none', fontSize: '13px' }} onBlur={async e => {
                                              const updated = { ...q, [`option_${o.toLowerCase()}`]: e.target.value };
                                              setActiveTest(p => ({ ...p, questions: p.questions.map(x => x.id === q.id ? updated : x) }));
                                              await api.put(`/api/questions/${q.id}`, updated);
                                            }} />
                                          </div>
                                        ))}
                                      </div>
                                      {showExp && (
                                        <div className="exam-answer">
                                          <I name="check" size={13} /> ຄຳຕອບ: <strong>{LAO[q.correct_option]}</strong> — {q.explanation || '—'}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </>
                            )}
                            
                            {/* Subjective Section */}
                            {subjQs.length > 0 && (
                              <>
                                <div className="exam-instructions-official" style={{ marginTop: 24, borderTop: '2px solid #000', paddingTop: 16 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', alignItems: 'center' }}>
                                    <span>II. ພາກອັດຕະໄນ</span>
                                    <span>ຄະແນນພາກອັດຕະໄນ ....................</span>
                                  </div>
                                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                                    <textarea className="inline-input" defaultValue={previewSubjInstructions} onBlur={e => setPreviewSubjInstructions(e.target.value)} rows={2} style={{ flex: 1, resize: 'none', fontSize: '14px' }} />
                                  </div>
                                </div>
                                {subjQs.map((q) => {
                                  const i = globalQIndex++;
                                  return (
                                    <div key={q.id} className="exam-question">
                                      <div className="exam-q-row">
                                        <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1, gap: 6 }}>
                                          <strong style={{ whiteSpace: 'nowrap', paddingTop: 2 }}>ຂໍ້ {i + 1}.</strong>
                                          <textarea className="inline-input" defaultValue={q.question_text} rows={2} style={{ flex: 1, resize: 'none', fontSize: '14px', fontWeight: 500 }} onBlur={async e => {
                                            const updated = { ...q, question_text: e.target.value };
                                            setActiveTest(p => ({ ...p, questions: p.questions.map(x => x.id === q.id ? updated : x) }));
                                            await api.put(`/api/questions/${q.id}`, updated);
                                          }} />
                                        </div>
                                        <div className="exam-q-actions">
                                          <button className="icon-btn sm" onClick={() => setEditModal({ mode: 'edit', qType: 'subj', id: q.id, ...q })}><I name="edit" size={13} /></button>
                                          <button className="icon-btn sm" onClick={() => deleteQ(q.id)}><I name="trash" size={13} /></button>
                                        </div>
                                      </div>
                                      
                                      {/* Dotted Lines */}
                                      {dottedLines > 0 && (
                                        <div className="exam-dotted-lines">
                                          {Array.from({ length: dottedLines }).map((_, di) => (
                                            <div key={di} className="dotted-line" />
                                          ))}
                                        </div>
                                      )}
                                      
                                      {showExp && (
                                        <div className="exam-answer" style={{ marginTop: 12 }}>
                                          <I name="check" size={13} /> ຄຳຕອບ: {q.explanation || '—'}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </>
                            )}
                          </>
                        );
                      })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="center-empty animate-in" style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center' }}>
                <div className="center-empty-icon" style={{ background: 'linear-gradient(135deg, var(--md-primary), var(--md-tertiary))', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', width: '88px', height: '88px', margin: '0 auto 24px' }}>
                  <I name="book-open" size={40} />
                </div>
                <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px', background: 'linear-gradient(90deg, var(--md-primary), var(--md-tertiary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
                  ຍິນດີຕ້ອນຮັບສູ່ Test LM
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--md-on-surface-variant)', lineHeight: '1.7', marginBottom: '32px' }}>
                  ຜູ້ຊ່ວຍອັດສະລິຍະສຳລັບຄູອາຈານ. ປ່ຽນເອກະສານບົດຮຽນຂອງທ່ານໃຫ້ກາຍເປັນຊຸດບົດສອບເສັງທີ່ສົມບູນແບບ, ພ້ອມດ້ວຍຄຳສະເລີຍ ແລະ ຄຳອະທິບາຍ ພາຍໃນບໍ່ເທົ່າໃດວິນາທີ!
                </p>
                
                <div style={{ background: 'var(--md-surface-variant)', padding: '28px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  {selSources.length > 0 ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-primary)', fontWeight: '600', fontSize: '15px' }}>
                        <I name="check-circle" size={20} />
                        ເລືອກແລ້ວ {selSources.length} ໄຟລ໌: {selSources.map(s => s.filename).join(', ')}
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--md-on-surface-variant)', margin: 0 }}>ພ້ອມແລ້ວ! ກົດປຸ່ມ <strong style={{ color: 'var(--md-on-surface)' }}>"ສ້າງບົດສອບເສັງ"</strong> ຢູ່ແຖບດ້ານເທິງເພື່ອເລີ່ມຕົ້ນ.</p>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <I name="arrow-left" size={20} style={{ color: 'var(--md-primary)', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: '15px', color: 'var(--md-on-surface)', fontWeight: '600' }}>ເລືອກໄຟລ໌ບົດຮຽນຈາກແຖບດ້ານຊ້າຍມືເພື່ອເລີ່ມຕົ້ນ</span>
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--md-on-surface-variant)', margin: '-8px 0 0' }}>ຫຼື ອັບໂຫລດໄຟລ໌ໃໝ່ຂອງທ່ານເອງ:</span>
                      <button className="md-btn-tonal" style={{ padding: '0 28px', height: '44px', marginTop: '4px' }} onClick={() => fileRef.current?.click()}>
                        <I name="upload" size={18} /> ອັບໂຫລດໄຟລ໌ບົດຮຽນ
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Stats View ── */}
        {view === 'stats' && stats && (
          <div className="center-scroll">
            <div className="animate-up" style={{ maxWidth: 640, margin: '24px auto', padding: '0 16px' }}>
              <div className="dash-grid">
                {[
                  { icon: 'file', color: 'purple', label: 'ເອກະສານ', val: stats.total_sources },
                  { icon: 'zap', color: 'pink', label: 'ຊຸດຂໍ້ສອບ', val: stats.total_tests },
                  { icon: 'check', color: 'green', label: 'ຄຳຖາມ', val: stats.total_questions },
                ].map((c, i) => (
                  <div key={i} className="dash-card">
                    <div className={`dash-card-icon ${c.color}`}><I name={c.icon} size={20} /></div>
                    <div className="dash-card-value">{c.val}</div>
                    <div className="dash-card-label">{c.label}</div>
                  </div>
                ))}
              </div>
              <div className="recent-card">
                <div className="recent-card-header">ບົດສອບເສັງຫຼ້າສຸດ</div>
                {stats.recent_tests?.length > 0 ? stats.recent_tests.map((t, i) => (
                  <div key={i} className="recent-row" onClick={() => loadTest(t.id)} style={{ cursor: 'pointer' }}>
                    <div className="recent-row-info">
                      <div className="recent-row-icon"><I name="zap" size={14} /></div>
                      <div>
                        <div className="recent-row-name">{t.title}</div>
                        <div className="recent-row-sub">{t.source_filename || '—'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className={`md-chip ${t.difficulty}`}>{{ easy: 'ງ່າຍ', medium: 'ປານກາງ', hard: 'ຍາກ' }[t.difficulty]}</span>
                      <span className="md-chip" style={{ background: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)' }}>{t.num_questions} ຂໍ້</span>
                      <I name="arrowRight" size={14} style={{ color: 'var(--md-outline)' }} />
                    </div>
                  </div>
                )) : <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--md-outline)' }}>ຍັງບໍ່ມີ</div>}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══ CONFIG DIALOG ═══ */}
      {configOpen && (
        <div className="dialog-scrim" onClick={() => setConfigOpen(false)}>
          <div className="dialog-card" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">ຕັ້ງຄ່າບົດສອບເສັງ</div>
            <div className="dialog-body">
              <div className="config-field">
                <div className="config-field-label">ໂມເດວ AI</div>
                <ModelSelect value={cfg.model || 'gemini-2.5-flash'} onChange={val => setCfg(p => ({ ...p, model: val }))} />
              </div>
              <div className="config-field">
                <div className="config-field-label">ຄຳສັ່ງລະບົບ (System Prompt)</div>
                <select className="md-select" value={cfg.systemPrompt || 'default'} onChange={e => setCfg(p => ({ ...p, systemPrompt: e.target.value }))}>
                  {systemPrompts.map(sp => (
                    <option key={sp} value={sp}>{sp === 'default' ? 'ມາດຕະຖານ' : sp}</option>
                  ))}
                </select>
              </div>
              <div className="config-field">
                <div className="config-field-label"><span>ຈຳນວນ</span><span className="config-field-badge">{cfg.numQ} ຂໍ້</span></div>
                <input type="range" min="5" max="30" step="5" value={cfg.numQ} onChange={e => setCfg(p => ({ ...p, numQ: +e.target.value }))} />
              </div>
              <div className="config-field">
                <div className="config-field-label">ລະດັບ</div>
                <div className="segmented-group">
                  {[['easy','ງ່າຍ'],['medium','ປານກາງ'],['hard','ຍາກ']].map(([k, l]) => (
                    <button key={k} className={`segmented-btn ${cfg.diff === k ? 'active' : ''}`} onClick={() => setCfg(p => ({ ...p, diff: k }))}>
                      {cfg.diff === k && <I name="check" size={14} />} {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="config-field">
                <div className="config-field-label">ພາສາ</div>
                <select className="md-select" value={cfg.lang} onChange={e => setCfg(p => ({ ...p, lang: e.target.value }))}>
                  <option value="lao">ພາສາລາວ</option>
                  <option value="english">ພາສາອັງກິດ</option>
                  <option value="mixed">ປະສົມ</option>
                </select>
              </div>
              <div className="config-field">
                <div className="config-field-label">ຮູບແບບ</div>
                <select className="md-select" value={cfg.type} onChange={e => setCfg(p => ({ ...p, type: e.target.value }))}>
                  <option value="multiple_choice">ປາລະໄນ (ເລືອກຕອບ)</option>
                  <option value="true_false">ຖືກ / ຜິດ</option>
                  <option value="short_answer">ອັດຕະໄນ (ຂຽນຕອບ)</option>
                  <option value="mixed">ປະສົມ (ປາລະໄນ & ອັດຕະໄນ)</option>
                </select>
              </div>
              <div className="config-field">
                <div className="config-field-label">ຄຳສັ່ງເພີ່ມ</div>
                <textarea className="md-textarea" rows={2} placeholder="ເນັ້ນບົດທີ 3..." value={cfg.custom} onChange={e => setCfg(p => ({ ...p, custom: e.target.value }))} />
              </div>
              <label className="md-custom-checkbox-row">
                <input type="checkbox" className="md-custom-checkbox-input" checked={cfg.shuffle} onChange={e => setCfg(p => ({ ...p, shuffle: e.target.checked }))} />
                <div className="md-custom-checkbox-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                </div>
                <span>ສັບປ່ຽນລຳດັບ</span>
              </label>
            </div>
            <div className="dialog-actions">
              <button className="md-btn-text" onClick={() => setConfigOpen(false)}>ຍົກເລີກ</button>
              <button className="md-btn-text" onClick={() => { setConfigOpen(false); show('ບັນທຶກການຕັ້ງຄ່າແລ້ວ'); }}>ຕົກລົງ</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SETTINGS DIALOG ═══ */}
      {settingsOpen && (
        <div className="dialog-scrim" onClick={() => setSettingsOpen(false)}>
          <div className="dialog-card animate-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="dialog-header">ການຕັ້ງຄ່າ</div>
            <div className="dialog-body" style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Appearance Section */}
              <div>
                <h4 style={{ marginBottom: 12, color: 'var(--md-primary)', fontSize: 16 }}>ຮູບແບບ ແລະ ສີສັນ</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <span style={{ fontSize: 14 }}>ໂໝດໜ້າຈໍ:</span>
                  <button className="md-btn-tonal" onClick={() => setDark(d => !d)} style={{ padding: '6px 16px', height: 'auto', borderRadius: 'var(--shape-full)' }}>
                    <I name={dark ? 'moon' : 'sun'} size={16} style={{ marginRight: 6 }} /> 
                    {dark ? 'ໂໝດກາງຄືນ' : 'ໂໝດກາງເວັນ'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 14 }}>ສີຫຼັກ:</span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[
                      { id: 'purple', hex: '#6750A4' },
                      { id: 'blue', hex: '#0061A4' },
                      { id: 'green', hex: '#2E6B27' },
                      { id: 'rose', hex: '#9B4051' },
                      { id: 'orange', hex: '#8C5000' }
                    ].map(c => (
                      <button 
                        key={c.id}
                        onClick={() => setColorTheme(c.id)}
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: c.hex, border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: colorTheme === c.id ? '0 0 0 2px var(--md-surface), 0 0 0 4px var(--md-primary)' : 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        {colorTheme === c.id && <I name="check" size={16} style={{ color: '#fff' }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* API Keys Section */}
              <div style={{ borderTop: '1px solid var(--md-outline-variant)', paddingTop: 20 }}>
                <h4 style={{ marginBottom: 12, color: 'var(--md-primary)', fontSize: 16 }}>ລະຫັດ API ຂອງ AI</h4>
                <div className="md-field"><label>ລະຫັດ API ຂອງ Gemini</label><input className="md-input" type="password" id="api-key-in" placeholder="AIzaSy..." defaultValue={localStorage.getItem('gemini_api_key') || ''} /></div>
                <div className="md-field" style={{marginTop: 10}}><label>ລະຫັດ API ຂອງ OpenAI</label><input className="md-input" type="password" id="openai-key-in" placeholder="sk-..." defaultValue={localStorage.getItem('openai_api_key') || ''} /></div>
                <div className="md-field" style={{marginTop: 10}}><label>ລະຫັດ API ຂອງ Anthropic</label><input className="md-input" type="password" id="anthropic-key-in" placeholder="sk-ant-..." defaultValue={localStorage.getItem('anthropic_api_key') || ''} /></div>
                <p style={{ fontSize: 13, color: 'var(--md-outline)', marginTop: 10 }}>ໃສ່ Key ຂອງທ່ານ ຖ້າເຊີບເວີບໍ່ໄດ້ຕັ້ງ .env</p>
              </div>

            </div>
            <div className="dialog-actions" style={{ padding: '8px 24px 24px' }}>
              <button className="md-btn-text" onClick={() => setSettingsOpen(false)}>ປິດ</button>
              <button className="md-btn-filled" onClick={() => { 
                localStorage.setItem('gemini_api_key', (document.getElementById('api-key-in') as HTMLInputElement).value.trim()); 
                localStorage.setItem('openai_api_key', (document.getElementById('openai-key-in') as HTMLInputElement).value.trim()); 
                localStorage.setItem('anthropic_api_key', (document.getElementById('anthropic-key-in') as HTMLInputElement).value.trim()); 
                setSettingsOpen(false); show('ບັນທຶກແລ້ວ'); 
              }} style={{ width: 'auto', padding: '10px 24px', borderRadius: 'var(--shape-full)' }}>ບັນທຶກ</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT QUESTION DIALOG ═══ */}
      {editModal && (
        <div className="dialog-scrim" onClick={() => setEditModal(null)}>
          <div className="dialog-card" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">{editModal.mode === 'add' ? 'ເພີ່ມຄຳຖາມ' : 'ແກ້ໄຂ'}</div>
            <div className="dialog-body">
              <div className="md-field">
                <label>ປະເພດຄຳຖາມ</label>
                <select className="md-select" value={editModal.qType || 'obj'} onChange={e => setEditModal(p => ({ ...p, qType: e.target.value }))}>
                  <option value="obj">ປາລະໄນ</option>
                  <option value="subj">ອັດຕະໄນ</option>
                </select>
              </div>
              <div className="md-field"><label>ຄຳຖາມ</label><textarea className="md-textarea" rows={2} value={editModal.question_text} onChange={e => setEditModal(p => ({ ...p, question_text: e.target.value }))} /></div>
              
              {editModal.qType !== 'subj' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {['A','B','C','D'].map(o => (
                      <div key={o} className="md-field"><label>ຕົວເລືອກ {LAO[o]}</label><input className="md-input" value={editModal[`option_${o.toLowerCase()}`] || ''} onChange={e => setEditModal(p => ({ ...p, [`option_${o.toLowerCase()}`]: e.target.value }))} /></div>
                    ))}
                  </div>
                  <div className="md-field"><label>ຄຳຕອບທີ່ຖືກຕ້ອງ</label>
                    <select className="md-select" value={editModal.correct_option} onChange={e => setEditModal(p => ({ ...p, correct_option: e.target.value }))}>
                      {['A','B','C','D'].map(o => <option key={o} value={o}>{LAO[o]} ({o})</option>)}
                    </select>
                  </div>
                </>
              )}
              
              <div className="md-field"><label>{editModal.qType === 'subj' ? 'ຄຳຕອບ' : 'ຄຳອະທິບາຍ'}</label><textarea className="md-textarea" rows={2} value={editModal.explanation || ''} onChange={e => setEditModal(p => ({ ...p, explanation: e.target.value }))} /></div>
            </div>
            <div className="dialog-actions">
              <button className="md-btn-text" onClick={() => setEditModal(null)}>ຍົກເລີກ</button>
              <button className="md-btn-text" onClick={() => {
                let d: any = { question_text: editModal.question_text, explanation: editModal.explanation };
                if (editModal.qType === 'subj') {
                  d = { ...d, option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' };
                } else {
                  d = { ...d, option_a: editModal.option_a, option_b: editModal.option_b, option_c: editModal.option_c, option_d: editModal.option_d, correct_option: editModal.correct_option };
                }
                if (editModal.mode === 'add') {
                  addQ(d);
                } else {
                  updateQ(editModal.id, d);
                }
              }}>ບັນທຶກ</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PAGE RANGE DIALOG ═══ */}
      {rangeDialogOpen && (
        <div className="dialog-scrim" onClick={() => setRangeDialogOpen(false)}>
          <div className="dialog-card animate-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="dialog-header">ເລືອກຊ່ວງໜ້າ PDF</div>
            <div className="dialog-body" style={{ padding: '0 24px 20px', fontSize: 14, color: 'var(--md-on-surface-variant)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 16 }}>
                ໄຟລ໌ມີທັງໝົດ <strong style={{ color: 'var(--md-primary)' }}>{rangeDialogPages}</strong> ໜ້າ. ເລືອກຊ່ວງໜ້າທີ່ຕ້ອງການດຶງຂໍ້ມູນ:
              </p>
              
              {(rangeDialogEnd - rangeDialogStart + 1 > 100) && (
                <div style={{
                  background: 'rgba(230, 126, 34, 0.1)',
                  border: '1px solid rgba(230, 126, 34, 0.4)',
                  color: 'var(--md-on-surface)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>⚠️</span>
                  <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                    <strong>ຄຳແນະນຳຄວາມໄວ:</strong> ການເລືອກຫຼາຍກວ່າ 100 ໜ້າ ອາດເຮັດໃຫ້ການປະມວນຜົນຊ້າ. ແນະນຳໃຫ້ເລືອກຊ່ວງໜ້າທີ່ນ້ອຍລົງ (ບໍ່ເກີນ 30-50 ໜ້າ) ເພື່ອຄວາມໄວ ແລະ ຄວາມຖືກຕ້ອງສູງສຸດຂອງ AI.
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                <div className="md-field" style={{ flex: 1, marginBottom: 0 }}>
                  <label>ເລີ່ມຕົ້ນ (ໜ້າ)</label>
                  <input
                    className="md-input"
                    type="number"
                    min="1"
                    max={rangeDialogPages}
                    value={rangeDialogStart}
                    onChange={e => {
                      const val = Math.max(1, Math.min(rangeDialogPages, parseInt(e.target.value) || 1));
                      setRangeDialogStart(val);
                      if (val > rangeDialogEnd) setRangeDialogEnd(val);
                    }}
                  />
                </div>
                <div className="md-field" style={{ flex: 1, marginBottom: 0 }}>
                  <label>ສິ້ນສຸດ (ໜ້າ)</label>
                  <input
                    className="md-input"
                    type="number"
                    min={rangeDialogStart}
                    max={rangeDialogPages}
                    value={rangeDialogEnd}
                    onChange={e => {
                      const val = Math.max(rangeDialogStart, Math.min(rangeDialogPages, parseInt(e.target.value) || rangeDialogPages));
                      setRangeDialogEnd(val);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="dialog-actions" style={{ padding: '8px 24px 24px' }}>
              <button className="md-btn-text" onClick={() => setRangeDialogOpen(false)}>ຍົກເລີກ</button>
              <button 
                className="md-btn-filled" 
                style={{ width: 'auto', padding: '10px 24px', borderRadius: 'var(--shape-full)' }}
                onClick={() => {
                  setRangeDialogOpen(false);
                  performUpload(rangeDialogFile, rangeDialogStart, rangeDialogEnd);
                }}
              >
                ຕົກລົງ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PROFILE DIALOG ═══ */}
      {profileOpen && (
        <div className="dialog-scrim" onClick={() => setProfileOpen(false)}>
          <div className="dialog-card animate-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="dialog-header">ຕັ້ງຄ່າບັນຊີ</div>
            <div className="dialog-body" style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Profile Pic Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--md-outline-variant)' }}>
                  {user.profile_pic ? (
                    <img src={user.profile_pic} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--md-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {!user.isGuest && (
                  <div>
                    <input type="file" id="pfp-upload" accept="image/png, image/jpeg" style={{ display: 'none' }} onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const fd = new FormData(); fd.append('file', file);
                      try {
                        const r = await api.postForm('/api/user/profile-pic', fd);
                        const d = await r.json();
                        if (r.ok) {
                          setUser(prev => ({ ...prev, profile_pic: d.profile_pic }));
                          show('ອັບເດດຮູບໂປຣໄຟລ໌ສຳເລັດ');
                        } else showAlert(d.error);
                      } catch { showAlert('ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫລດຮູບ'); }
                    }} />
                    <label htmlFor="pfp-upload" className="md-btn-text" style={{ cursor: 'pointer', display: 'inline-block', margin: 0 }}>
                      ອັບໂຫລດຮູບໃໝ່
                    </label>
                  </div>
                )}
              </div>

              {/* Delete Account Section */}
              {!user.isGuest && (
                <div style={{ borderTop: '1px solid var(--md-outline-variant)', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--md-error)' }}>ລົບບັນຊີຖາວອນ (ເຂດອັນຕະລາຍ)</h4>
                  <button 
                    className="md-btn-text" 
                    style={{ color: 'var(--md-error)', width: '100%', border: '1px solid var(--md-error)' }}
                    onClick={() => {
                      showConfirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບບັນຊີນີ້? ຂໍ້ມູນທັງໝົດຈະຖືກລຶບ ແລະ ບໍ່ສາມາດກູ້ຄືນໄດ້!', async () => {
                        try {
                          const r = await api.del('/api/user/account');
                          if (r.ok) {
                            handleLogout();
                            show('ລົບບັນຊີສຳເລັດ');
                            setProfileOpen(false);
                          } else {
                            const d = await r.json();
                            showAlert(d.error);
                          }
                        } catch { showAlert('ເກີດຂໍ້ຜິດພາດ'); }
                      });
                    }}
                  >
                    ລົບບັນຊີຂອງຂ້ອຍ
                  </button>
                </div>
              )}

            </div>
            <div className="dialog-actions" style={{ padding: '8px 24px 24px' }}>
              <button className="md-btn-text" onClick={() => setProfileOpen(false)}>ປິດ</button>
            </div>
          </div>
        </div>
      )}

      {dialog && (
        <div className="dialog-scrim" onClick={() => { if (dialog.type === 'alert') setDialog(null); }}>
          <div className="dialog-card animate-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="dialog-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <I name={dialog.type === 'confirm' ? 'info' : 'warning'} size={24} style={{ color: dialog.type === 'confirm' ? 'var(--md-primary)' : 'var(--md-error)' }} />
              <span>{dialog.title}</span>
            </div>
            <div className="dialog-body" style={{ padding: '0 24px 20px', fontSize: 14, color: 'var(--md-on-surface-variant)', lineHeight: 1.6 }}>
              {dialog.message}
            </div>
            <div className="dialog-actions" style={{ padding: '8px 24px 24px' }}>
              {dialog.type === 'confirm' && (
                <button className="md-btn-text" onClick={() => { dialog.onCancel?.(); setDialog(null); }}>ຍົກເລີກ</button>
              )}
              <button 
                className="md-btn-filled" 
                style={{ width: 'auto', padding: '10px 24px', borderRadius: 'var(--shape-full)' }} 
                onClick={() => { dialog.onConfirm?.(); setDialog(null); }}
              >
                {dialog.type === 'confirm' ? 'ຕົກລົງ' : 'ປິດ'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Snackbar ts={ts} />
    </div>
  );
}
