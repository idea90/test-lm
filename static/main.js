// State Management
let state = {
    sources: [],
    selectedSourceId: null,
    activeTest: null,
    difficulty: 'medium',
    numOptions: 4,
    language: 'lao',
    timeLimit: 0,
    shuffleOptions: false,
    includeAnswerKey: true,
    includeExplanation: true,
    numQuestions: 10,
    chatHistory: [],
    explanationsVisible: true,
    user: {
        loggedIn: false,
        username: null,
        isGuest: false
    }
};

// Chart instances to track charts for updating/destroying
let difficultyChartInstance = null;
let optionsChartInstance = null;

// Lao option mapping helper
const LAO_OPTIONS = {
    'A': 'ກ',
    'B': 'ຂ',
    'C': 'ຄ',
    'D': 'ງ'
};

// DOM Elements
const pdfFileInput = document.getElementById('pdf-file-input');
const dropzone = document.getElementById('dropzone');
const uploadLoader = document.getElementById('upload-loader');
const sourcesList = document.getElementById('sources-list');
const noSources = document.getElementById('no-sources');
const sourceCount = document.getElementById('source-count');
const selectedSourceTag = document.getElementById('selected-source-tag');

// Drawer / Panel Toggles DOM
const toggleSourcesBtn = document.getElementById('toggle-sources-btn');
const toggleStudioBtn = document.getElementById('toggle-studio-btn');
const toggleStudioDesktopBtn = document.getElementById('toggle-studio-desktop-btn');
const toggleStudioText = document.getElementById('toggle-studio-text');
const closeStudioBtn = document.getElementById('close-studio-btn');
const sourcesSidebar = document.getElementById('sources-sidebar');
const studioPanel = document.getElementById('studio-panel');
const drawerBackdrop = document.getElementById('drawer-backdrop');

// Dashboard DOM Elements
const dashTotalSources = document.getElementById('dash-total-sources');
const dashTotalTests = document.getElementById('dash-total-tests');
const dashTotalQuestions = document.getElementById('dash-total-questions');
const dashTotalSize = document.getElementById('dash-total-size');
const dashSourcesTbody = document.getElementById('dash-sources-tbody');
const dashRecentTests = document.getElementById('dash-recent-tests');

const questionCountSlider = document.getElementById('question-count-slider');
const questionCountDisplay = document.getElementById('question-count-display');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const generateTestBtn = document.getElementById('generate-test-btn');
const activeTestIndicator = document.getElementById('active-test-indicator');
const activeTestTitle = document.getElementById('active-test-title');
const testQuestionsCount = document.getElementById('test-questions-count');
const toggleExplanationsBtn = document.getElementById('toggle-explanations-btn');
const addNewQBtn = document.getElementById('add-new-q-btn');
const questionsContainer = document.getElementById('questions-container');
const optionsCountSlider = document.getElementById('options-count-slider');
const optionsCountDisplay = document.getElementById('options-count-display');
const languageSelect = document.getElementById('language-select');
const timeLimitInput = document.getElementById('time-limit-input');
const shuffleOptionsCb = document.getElementById('shuffle-options-cb');
const includeAnswerKeyCb = document.getElementById('include-answer-key-cb');
const includeExplanationCb = document.getElementById('include-explanation-cb');

const schoolNameInput = document.getElementById('school-name-input');
const subjectNameInput = document.getElementById('subject-name-input');
const previewSchoolTitle = document.getElementById('preview-school-title');
const previewExamSubject = document.getElementById('preview-exam-subject');
const printQuestionsList = document.getElementById('print-questions-list');

const chatMessagesContainer = document.getElementById('chat-messages-container');
const chatInputField = document.getElementById('chat-input-field');
const sendChatBtn = document.getElementById('send-chat-btn');

const exportBar = document.getElementById('export-bar');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const exportDocxBtn = document.getElementById('export-docx-btn');
const exportPngBtn = document.getElementById('export-png-btn');

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const modalApiKey = document.getElementById('modal-api-key');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');

const editQuestionModal = document.getElementById('edit-question-modal');
const editQuestionForm = document.getElementById('edit-question-form');
const editQId = document.getElementById('edit-q-id');
const editQText = document.getElementById('edit-q-text');
const editOptA = document.getElementById('edit-opt-a');
const editOptB = document.getElementById('edit-opt-b');
const editOptC = document.getElementById('edit-opt-c');
const editOptD = document.getElementById('edit-opt-d');
const editQCorrect = document.getElementById('edit-q-correct');
const editQExplanation = document.getElementById('edit-q-explanation');
const closeEditQBtn = document.getElementById('close-edit-q-btn');
const cancelEditQBtn = document.getElementById('cancel-edit-q-btn');

// DOM Elements for Auth
const authOverlay = document.getElementById('auth-overlay');
const authTabLogin = document.getElementById('auth-tab-login');
const authTabRegister = document.getElementById('auth-tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const registerUsernameInput = document.getElementById('register-username');
const registerPasswordInput = document.getElementById('register-password');
const guestLoginBtn = document.getElementById('guest-login-btn');
const userProfileBadge = document.getElementById('user-profile-badge');
const headerUsername = document.getElementById('header-username');
const guestBadge = document.getElementById('guest-badge');
const logoutBtn = document.getElementById('logout-btn');

// Global fetch interceptor for 401 Unauthorized
const originalFetch = window.fetch;
window.fetch = async function (...args) {
    const response = await originalFetch(...args);
    if (response.status === 401) {
        if (state.user.loggedIn) {
            state.user = { loggedIn: false, username: null, isGuest: false };
            updateAuthUI();
            showToast("ເຊດຊັນຂອງທ່ານໝົດອາຍຸ, ກະລຸນາເຂົ້າລະບົບໃໝ່");
        }
    }
    return response;
};

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    checkAuthStatus();
    setupEventListeners();
});

