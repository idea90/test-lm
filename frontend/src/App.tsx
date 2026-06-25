import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';

// ═══ Icons ═══
const I = ({ name, size = 20, style, className }: { name: string; size?: number; style?: React.CSSProperties; className?: string }) => {
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
    'image': 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
  };
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
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
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', desc: 'ໄວ ແລະ ປະຢັດ (ແນະນຳ)', badge: 'Gemini' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'gemini', desc: 'ໃຫມ່! ໄວ ແລະ ສະຫຼາດຂຶ້ນ', badge: 'Gemini' },
  { id: 'gemini-3.5-pro', name: 'Gemini 3.5 Pro', provider: 'gemini', desc: 'ໃຫມ່ລ່າສຸດ! ປະສິດທິພາບສູງສຸດ & ວຽກຊັບຊ້ອນ', badge: 'Gemini' },
  // ─── OpenAI ───
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', desc: 'ໄວ ແລະ ປະຢັດ ຂອງ OpenAI', badge: 'OpenAI' },
  { id: 'gpt-5.5-instant', name: 'GPT-5.5 Instant', provider: 'openai', desc: 'ໃຫມ່! ຕອບສະໜອງໄວທันໃຈ', badge: 'OpenAI' },
  { id: 'gpt-5.5-thinking', name: 'GPT-5.5 Thinking', provider: 'openai', desc: 'ໃຫມ່ລ່າສຸດ! ເນັ້ນການຄິດຫາເຫດຜົນແບບເລິກເຊິ່ງ', badge: 'OpenAI' },
  { id: 'gpt-5.5-pro', name: 'GPT-5.5 Pro', provider: 'openai', desc: 'ໃຫມ່ລ່າສຸດ! ປະສິດທິພາບສູງສຸດລະດັບມືອາຊີບ', badge: 'OpenAI' },
  // ─── Anthropic Claude ───
  { id: 'claude-haiku-4.5', name: 'Claude 4.5 Haiku', provider: 'anthropic', desc: 'ໄວ ແລະ ປະຢັດ ຂອງ Anthropic', badge: 'Claude' },
  { id: 'claude-sonnet-4.6', name: 'Claude 4.6 Sonnet', provider: 'anthropic', desc: 'ໃຫມ່! ປະສິດທິພາບດີເລີດ & ເຮັດວຽກເປັນລະບົບ', badge: 'Claude' },
  { id: 'claude-opus-4.8', name: 'Claude Opus 4.8', provider: 'anthropic', desc: 'ໃຫມ່! ໂມເດວຄິດຫາເຫດຜົນລະດັບສູງ', badge: 'Claude' },
  { id: 'claude-fable-5', name: 'Claude 5 Fable', provider: 'anthropic', desc: 'ໃຫມ່ລ່າສຸດ! ໂມເດວ Mythos-class ທີ່ສະຫຼາດທີ່ສຸດ', badge: 'Claude' },
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

  const renderIcon = (provider: string, size = 18, uniqueId = '') => {
    const suffix = uniqueId ? `-${uniqueId}` : '';
    if (provider === 'gemini') {
      const gradId = `gemini-grad${suffix}`;
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4285F4" />
              <stop offset="50%" stopColor="#9B72CB" />
              <stop offset="100%" stopColor="#D96570" />
            </linearGradient>
          </defs>
          <path d="M12 2C12 2 12.5 7.5 17.5 7.5C12.5 7.5 12 13 12 13C12 13 11.5 7.5 6.5 7.5C11.5 7.5 12 2 12 2Z" fill={`url(#${gradId})`} />
          <path d="M17 13C17 13 17.3 16.5 20.5 16.5C17.3 16.5 17 20 17 20C17 20 16.7 16.5 13.5 16.5C16.7 16.5 17 13 17 13Z" fill={`url(#${gradId})`} />
        </svg>
      );
    }
    if (provider === 'openai') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ color: '#10a37f', flexShrink: 0 }}>
          <path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z" />
        </svg>
      );
    }
    if (provider === 'anthropic') {
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" style={{ color: '#D97752', flexShrink: 0 }}>
          <path fillRule="evenodd" d="M9.218 2h2.402L16 12.987h-2.402zM4.379 2h2.512l4.38 10.987H8.82l-.895-2.308h-4.58l-.896 2.307H0L4.38 2.001zm2.755 6.64L5.635 4.777 4.137 8.64z" />
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
          {renderIcon(selectedModel.provider, 20, selectedModel.id)}
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
                  {renderIcon(m.provider, 18, m.id)}
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
  const [forceOcr, setForceOcr] = useState(false);

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

  const [dialog, setDialog] = useState(null); // { type: 'alert' | 'confirm' | 'prompt', title: '', message: '', placeholder: '', value: '', onConfirm: (val?) => void, onCancel?: () => void, onChange?: (val) => void }

  const showAlert = (message, title = 'ແຈ້ງເຕືອນ') => {
    setDialog({ type: 'alert', title, message, onConfirm: () => {} });
  };

  const showConfirm = (message, onConfirm, title = 'ຢືນຢັນ') => {
    setDialog({ type: 'confirm', title, message, onConfirm });
  };

  const showPrompt = (message, placeholder, onConfirm, title = 'ປ້ອນຂໍ້ມູນ') => {
    setDialog({ type: 'prompt', title, message, placeholder, value: '', onConfirm, onChange: (v) => setDialog(d => ({ ...d, value: v })) });
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
    if (forceOcr) fd.append('force_ocr', 'true');

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
      setForceOcr(false);
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
            {genLoading ? (
              <div className="center-loading animate-in">
                <div className="loading-animation">
                  <I name="wand" size={56} className="wand-icon" />
                  <div className="loading-waves">
                    <div className="wave"></div>
                    <div className="wave"></div>
                    <div className="wave"></div>
                  </div>
                </div>
                <h2>ກຳລັງສ້າງບົດສອບເສັງອັດສະລິຍະ...</h2>
                <p>ກະລຸນາລໍຖ້າຈັກໜ່ອຍ, ລະບົບກຳລັງວິເຄາະບົດຮຽນຂອງທ່ານເພື່ອສ້າງຄຳຖາມທີ່ດີທີ່ສຸດ.</p>
              </div>
            ) : activeTest ? (
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

                    {!activeTest.rich_text_content && activeTest?.questions?.some(q => q.question_type !== 'multiple_choice') && (
                      <button className="toolbar-chip" onClick={() => setDottedLines(p => p === 0 ? 3 : p === 3 ? 5 : 0)}>
                        ເສັ້ນຂຽນ: {dottedLines === 0 ? 'ປິດ' : `${dottedLines} ແຖວ`}
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
                      <div className="rich-toolbar-group">
                        <button className="rich-toolbar-btn" onClick={() => document.execCommand('bold')}>B</button>
                        <button className="rich-toolbar-btn" onClick={() => document.execCommand('italic')}>I</button>
                        <button className="rich-toolbar-btn" onClick={() => document.execCommand('underline')}>U</button>
                      </div>
                      <div className="rich-toolbar-divider" />
                      <label className="rich-toolbar-btn" style={{ margin: 0, cursor: 'pointer' }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const result = ev.target?.result;
                              if (typeof result === 'string') {
                                document.execCommand('insertImage', false, result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                          e.target.value = ''; // Reset input
                        }} />
                        <I name="image" size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> ໃສ່ຮູບ
                      </label>
                      <div style={{flex: 1}} />
                      <button className="rich-toolbar-save" onClick={async () => {
                        const html = document.getElementById('rich-editor').innerHTML;
                        await api.put(`/api/tests/${activeTest.id}/rich_text`, { rich_text_content: html });
                        show('ບັນທຶກເອກະສານສຳເລັດ');
                      }}>
                        ບັນທຶກ
                      </button>
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
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <input
                  type="checkbox"
                  id="force-ocr-checkbox"
                  checked={forceOcr}
                  onChange={e => setForceOcr(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="force-ocr-checkbox" style={{ fontSize: '13px', cursor: 'pointer', color: 'var(--md-on-surface-variant)' }}>
                  ບັງຄັບໃຊ້ OCR (ສຳລັບ PDF ທີ່ເປັນຮູບສະແກນ)
                </label>
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
              {dialog.type === 'prompt' && (
                <div style={{ marginTop: 12 }}>
                  <input 
                    type="text" 
                    autoFocus
                    className="md-input" 
                    placeholder={dialog.placeholder} 
                    value={dialog.value || ''} 
                    onChange={e => dialog.onChange?.(e.target.value)} 
                    onKeyDown={e => { if (e.key === 'Enter') { dialog.onConfirm?.(dialog.value); setDialog(null); } }}
                  />
                </div>
              )}
            </div>
            <div className="dialog-actions" style={{ padding: '8px 24px 24px' }}>
              {(dialog.type === 'confirm' || dialog.type === 'prompt') && (
                <button className="md-btn-text" onClick={() => { dialog.onCancel?.(); setDialog(null); }}>ຍົກເລີກ</button>
              )}
              <button 
                className="md-btn-filled" 
                style={{ width: 'auto', padding: '10px 24px', borderRadius: 'var(--shape-full)' }} 
                onClick={() => { dialog.onConfirm?.(dialog.value); setDialog(null); }}
              >
                {dialog.type === 'alert' ? 'ປິດ' : 'ຕົກລົງ'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Snackbar ts={ts} />
    </div>
  );
}
