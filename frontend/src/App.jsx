import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';

// ═══ Icons ═══
const I = ({ name, size = 20 }) => {
  const d = {
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
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

const LAO = { A: 'ກ', B: 'ຂ', C: 'ຄ', D: 'ງ' };

// ═══ APP ═══
export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });

  const [sources, setSources] = useState([]);
  const [selSrcId, setSelSrcId] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTest, setActiveTest] = useState(null);

  const [cfg, setCfg] = useState({
    numQ: 10, diff: 'medium', type: 'multiple_choice',
    lang: 'lao', custom: '', shuffle: false
  });
  const [genLoading, setGenLoading] = useState(false);
  const [showExp, setShowExp] = useState(true);

  const [view, setView] = useState('test');
  const [uploading, setUploading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [configOpen, setConfigOpen] = useState(false);

  const [previewSchool, setPreviewSchool] = useState('ໂຮງຮຽນ ມັດທະຍົມສົມບູນ...');
  const [previewSubject, setPreviewSubject] = useState('ວິຊາ: ບົດຮຽນທົ່ວໄປ');

  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const { ts, show } = useToast();
  const fileRef = useRef(null);

  useEffect(() => { checkAuth(); }, []);

  // ─── Auth ───
  const checkAuth = async () => {
    try {
      const r = await api.get('/api/auth/me');
      const d = await r.json();
      if (r.ok && d.logged_in) {
        setUser({ username: d.username, isGuest: d.is_guest });
        loadSources(); loadStats();
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
        setUser({ username: d.username, isGuest: d.is_guest || false });
        setAuthForm({ username: '', password: '' });
        loadSources(); loadStats();
        show(authMode === 'login' ? 'ເຂົ້າລະບົບສຳເລັດ' : 'ລົງທະບຽນສຳເລັດ');
      } else alert(d.error);
    } catch { alert('ເກີດຂໍ້ຜິດພາດ'); }
  };

  const handleGuest = async () => {
    try {
      const r = await api.post('/api/auth/guest', {});
      const d = await r.json();
      if (r.ok) { setUser({ username: d.username, isGuest: true }); loadSources(); loadStats(); show('Guest mode'); }
    } catch { alert('ເກີດຂໍ້ຜິດພາດ'); }
  };

  const handleLogout = async () => {
    await api.post('/api/auth/logout', {});
    setUser(null); setSources([]); setStats(null); setActiveTest(null); setSelSrcId(null);
  };

  // ─── Data ───
  const loadSources = async () => { try { const r = await api.get('/api/sources'); if (r.ok) setSources(await r.json()); } catch {} };
  const loadStats = async () => { try { const r = await api.get('/api/dashboard/stats'); if (r.ok) setStats(await r.json()); } catch {} };

  const handleUpload = async (file) => {
    if (!file?.name.toLowerCase().endsWith('.pdf')) { alert('PDF ເທົ່ານັ້ນ'); return; }
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const r = await api.postForm('/api/sources/upload', fd);
      const d = await r.json();
      if (r.ok) { show('ອັບໂຫລດສຳເລັດ'); await loadSources(); setSelSrcId(d.id); loadStats(); }
      else alert(d.error);
    } catch { alert('Error'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const deleteSource = async (id) => {
    if (!confirm('ລົບໄຟລ໌ນີ້?')) return;
    const r = await api.del(`/api/sources/${id}`);
    if (r.ok) { if (selSrcId === id) setSelSrcId(null); loadSources(); loadStats(); show('ລົບແລ້ວ'); }
  };

  // ─── Quiz ───
  const generateTest = async () => {
    if (!selSrcId) { show('ເລືອກ PDF ກ່ອນ'); return; }
    
    if (stats) {
      if (stats.total_tokens_used >= stats.token_limit) {
        alert('ໂຄຕ້າການນຳໃຊ້ AI ຂອງທ່ານໝົດແລ້ວ (Limit Reached)');
        return;
      }
      if (stats.total_tokens_used / stats.token_limit >= 0.9) {
        show('ຄຳເຕືອນ: ໂຄຕ້າ AI ຂອງທ່ານໃກ້ໝົດແລ້ວ!');
      }
    }
    
    setGenLoading(true); setConfigOpen(false);
    try {
      const key = localStorage.getItem('gemini_api_key') || '';
      const r = await api.post('/api/tests/generate', {
        source_id: selSrcId, num_questions: cfg.numQ, difficulty: cfg.diff,
        question_type: cfg.type, custom_instructions: cfg.custom,
        language: cfg.lang, shuffle_options: cfg.shuffle, api_key: key
      });
      const d = await r.json();
      if (r.ok) { setActiveTest(d); loadStats(); show('ສ້າງບົດສອບເສັງສຳເລັດ!'); }
      else alert(d.error);
    } catch { alert('Error'); }
    setGenLoading(false);
  };

  const updateQ = async (id, data) => {
    const r = await api.put(`/api/questions/${id}`, data);
    if (r.ok && activeTest) {
      setActiveTest(p => ({ ...p, questions: p.questions.map(q => q.id === id ? { ...q, ...data } : q) }));
      setEditModal(null); show('ແກ້ໄຂແລ້ວ'); loadStats();
    }
  };

  const deleteQ = async (id) => {
    if (!confirm('ລົບຄຳຖາມນີ້?')) return;
    const r = await api.del(`/api/questions/${id}`);
    if (r.ok && activeTest) {
      setActiveTest(p => ({ ...p, questions: p.questions.filter(q => q.id !== id) }));
      show('ລົບແລ້ວ'); loadStats();
    }
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

  const deleteTest = async () => {
    if (!activeTest) return;
    if (!confirm('ລົບບົດສອບເສັງ ແລະ ຄຳຖາມທັງໝົດ?')) return;
    const r = await api.del(`/api/tests/${activeTest.id}`);
    if (r.ok) {
      setActiveTest(null);
      loadStats();
      show('ລົບບົດສອບເສັງແລ້ວ');
    }
  };

  const selSrc = sources.find(s => s.id === selSrcId);

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
          <div className="md-field"><label>ຊື່ຜູ້ໃຊ້</label><input className="md-input" required placeholder="username" value={authForm.username} onChange={e => setAuthForm(p => ({ ...p, username: e.target.value }))} /></div>
          <div className="md-field"><label>ລະຫັດຜ່ານ</label><input className="md-input" type="password" required placeholder="password" value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} /></div>
          <button type="submit" className="md-btn-filled">{authMode === 'login' ? 'ເຂົ້າລະບົບ' : 'ສ້າງບັນຊີ'}</button>
        </form>
        <div className="md-divider">ຫຼື</div>
        <button className="md-btn-tonal" onClick={handleGuest}>ທົດລອງໃຊ້ (Guest)</button>
        <p className="auth-note">Guest ໃຊ້ຖານຂໍ້ມູນຮ່ວມ</p>
      </div>
      <Snackbar ts={ts} />
    </div>
  );

  // ═══ MAIN ═══
  return (
    <div className="app-shell">
      {/* ═══ Sources Sidebar ═══ */}
      <aside className="sources-sidebar">
        <div className="sb-header">
          <div className="sb-logo">
            <div className="sb-logo-icon"><I name="zap" size={18} /></div>
            <span className="sb-logo-text">Test LM</span>
          </div>
        </div>

        {/* Upload */}
        <div className="sb-upload"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag'); }}
          onDragLeave={e => e.currentTarget.classList.remove('drag')}
          onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag'); if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]); }}
        >
          <input ref={fileRef} type="file" accept=".pdf" hidden onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
          {uploading ? <div className="md-spinner" /> : <>
            <I name="upload" size={16} />
            <span>ອັບໂຫລດ PDF</span>
          </>}
        </div>

        <div className="sb-label">Sources <span className="sb-count">{sources.length}</span></div>

        {/* Source list */}
        <div className="sb-list">
          {sources.length === 0 && (
            <div className="sb-empty">
              <I name="folder" size={24} />
              <p>ອັບໂຫລດ PDF ເພື່ອເລີ່ມ</p>
            </div>
          )}
          {sources.map(s => (
            <div key={s.id} className={`sb-item ${selSrcId === s.id ? 'active' : ''}`} onClick={() => { setSelSrcId(s.id); show(`ເລືອກ: ${s.filename}`); }}>
              <div className="sb-item-icon"><I name="file" size={14} /></div>
              <div className="sb-item-info">
                <div className="sb-item-name" title={s.filename}>{s.filename}</div>
                <div className="sb-item-meta">{(s.file_size / 1024).toFixed(1)} KB</div>
              </div>
              <button className="sb-item-del" onClick={e => { e.stopPropagation(); deleteSource(s.id); }}><I name="trash" size={12} /></button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sb-footer">
          <button className="icon-btn" onClick={() => setDark(d => !d)} title="Dark mode">
            <I name={dark ? 'sun' : 'moon'} size={16} />
          </button>
          <button className="icon-btn" onClick={() => setSettingsOpen(true)} title="API Key"><I name="key" size={16} /></button>
          <div className="sb-user">
            <span className="sb-user-name">{user.username}</span>
            {user.isGuest && <span className="sb-guest">GUEST</span>}
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
              <I name="wand" size={16} /> ບົດສອບເສັງ
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
                <button className="toolbar-generate" disabled={genLoading || !selSrcId} onClick={generateTest}>
                  {genLoading ? <><div className="md-spinner on-primary" style={{ width: 16, height: 16 }} /> ກຳລັງສ້າງ...</> : <><I name="wand" size={16} /> ສ້າງ</>}
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
                    <button className="icon-btn" onClick={() => setShowExp(p => !p)} title="ສະແດງ/ເຊື່ອງຄຳຕອບ"><I name={showExp ? 'eyeOff' : 'eye'} size={16} /></button>
                    <button className="icon-btn" onClick={() => setEditModal({ mode: 'add', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: '' })} title="ເພີ່ມ"><I name="plus" size={16} /></button>
                    <button className="icon-btn" onClick={deleteTest} title="ລົບບົດສອບເສັງ" style={{ color: 'var(--md-error)' }}><I name="trash" size={16} /></button>
                    <button className="toolbar-chip" onClick={() => { show('ດາວໂຫລດ Word...'); window.location.href = `/api/tests/${activeTest.id}/export/docx`; }}>
                      <I name="download" size={14} /> Word
                    </button>
                  </div>
                </div>

                {/* The exam paper */}
                <div className="exam-paper">
                  <div className="exam-paper-header">
                    <input className="exam-school-input" value={previewSchool} onChange={e => setPreviewSchool(e.target.value)} />
                    <div className="exam-subject">ບົດສອບເສັງ {previewSubject}</div>
                    <input className="exam-subject-input" value={previewSubject} onChange={e => setPreviewSubject(e.target.value)} />
                    <div className="exam-student-row">
                      <span>ຊື່: .........................</span>
                      <span>ຫ້ອງ: ............</span>
                      <span>ວັນທີ: .../.../....</span>
                    </div>
                  </div>

                  <div className="exam-instructions">
                    ຄຳຊີ້ແຈງ: ເລືອກຄຳຕອບທີ່ຖືກຕ້ອງທີ່ສຸດ ໂດຍໝາຍ (X) ໃສ່ ກ, ຂ, ຄ ຫຼື ງ.
                  </div>

                  {activeTest.questions.map((q, i) => (
                    <div key={q.id} className="exam-question">
                      <div className="exam-q-row">
                        <p className="exam-q-text"><strong>ຂໍ້ {i + 1}.</strong> {q.question_text}</p>
                        <div className="exam-q-actions">
                          <button className="icon-btn sm" onClick={() => setEditModal({ mode: 'edit', id: q.id, ...q })}><I name="edit" size={13} /></button>
                          <button className="icon-btn sm" onClick={() => deleteQ(q.id)}><I name="trash" size={13} /></button>
                        </div>
                      </div>
                      <div className="exam-options">
                        {['A','B','C','D'].map(o => (
                          <div key={o} className={`exam-opt ${showExp && q.correct_option === o ? 'correct' : ''}`}>
                            {LAO[o]}. {q[`option_${o.toLowerCase()}`]}
                          </div>
                        ))}
                      </div>
                      {showExp && (
                        <div className="exam-answer">
                          <I name="check" size={13} /> ຄຳຕອບ: <strong>{LAO[q.correct_option]}</strong> — {q.explanation || '—'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="center-empty animate-in">
                <div className="center-empty-icon"><I name="wand" size={44} /></div>
                <h2>ສ້າງບົດສອບເສັງ</h2>
                <p>{selSrc ? `ແຫຼ່ງ: "${selSrc.filename}" — ກົດ "ສ້າງ" ທາງເທິງ` : 'ເລືອກ PDF ທາງຊ້າຍ ແລ້ວກົດ "ສ້າງ"'}</p>
                {!selSrc && (
                  <button className="md-btn-tonal" style={{ width: 'auto', padding: '10px 24px', marginTop: 20 }} onClick={() => fileRef.current?.click()}>
                    <I name="upload" size={16} /> ອັບໂຫລດ PDF
                  </button>
                )}
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
                  { icon: 'wand', color: 'blue', label: 'Tokens (Usage)', val: `${(stats.total_tokens_used || 0).toLocaleString()} / ${(stats.token_limit || 0).toLocaleString()}` },
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
                  <div key={i} className="recent-row">
                    <div className="recent-row-info">
                      <div className="recent-row-icon"><I name="zap" size={14} /></div>
                      <div>
                        <div className="recent-row-name">{t.title}</div>
                        <div className="recent-row-sub">{t.source_filename || '—'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className={`md-chip ${t.difficulty}`}>{{ easy: 'ງ່າຍ', medium: 'ປານກາງ', hard: 'ຍາກ' }[t.difficulty]}</span>
                      <span className="md-chip" style={{ background: 'var(--md-secondary-container)', color: 'var(--md-on-secondary-container)' }}>{t.num_questions} ຂໍ້</span>
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
                  <option value="english">English</option>
                  <option value="mixed">ປະສົມ</option>
                </select>
              </div>
              <div className="config-field">
                <div className="config-field-label">ຮູບແບບ</div>
                <select className="md-select" value={cfg.type} onChange={e => setCfg(p => ({ ...p, type: e.target.value }))}>
                  <option value="multiple_choice">ປາລະໄນ</option>
                  <option value="true_false">ຖືກ / ຜິດ</option>
                  <option value="short_answer">ຕອບສັ້ນ</option>
                </select>
              </div>
              <div className="config-field">
                <div className="config-field-label">ຄຳສັ່ງເພີ່ມ</div>
                <textarea className="md-textarea" rows="2" placeholder="ເນັ້ນບົດທີ 3..." value={cfg.custom} onChange={e => setCfg(p => ({ ...p, custom: e.target.value }))} />
              </div>
              <label className="md-checkbox-row">
                <input type="checkbox" checked={cfg.shuffle} onChange={e => setCfg(p => ({ ...p, shuffle: e.target.checked }))} />
                ສັບປ່ຽນລຳດັບ
              </label>
            </div>
            <div className="dialog-actions">
              <button className="md-btn-text" onClick={() => setConfigOpen(false)}>ປິດ</button>
              <button className="md-btn-text" onClick={() => { setConfigOpen(false); generateTest(); }}>ສ້າງບົດສອບເສັງ</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SETTINGS DIALOG ═══ */}
      {settingsOpen && (
        <div className="dialog-scrim" onClick={() => setSettingsOpen(false)}>
          <div className="dialog-card" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">API Key</div>
            <div className="dialog-body">
              <div className="md-field"><label>Gemini API Key</label><input className="md-input" type="password" id="api-key-in" placeholder="AIzaSy..." defaultValue={localStorage.getItem('gemini_api_key') || ''} /></div>
              <p style={{ fontSize: 13, color: 'var(--md-outline)' }}>ໃສ່ Key ຂອງທ່ານ ຖ້າເຊີບເວີບໍ່ໄດ້ຕັ້ງ .env</p>
            </div>
            <div className="dialog-actions">
              <button className="md-btn-text" onClick={() => setSettingsOpen(false)}>ປິດ</button>
              <button className="md-btn-text" onClick={() => { localStorage.setItem('gemini_api_key', document.getElementById('api-key-in').value.trim()); setSettingsOpen(false); show('ບັນທຶກແລ້ວ'); }}>ບັນທຶກ</button>
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
              <div className="md-field"><label>ຄຳຖາມ</label><textarea className="md-textarea" rows="2" value={editModal.question_text} onChange={e => setEditModal(p => ({ ...p, question_text: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {['A','B','C','D'].map(o => (
                  <div key={o} className="md-field"><label>ຕົວເລືອກ {LAO[o]}</label><input className="md-input" value={editModal[`option_${o.toLowerCase()}`]} onChange={e => setEditModal(p => ({ ...p, [`option_${o.toLowerCase()}`]: e.target.value }))} /></div>
                ))}
              </div>
              <div className="md-field"><label>ຄຳຕອບ</label>
                <select className="md-select" value={editModal.correct_option} onChange={e => setEditModal(p => ({ ...p, correct_option: e.target.value }))}>
                  {['A','B','C','D'].map(o => <option key={o} value={o}>{LAO[o]} ({o})</option>)}
                </select>
              </div>
              <div className="md-field"><label>ຄຳອະທິບາຍ</label><textarea className="md-textarea" rows="2" value={editModal.explanation} onChange={e => setEditModal(p => ({ ...p, explanation: e.target.value }))} /></div>
            </div>
            <div className="dialog-actions">
              <button className="md-btn-text" onClick={() => setEditModal(null)}>ຍົກເລີກ</button>
              <button className="md-btn-text" onClick={() => {
                const d = { question_text: editModal.question_text, option_a: editModal.option_a, option_b: editModal.option_b, option_c: editModal.option_c, option_d: editModal.option_d, correct_option: editModal.correct_option, explanation: editModal.explanation };
                editModal.mode === 'add' ? addQ(d) : updateQ(editModal.id, d);
              }}>ບັນທຶກ</button>
            </div>
          </div>
        </div>
      )}

      <Snackbar ts={ts} />
    </div>
  );
}