// Check Authentication Status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (response.ok && data.logged_in) {
            state.user = {
                loggedIn: true,
                username: data.username,
                isGuest: data.is_guest
            };
            updateAuthUI();
            loadSources();
            loadDashboardStats();
        } else {
            state.user = {
                loggedIn: false,
                username: null,
                isGuest: false
            };
            updateAuthUI();
        }
    } catch (error) {
        console.error("Error checking auth status:", error);
    }
}

// Update UI based on Auth State
function updateAuthUI() {
    if (state.user.loggedIn) {
        if (authOverlay) authOverlay.classList.add('hidden');
        if (userProfileBadge) userProfileBadge.classList.remove('hidden');
        if (logoutBtn) {
            logoutBtn.classList.remove('hidden');
            logoutBtn.style.display = 'inline-flex';
        }
        if (headerUsername) headerUsername.textContent = state.user.username;
        
        if (guestBadge) {
            if (state.user.isGuest) {
                guestBadge.classList.remove('hidden');
            } else {
                guestBadge.classList.add('hidden');
            }
        }
    } else {
        if (authOverlay) authOverlay.classList.remove('hidden');
        if (userProfileBadge) userProfileBadge.classList.add('hidden');
        if (logoutBtn) {
            logoutBtn.classList.add('hidden');
            logoutBtn.style.display = 'none';
        }
        if (headerUsername) headerUsername.textContent = '';
        if (guestBadge) guestBadge.classList.add('hidden');
        
        // Clear state
        state.sources = [];
        state.selectedSourceId = null;
        state.activeTest = null;
        renderSources();
    }
}

// Handle User Login
async function handleLogin(e) {
    if (e) e.preventDefault();
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value;
    
    if (!username || !password) {
        alert("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
        return;
    }
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            state.user = {
                loggedIn: true,
                username: data.username,
                isGuest: data.is_guest
            };
            updateAuthUI();
            loadSources();
            loadDashboardStats();
            showToast("ເຂົ້າລະບົບສຳເລັດແລ້ວ!");
            loginUsernameInput.value = '';
            loginPasswordInput.value = '';
        } else {
            alert("ການເຂົ້າລະບົບລົ້ມເຫຼວ: " + data.error);
        }
    } catch (error) {
        console.error("Login network error:", error);
        alert("ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບເຊີບເວີ");
    }
}

// Handle User Registration
async function handleRegister(e) {
    if (e) e.preventDefault();
    const username = registerUsernameInput.value.trim();
    const password = registerPasswordInput.value;
    
    if (!username || !password) {
        alert("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
        return;
    }
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            state.user = {
                loggedIn: true,
                username: data.username,
                isGuest: false
            };
            updateAuthUI();
            loadSources();
            loadDashboardStats();
            showToast("ລົງທະບຽນ ແລະ ເຂົ້າລະບົບສຳເລັດ!");
            registerUsernameInput.value = '';
            registerPasswordInput.value = '';
        } else {
            alert("ການລົງທະບຽນລົ້ມເຫຼວ: " + data.error);
        }
    } catch (error) {
        console.error("Registration network error:", error);
        alert("ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບເຊີບເວີ");
    }
}

// Handle Guest Mode Access
async function handleGuestLogin() {
    try {
        const response = await fetch('/api/auth/guest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        
        if (response.ok) {
            state.user = {
                loggedIn: true,
                username: data.username,
                isGuest: true
            };
            updateAuthUI();
            loadSources();
            loadDashboardStats();
            showToast("ເຂົ້າໃຊ້ງານໃນຖານະ Guest!");
        } else {
            alert("ບໍ່ສາມາດເຂົ້າໃຊ້ງານ Guest ໄດ້: " + data.error);
        }
    } catch (error) {
        console.error("Guest login network error:", error);
        alert("ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບເຊີບເວີ");
    }
}

// Handle Logout
async function handleLogout() {
    if (!confirm("ທ່ານຕ້ອງການອອກຈາກລະບົບ ຫຼື ບໍ່?")) return;
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            state.user = {
                loggedIn: false,
                username: null,
                isGuest: false
            };
            updateAuthUI();
            showToast("ອອກຈາກລະບົບສຳເລັດ");
        } else {
            alert("ບໍ່ສາມາດອອກຈາກລະບົບໄດ້");
        }
    } catch (error) {
        console.error("Logout network error:", error);
        alert("ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບເຊີບເວີ");
    }
}

// Load Settings from LocalStorage
function loadSettings() {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        modalApiKey.value = savedKey;
    }
}

// Save Settings to LocalStorage
function saveSettings() {
    const key = modalApiKey.value.trim();
    localStorage.setItem('gemini_api_key', key);
    settingsModal.close();
    showToast("ບັນທຶກ API Key ສຳເລັດ!");
}

// Fetch all sources from server
async function loadSources() {
    try {
        const response = await fetch('/api/sources');
        const data = await response.json();
        if (response.ok) {
            state.sources = data;
            renderSources();
        } else {
            console.error("Failed to load sources:", data.error);
        }
    } catch (error) {
        console.error("Network error fetching sources:", error);
    }
}

// Render the sidebar sources list
function renderSources() {
    sourceCount.textContent = `${state.sources.length} ໄຟລ໌`;
    
    if (state.sources.length === 0) {
        noSources.classList.remove('hidden');
        return;
    }
    
    noSources.classList.add('hidden');
    sourcesList.innerHTML = '';
    
    state.sources.forEach(source => {
        const isSelected = state.selectedSourceId === source.id;
        const sizeKB = (source.file_size / 1024).toFixed(1);
        const dateStr = new Date(source.created_at).toLocaleDateString('lo-LA', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        
        const sourceEl = document.createElement('div');
        sourceEl.className = `source-card ${isSelected ? 'selected' : ''}`;
        
        sourceEl.innerHTML = `
            <div class="source-icon">
                <i class="fa-solid fa-file-pdf"></i>
            </div>
            <div style="flex:1;min-width:0;padding-right:20px">
                <div class="source-name" title="${source.filename}">${source.filename}</div>
                <div class="source-meta">${sizeKB} KB · ${dateStr}</div>
            </div>
            <button class="source-delete delete-source-btn" data-id="${source.id}" title="ລົບ">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        
        sourceEl.addEventListener('click', (e) => {
            if (e.target.closest('.delete-source-btn')) return;
            selectSource(source.id);
        });
        
        sourcesList.appendChild(sourceEl);
    });
}

// Select a source and load details
function selectSource(id) {
    state.selectedSourceId = id;
    renderSources();
    
    const source = state.sources.find(s => s.id === id);
    if (source) {
        selectedSourceTag.textContent = source.filename;
        selectedSourceTag.className = "chat-source-tag active";
        resetChat(source.filename);
        generateTestBtn.disabled = false;
        showToast(`Selected: ${source.filename}`);
    }
}

// Delete Source
async function deleteSource(id) {
    const source = state.sources.find(s => s.id === id);
    if (!source) return;
    
    if (confirm(`ລົບ "${source.filename}"? ຂໍ້ມູນທີ່ກ່ຽວຂ້ອງທັງໝົດຈະຖືກລົບ.`)) {
        try {
            const response = await fetch(`/api/sources/${id}`, { method: 'DELETE' });
            if (response.ok) {
                if (state.selectedSourceId === id) {
                    state.selectedSourceId = null;
                    selectedSourceTag.textContent = "No source selected";
                    selectedSourceTag.className = "chat-source-tag";
                    generateTestBtn.disabled = true;
                }
                loadSources();
                showToast("ລົບແຫຼ່ງຂໍ້ມູນສຳເລັດ");
                loadDashboardStats();
            } else {
                const data = await response.json();
                alert("ເກີດຂໍ້ຜິດພາດ: " + data.error);
            }
        } catch (error) {
            console.error("Error deleting source:", error);
        }
    }
}

// Fetch and render dashboard metrics and charts
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Failed to load dashboard stats:", data.error);
            return;
        }
        
        // 1. Update KPI card numbers
        if (dashTotalSources) dashTotalSources.textContent = data.total_sources;
        if (dashTotalTests) dashTotalTests.textContent = data.total_tests;
        if (dashTotalQuestions) dashTotalQuestions.textContent = data.total_questions;
        if (dashTotalSize) {
            const sizeKB = (data.total_file_size / 1024).toFixed(1);
            dashTotalSize.textContent = `${sizeKB} KB`;
        }
        
        // 2. Render sources stats table
        if (dashSourcesTbody) {
            if (data.sources_stats.length === 0) {
                dashSourcesTbody.innerHTML = `
                    <tr><td colspan="5" style="text-align:center;color:var(--text-tertiary);padding:20px 0">ຍັງບໍ່ມີຂໍ້ມູນ</td></tr>
                `;
            } else {
                dashSourcesTbody.innerHTML = data.sources_stats.map(source => {
                    const sizeKB = (source.file_size / 1024).toFixed(1);
                    return `
                        <tr>
                            <td class="name-cell" title="${source.filename}">${source.filename}</td>
                            <td>${sizeKB} KB</td>
                            <td>${source.char_count.toLocaleString()}</td>
                            <td>${source.test_count}</td>
                            <td>${source.total_questions}</td>
                        </tr>
                    `;
                }).join('');
            }
        }
        
        // 3. Render recent activities list
        if (dashRecentTests) {
            if (data.recent_tests.length === 0) {
                dashRecentTests.innerHTML = `
                    <div style="text-align:center;padding:20px 0;color:var(--text-tertiary);font-size:12px">ຍັງບໍ່ມີຊຸດຂໍ້ສອບ</div>
                `;
            } else {
                dashRecentTests.innerHTML = data.recent_tests.map(test => {
                    const diffMap = {'easy': 'ງ່າຍ', 'medium': 'ປານກາງ', 'hard': 'ຍາກ'};
                    const diffPill = {
                        'easy': 'pill-easy',
                        'medium': 'pill-medium',
                        'hard': 'pill-hard'
                    };
                    const pillClass = diffPill[test.difficulty.toLowerCase()] || 'pill-medium';
                    const diffLao = diffMap[test.difficulty.toLowerCase()] || test.difficulty;
                    
                    return `
                        <div class="recent-test-item">
                            <div class="recent-test-info">
                                <div class="recent-test-icon"><i class="fa-solid fa-file-lines"></i></div>
                                <div>
                                    <div class="recent-test-name" title="${test.title}">${test.title}</div>
                                    <div class="recent-test-source">${test.source_filename || 'ລຶບແລ້ວ'}</div>
                                </div>
                            </div>
                            <div class="recent-test-badges">
                                <span class="pill ${pillClass}">${diffLao}</span>
                                <span class="pill pill-count">${test.num_questions} ຂໍ້</span>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
        
        // 4. Render charts
        renderDashboardCharts(data.difficulty_breakdown, data.correct_option_breakdown);
        
    } catch (error) {
        console.error("Network error fetching dashboard stats:", error);
    }
}

// Render or update charts using Chart.js
function renderDashboardCharts(diffData, optData) {
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js is not loaded yet.");
        return;
    }
    
    const chartColors = {
        easy: '#22c55e',
        medium: '#f59e0b',
        hard: '#ef4444',
        optionA: '#1a1a1a',
        optionB: '#555555',
        optionC: '#888888',
        optionD: '#bbbbbb'
    };
    
    // 1. Difficulty distribution chart (Doughnut)
    const diffCtx = document.getElementById('difficultyChart');
    if (diffCtx) {
        if (difficultyChartInstance) difficultyChartInstance.destroy();
        
        const hasData = (diffData.easy + diffData.medium + diffData.hard) > 0;
        
        difficultyChartInstance = new Chart(diffCtx, {
            type: 'doughnut',
            data: {
                labels: ['ງ່າຍ', 'ປານກາງ', 'ຍາກ'],
                datasets: [{
                    data: hasData ? [diffData.easy, diffData.medium, diffData.hard] : [1, 1, 1],
                    backgroundColor: hasData 
                        ? [chartColors.easy, chartColors.medium, chartColors.hard]
                        : ['#e5e5e5', '#d4d4d4', '#a3a3a3'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: 'Inter, Noto Sans Lao', size: 11 },
                            boxWidth: 10,
                            padding: 16
                        }
                    },
                    tooltip: {
                        enabled: hasData,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${context.raw} ຊຸດ`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
    
    // 2. Correct Option distribution chart (Bar)
    const optCtx = document.getElementById('optionsChart');
    if (optCtx) {
        if (optionsChartInstance) optionsChartInstance.destroy();
        
        const labelsLao = ['ກ', 'ຂ', 'ຄ', 'ງ'];
        const values = [optData.A, optData.B, optData.C, optData.D];
        
        optionsChartInstance = new Chart(optCtx, {
            type: 'bar',
            data: {
                labels: labelsLao,
                datasets: [{
                    label: 'ຈຳນວນ',
                    data: values,
                    backgroundColor: [chartColors.optionA, chartColors.optionB, chartColors.optionC, chartColors.optionD],
                    borderRadius: 6,
                    maxBarThickness: 28
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.raw} ຂໍ້`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: { family: 'Inter, Noto Sans Lao', size: 10 }
                        },
                        grid: { color: '#f5f5f5' }
                    },
                    x: {
                        ticks: {
                            font: { family: 'Inter, Noto Sans Lao', size: 12, weight: '600' }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

// Reset Chat Container with Greeting
function resetChat(filename) {
    state.chatHistory = [];
    chatMessagesContainer.innerHTML = `
        <div class="chat-bubble bot-message" style="display:flex;gap:12px;max-width:85%">
            <div style="width:24px;height:24px;border-radius:6px;background:var(--surface-alt);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">
                <i class="fa-solid fa-robot" style="font-size:10px;color:var(--text-tertiary)"></i>
            </div>
            <div style="font-size:13px;line-height:1.7">
                <p>ສະບາຍດີ! ຂ້ອຍໄດ້ໂຫຼດບົດຮຽນ <strong>"${filename}"</strong> ແລ້ວ.</p>
                <p style="margin-top:4px;color:var(--text-secondary)">ທ່ານສາມາດຖາມຄຳຖາມກ່ຽວກັບບົດຮຽນນີ້ ຫຼື ຂໍສ້າງຄຳຖາມເພີ່ມເຕີມ.</p>
            </div>
        </div>
    `;
}

// Handle PDF file upload
async function handlePdfUpload(file) {
    if (!file || !file.name.toLowerCase().endswith('.pdf')) {
        alert("ກະລຸນາເລືອກໄຟລ໌ PDF ເທົ່ານັ້ນ!");
        return;
    }
    
    uploadLoader.classList.remove('hidden');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/sources/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (response.ok) {
            showToast("ອັບໂຫລດສຳເລັດ");
            await loadSources();
            selectSource(data.id);
            loadDashboardStats();
        } else {
            alert("ບໍ່ສາມາດອັບໂຫລດ: " + data.error);
        }
    } catch (error) {
        console.error("Upload network error:", error);
        alert("ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່");
    } finally {
        uploadLoader.classList.add('hidden');
        pdfFileInput.value = '';
    }
}

// Helper endsWith for string safely
String.prototype.endswith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// Generate Test Questions from selected source
async function generateTest() {
    if (!state.selectedSourceId) {
        alert("ກະລຸນາເລືອກແຫຼ່ງຂໍ້ມູນ PDF ກ່ອນ!");
        return;
    }
    
    const apiKey = localStorage.getItem('gemini_api_key') || '';
    
    generateTestBtn.disabled = true;
    generateTestBtn.innerHTML = `<div class="loading-spinner" style="width:16px;height:16px"></div> <span>ກຳລັງສ້າງ...</span>`;
    
    questionsContainer.innerHTML = `
        <div style="background:var(--surface);border-radius:var(--radius);border:1px solid var(--border-light);padding:48px 20px;text-align:center">
            <div class="loading-spinner brand" style="margin:0 auto 16px"></div>
            <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">AI ກຳລັງສ້າງຂໍ້ສອບ...</div>
            <div style="font-size:11px;color:var(--text-tertiary)">ວິເຄາະເນື້ອຫາ ແລະ ສ້າງຄຳຖາມ</div>
        </div>
    `;
    
    try {
        const response = await fetch('/api/tests/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source_id: state.selectedSourceId,
                num_questions: state.numQuestions,
                difficulty: state.difficulty,
                question_type: document.getElementById('question-type-select').value,
                custom_instructions: document.getElementById('custom-instructions-input').value.trim(),
                num_options: state.numOptions,
                language: state.language,
                time_limit: state.timeLimit,
                shuffle_options: state.shuffleOptions,
                include_answer_key: state.includeAnswerKey,
                include_explanation: state.includeExplanation,
                api_key: apiKey
            })
        });
        const data = await response.json();
        
        if (response.ok) {
            state.activeTest = data;
            renderTest();
            showToast("ສ້າງບົດສອບເສັງສຳເລັດ!");
            loadDashboardStats();
        } else {
            alert("ບໍ່ສາມາດສ້າງບົດສອບເສັງໄດ້: " + data.error);
            resetEmptyWorkspace();
        }
    } catch (error) {
        console.error("Test generation network error:", error);
        alert("ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່");
        resetEmptyWorkspace();
    } finally {
        generateTestBtn.disabled = false;
        generateTestBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>ສ້າງບົດສອບເສັງ</span>`;
    }
}

// Reset workspace when generation fails
function resetEmptyWorkspace() {
    questionsContainer.innerHTML = `
        <div style="background:var(--surface);border-radius:var(--radius);border:1px solid var(--border-light);padding:48px 20px;text-align:center">
            <i class="fa-solid fa-triangle-exclamation" style="font-size:28px;color:var(--red);opacity:0.6;display:block;margin-bottom:12px"></i>
            <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">ເກີດຂໍ້ຜິດພາດ</div>
            <div style="font-size:11px;color:var(--text-tertiary);max-width:280px;margin:0 auto">ກວດສອບ API Key ແລ້ວລອງໃໝ່</div>
        </div>
    `;
    activeTestIndicator.classList.add('hidden');
    exportBar.classList.add('hidden');
    addNewQBtn.classList.add('hidden');
}

// Render generated test details to UI panels
function renderTest() {
    if (!state.activeTest) return;
    
    // 1. Update Indicators
    activeTestIndicator.classList.remove('hidden');
    activeTestTitle.textContent = state.activeTest.title;
    testQuestionsCount.textContent = `${state.activeTest.questions.length} ຂໍ້`;
    
    // Show Action Controls
    exportBar.classList.remove('hidden');
    addNewQBtn.classList.remove('hidden');
    
    // 2. Render Questions
    questionsContainer.innerHTML = '';
    state.activeTest.questions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = "question-card";
        card.setAttribute('data-id', q.id);
        
        card.innerHTML = `
            <div class="q-header">
                <div>
                    <div class="q-number">ຂໍ້ ${index + 1}</div>
                    <div class="q-text">${q.question_text}</div>
                </div>
                <div class="q-actions">
                    <button class="q-action-btn edit-q-btn" title="ແກ້ໄຂ" data-index="${index}">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="q-action-btn delete delete-q-btn" title="ລົບ" data-id="${q.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
            
            <div class="options-grid">
                <div class="option-item ${q.correct_option === 'A' ? 'correct' : ''}">
                    <strong>ກ.</strong> ${q.option_a}
                </div>
                <div class="option-item ${q.correct_option === 'B' ? 'correct' : ''}">
                    <strong>ຂ.</strong> ${q.option_b}
                </div>
                <div class="option-item ${q.correct_option === 'C' ? 'correct' : ''}">
                    <strong>ຄ.</strong> ${q.option_c}
                </div>
                <div class="option-item ${q.correct_option === 'D' ? 'correct' : ''}">
                    <strong>ງ.</strong> ${q.option_d}
                </div>
            </div>
            
            <div class="explanation-box ${state.explanationsVisible ? '' : 'hidden'}">
                <div class="explanation-label">
                    <i class="fa-solid fa-circle-info"></i> ຄຳຕອບ: ${LAO_OPTIONS[q.correct_option]}
                </div>
                <div class="explanation-text">${q.explanation || 'ບໍ່ມີຄຳອະທິບາຍ.'}</div>
            </div>
        `;
        
        card.querySelector('.edit-q-btn').addEventListener('click', () => {
            openEditQuestionModal(index);
        });
        
        card.querySelector('.delete-q-btn').addEventListener('click', () => {
            deleteQuestion(q.id);
        });
        
        questionsContainer.appendChild(card);
    });
    
    // 3. Render A4 Printable Sheet Preview
    renderPrintSheet();
}

// Render the Printable A4 Mockup layout
function renderPrintSheet() {
    if (!state.activeTest) return;
    
    subjectNameInput.value = `ວິຊາ: ${state.activeTest.title}`;
    previewExamSubject.textContent = `ບົດສອບເສັງ ວິຊາ: ${state.activeTest.title}`;

    // Show time limit if set
    let existingTimeLine = document.getElementById('preview-time-limit');
    if (!existingTimeLine) {
        existingTimeLine = document.createElement('div');
        existingTimeLine.id = 'preview-time-limit';
        existingTimeLine.style.cssText = 'font-size:12px;font-weight:600;margin-top:8px;color:#333';
        const examHeader = document.querySelector('#print-sheet .exam-header');
        if (examHeader) examHeader.appendChild(existingTimeLine);
    }
    if (state.timeLimit > 0) {
        existingTimeLine.textContent = `ເວລາ: ${state.timeLimit} ນາທີ`;
        existingTimeLine.style.display = '';
    } else {
        existingTimeLine.style.display = 'none';
    }
    
    printQuestionsList.innerHTML = '';
    
    state.activeTest.questions.forEach((q, index) => {
        const qBlock = document.createElement('div');
        qBlock.className = "print-question page-break-avoid";
        qBlock.innerHTML = `
            <p>ຂໍ້ ${index + 1}. ${q.question_text}</p>
            <div class="print-options">
                <div>ກ. ${q.option_a}</div>
                <div>ຂ. ${q.option_b}</div>
                <div>ຄ. ${q.option_c}</div>
                <div>ງ. ${q.option_d}</div>
            </div>
        `;
        printQuestionsList.appendChild(qBlock);
    });
}

// Open Dialog modal to edit a question
function openEditQuestionModal(index) {
    const q = state.activeTest.questions[index];
    if (!q) return;
    
    editQId.value = q.id;
    editQText.value = q.question_text;
    editOptA.value = q.option_a;
    editOptB.value = q.option_b;
    editOptC.value = q.option_c;
    editOptD.value = q.option_d;
    editQCorrect.value = q.correct_option;
    editQExplanation.value = q.explanation || '';
    
    editQuestionModal.showModal();
}

// Save Question Edit Changes
async function handleQuestionEditSubmit(e) {
    e.preventDefault();
    
    const id = parseInt(editQId.value);
    const bodyData = {
        question_text: editQText.value.trim(),
        option_a: editOptA.value.trim(),
        option_b: editOptB.value.trim(),
        option_c: editOptC.value.trim(),
        option_d: editOptD.value.trim(),
        correct_option: editQCorrect.value,
        explanation: editQExplanation.value.trim()
    };
    
    try {
        const response = await fetch(`/api/questions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });
        
        if (response.ok) {
            const localQIndex = state.activeTest.questions.findIndex(q => q.id === id);
            if (localQIndex !== -1) {
                state.activeTest.questions[localQIndex] = {
                    ...state.activeTest.questions[localQIndex],
                    ...bodyData
                };
                renderTest();
                editQuestionModal.close();
                showToast("ແກ້ໄຂສຳເລັດ");
                loadDashboardStats();
            }
        } else {
            const data = await response.json();
            alert("ບໍ່ສາມາດແກ້ໄຂໄດ້: " + data.error);
        }
    } catch (error) {
        console.error("Error editing question:", error);
    }
}

// Delete individual question from current test
async function deleteQuestion(id) {
    if (confirm("ລົບຄຳຖາມຂໍ້ນີ້?")) {
        try {
            const response = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
            if (response.ok) {
                state.activeTest.questions = state.activeTest.questions.filter(q => q.id !== id);
                renderTest();
                showToast("ລົບຄຳຖາມສຳເລັດ");
                loadDashboardStats();
            } else {
                const data = await response.json();
                alert("ບໍ່ສາມາດລົບໄດ້: " + data.error);
            }
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    }
}

// Open blank modal to create question manually
function openCreateQuestionModal() {
    if (!state.activeTest) return;
    
    editQId.value = "NEW";
    editQText.value = '';
    editOptA.value = '';
    editOptB.value = '';
    editOptC.value = '';
    editOptD.value = '';
    editQCorrect.value = 'A';
    editQExplanation.value = '';
    
    editQuestionModal.showModal();
}

// Add Question Form Handler Routing
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (editQId.value === "NEW") {
        await handleAddNewQuestion();
    } else {
        await handleQuestionEditSubmit(e);
    }
}

// Handle Creating New Question
async function handleAddNewQuestion() {
    const bodyData = {
        test_id: state.activeTest.id,
        question_text: editQText.value.trim(),
        option_a: editOptA.value.trim(),
        option_b: editOptB.value.trim(),
        option_c: editOptC.value.trim(),
        option_d: editOptD.value.trim(),
        correct_option: editQCorrect.value,
        explanation: editQExplanation.value.trim()
    };
    
    try {
        const response = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });
        const data = await response.json();
        
        if (response.ok) {
            state.activeTest.questions.push({
                id: data.id,
                ...bodyData
            });
            renderTest();
            editQuestionModal.close();
            showToast("ເພີ່ມຄຳຖາມສຳເລັດ");
            loadDashboardStats();
        } else {
            alert("ບໍ່ສາມາດເພີ່ມໄດ້: " + data.error);
        }
    } catch (error) {
        console.error("Error adding question:", error);
    }
}

// Chat Interface Interactions
async function sendChatMessage() {
    if (!state.selectedSourceId) {
        alert("ກະລຸນາເລືອກ PDF ກ່ອນ!");
        return;
    }
    
    const message = chatInputField.value.trim();
    if (!message) return;
    
    chatInputField.value = '';
    appendChatBubble('user', message);
    state.chatHistory.push({ role: 'user', content: message });
    
    const loadingBubbleId = appendLoadingBubble();
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    
    const apiKey = localStorage.getItem('gemini_api_key') || '';
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source_id: state.selectedSourceId,
                message: message,
                history: state.chatHistory,
                api_key: apiKey
            })
        });
        const data = await response.json();
        
        removeLoadingBubble(loadingBubbleId);
        
        if (response.ok) {
            appendChatBubble('bot', data.response);
            state.chatHistory.push({ role: 'model', content: data.response });
        } else {
            appendChatBubble('bot', `ເກີດຂໍ້ຜິດພາດ: ${data.error}`);
        }
    } catch (error) {
        console.error("Chat network error:", error);
        removeLoadingBubble(loadingBubbleId);
        appendChatBubble('bot', "ບໍ່ສາມາດເຊື່ອມຕໍ່ໄດ້.");
    }
    
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

// Append Chat bubbles
function appendChatBubble(role, content) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role === 'user' ? 'user-message' : 'bot-message'}`;
    
    bubble.innerHTML = `<div>${formatMessageText(content)}</div>`;
    chatMessagesContainer.appendChild(bubble);
}

// Parse markdown breaks or bold highlights
function formatMessageText(text) {
    let escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/^\*\s(.*)/gm, '• $1');
    escaped = escaped.replace(/\n/g, '<br>');
    return escaped;
}

// Loading bubble
function appendLoadingBubble() {
    const id = 'loading-' + Date.now();
    const bubble = document.createElement('div');
    bubble.id = id;
    bubble.className = "chat-bubble bot-message";
    bubble.style.cssText = "max-width:70px;display:flex;align-items:center;justify-content:center;gap:6px;padding:16px";
    
    bubble.innerHTML = `
        <span style="width:6px;height:6px;background:var(--text-tertiary);border-radius:50%;animation:bounce 1s infinite;animation-delay:0s"></span>
        <span style="width:6px;height:6px;background:var(--text-tertiary);border-radius:50%;animation:bounce 1s infinite;animation-delay:0.15s"></span>
        <span style="width:6px;height:6px;background:var(--text-tertiary);border-radius:50%;animation:bounce 1s infinite;animation-delay:0.3s"></span>
    `;
    
    // Inject bounce animation if not already present
    if (!document.getElementById('bounce-style')) {
        const style = document.createElement('style');
        style.id = 'bounce-style';
        style.textContent = `@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`;
        document.head.appendChild(style);
    }
    
    chatMessagesContainer.appendChild(bubble);
    return id;
}

function removeLoadingBubble(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Event Listeners Binding Setup
function setupEventListeners() {
    
    // Source Upload
    dropzone.addEventListener('click', () => pdfFileInput.click());
    pdfFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handlePdfUpload(e.target.files[0]);
        }
    });
    
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--accent)';
        dropzone.style.background = 'var(--surface-alt)';
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = '';
        dropzone.style.background = '';
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '';
        dropzone.style.background = '';
        if (e.dataTransfer.files.length > 0) {
            handlePdfUpload(e.dataTransfer.files[0]);
        }
    });
    
    // Source delete delegation
    sourcesList.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.delete-source-btn');
        if (delBtn) {
            const id = parseInt(delBtn.getAttribute('data-id'));
            deleteSource(id);
        }
    });
    
    // Slider
    questionCountSlider.addEventListener('input', (e) => {
        state.numQuestions = parseInt(e.target.value);
        questionCountDisplay.textContent = `${state.numQuestions} ຂໍ້`;
    });
    
    // Difficulty Btns
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.difficulty = btn.getAttribute('data-diff');
        });
    });

    // Options count slider
    if (optionsCountSlider) {
        optionsCountSlider.addEventListener('input', (e) => {
            state.numOptions = parseInt(e.target.value);
            optionsCountDisplay.textContent = `${state.numOptions} ຕົວ`;
        });
    }

    // Language select
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            state.language = e.target.value;
        });
    }

    // Time limit
    if (timeLimitInput) {
        timeLimitInput.addEventListener('input', (e) => {
            state.timeLimit = parseInt(e.target.value) || 0;
        });
    }

    // Checkboxes
    if (shuffleOptionsCb) {
        shuffleOptionsCb.addEventListener('change', (e) => {
            state.shuffleOptions = e.target.checked;
        });
    }
    if (includeAnswerKeyCb) {
        includeAnswerKeyCb.addEventListener('change', (e) => {
            state.includeAnswerKey = e.target.checked;
        });
    }
    if (includeExplanationCb) {
        includeExplanationCb.addEventListener('change', (e) => {
            state.includeExplanation = e.target.checked;
        });
    }
    
    // Generate
    generateTestBtn.addEventListener('click', generateTest);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
            document.getElementById(`tab-content-${targetTab}`).classList.remove('hidden');
            if (targetTab === 'dashboard') loadDashboardStats();
        });
    });

    // Mobile Drawer - Sources
    if (toggleSourcesBtn && sourcesSidebar && drawerBackdrop) {
        toggleSourcesBtn.addEventListener('click', () => {
            sourcesSidebar.classList.add('open');
            drawerBackdrop.classList.add('active');
        });
    }
    
    // Mobile Drawer - Studio
    if (toggleStudioBtn && studioPanel && drawerBackdrop) {
        toggleStudioBtn.addEventListener('click', () => {
            studioPanel.classList.add('open');
            drawerBackdrop.classList.add('active');
        });
    }
    
    // Mobile Drawer Close - Studio
    if (closeStudioBtn && studioPanel && drawerBackdrop) {
        closeStudioBtn.addEventListener('click', () => {
            studioPanel.classList.remove('open');
            drawerBackdrop.classList.remove('active');
        });
    }
    
    // Backdrop Close
    if (drawerBackdrop && sourcesSidebar && studioPanel) {
        drawerBackdrop.addEventListener('click', () => {
            sourcesSidebar.classList.remove('open');
            studioPanel.classList.remove('open');
            drawerBackdrop.classList.remove('active');
        });
    }
    
    // Desktop Toggle Studio
    if (toggleStudioDesktopBtn && studioPanel && toggleStudioText) {
        toggleStudioDesktopBtn.addEventListener('click', () => {
            const isHidden = studioPanel.style.display === 'none';
            studioPanel.style.display = isHidden ? '' : 'none';
            toggleStudioText.textContent = isHidden ? "ເຊື່ອງແຖບຈັດການ" : "ສະແດງແຖບຈັດການ";
        });
    }
    
    // Toggle explanations
    toggleExplanationsBtn.addEventListener('click', () => {
        state.explanationsVisible = !state.explanationsVisible;
        
        const boxes = document.querySelectorAll('.explanation-box');
        if (state.explanationsVisible) {
            boxes.forEach(box => box.classList.remove('hidden'));
            toggleExplanationsBtn.innerHTML = `<i class="fa-solid fa-eye-slash"></i> ເຊື່ອງຄຳອະທິບາຍ`;
        } else {
            boxes.forEach(box => box.classList.add('hidden'));
            toggleExplanationsBtn.innerHTML = `<i class="fa-solid fa-eye"></i> ສະແດງຄຳອະທິບາຍ`;
        }
    });
    
    // Add Question
    addNewQBtn.addEventListener('click', openCreateQuestionModal);
    
    // Question Form
    editQuestionForm.addEventListener('submit', handleFormSubmit);
    
    // Modal controls
    closeEditQBtn.addEventListener('click', () => editQuestionModal.close());
    cancelEditQBtn.addEventListener('click', () => editQuestionModal.close());
    
    // Settings
    settingsBtn.addEventListener('click', () => settingsModal.showModal());
    closeSettingsBtn.addEventListener('click', () => settingsModal.close());
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Sync Exam preview labels
    schoolNameInput.addEventListener('input', (e) => {
        previewSchoolTitle.textContent = e.target.value.trim() || 'ໂຮງຮຽນ ມັດທະຍົມສົມບູນ...';
    });
    subjectNameInput.addEventListener('input', (e) => {
        previewExamSubject.textContent = `ບົດສອບເສັງ ${e.target.value.trim() || 'ວິຊາ: ບົດຮຽນທົ່ວໄປ'}`;
    });
    
    // Chat
    chatInputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
    sendChatBtn.addEventListener('click', sendChatMessage);
    
    // Exports
    exportPdfBtn.addEventListener('click', downloadPdfClient);
    exportDocxBtn.addEventListener('click', downloadDocxBackend);
    exportPngBtn.addEventListener('click', downloadPngClient);

    // Auth Tab Switching
    if (authTabLogin && authTabRegister && loginForm && registerForm) {
        authTabLogin.addEventListener('click', () => {
            authTabLogin.classList.add('active');
            authTabRegister.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        });

        authTabRegister.addEventListener('click', () => {
            authTabRegister.classList.add('active');
            authTabLogin.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });
    }

    // Auth Event Handlers
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (guestLoginBtn) guestLoginBtn.addEventListener('click', handleGuestLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

// PDF Export
function downloadPdfClient() {
    if (!state.activeTest) return;
    
    const element = document.getElementById('print-sheet');
    const filenameSafe = state.activeTest.title.replace(/[^a-zA-Z0-9\u0e80-\u0eff]/g, '_');
    
    const opt = {
        margin:       12,
        filename:     `test_${filenameSafe}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    showToast("ກຳລັງສ້າງ PDF...");
    html2pdf().from(element).set(opt).save().then(() => {
        showToast("ດາວໂຫລດ PDF ສຳເລັດ");
    }).catch(err => {
        console.error("PDF export error:", err);
        alert("ເກີດຂໍ້ຜິດພາດ");
    });
}

// DOCX Export
function downloadDocxBackend() {
    if (!state.activeTest) return;
    showToast("ກຳລັງດາວໂຫລດ Word...");
    window.location.href = `/api/tests/${state.activeTest.id}/export/docx`;
}

// PNG Export
function downloadPngClient() {
    if (!state.activeTest) return;
    
    const element = document.getElementById('print-sheet');
    const filenameSafe = state.activeTest.title.replace(/[^a-zA-Z0-9\u0e80-\u0eff]/g, '_');
    
    showToast("ກຳລັງແປງເປັນ PNG...");
    
    html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `test_${filenameSafe}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast("ດາວໂຫລດ PNG ສຳເລັດ");
    }).catch(err => {
        console.error("PNG export error:", err);
        alert("ເກີດຂໍ້ຜິດພາດ");
    });
}

// Toast Notifications
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = "toast";
    toast.style.transform = 'translateY(12px)';
    toast.style.opacity = '0';
    toast.innerHTML = `<i class="fa-solid fa-check-circle" style="opacity:0.7"></i> <span>${message}</span>`;
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });
    
    setTimeout(() => {
        toast.style.transform = 'translateY(12px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
