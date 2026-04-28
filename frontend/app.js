/* ===== Shared app.js — loaded on every page ===== */

const API_BASE = 'https://daily-task-reminder-api.onrender.com/api';

// ── Theme ──────────────────────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = saved ? saved === 'dark' : prefersDark;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = `<span class="nav-icon">${next === 'dark' ? '☀️' : '🌙'}</span> ${next === 'dark' ? 'Light Mode' : 'Dark Mode'}`;
}

// ── API helper ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Auth guards ────────────────────────────────────────────────────────────
function requireAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
  }
}

function redirectIfLoggedIn() {
  if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
  }
}

// ── Toast ──────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.className = `show toast-${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = ''; }, 4000);
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function initSidebar(activePage) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Set user info
  const nameEl = document.getElementById('sidebar-name');
  const emailEl = document.getElementById('sidebar-email');
  if (nameEl) nameEl.textContent = user.name || '';
  if (emailEl) emailEl.textContent = user.email || '';

  // Active nav link
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.dataset.page === activePage) link.classList.add('active');
  });

  // Theme toggle label
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeBtn.innerHTML = `<span class="nav-icon">${dark ? '☀️' : '🌙'}</span> ${dark ? 'Light Mode' : 'Dark Mode'}`;
    themeBtn.onclick = toggleTheme;
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    };
  }

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (hamburger && sidebar) {
    hamburger.onclick = () => {
      sidebar.classList.toggle('open');
      overlay && overlay.classList.toggle('show');
    };
    overlay && (overlay.onclick = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
}

// ── Notifications ──────────────────────────────────────────────────────────
async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const p = await Notification.requestPermission();
  return p === 'granted';
}

function showNotification(title, body) {
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '/favicon.ico' });
}

function scheduleTaskReminders(tasks) {
  tasks.forEach(task => {
    if (task.status === 'completed') return;
    const dueTime = new Date(task.dueDate).getTime();
    const now = Date.now();
    const reminderTime = dueTime - 15 * 60 * 1000;
    if (reminderTime > now) {
      setTimeout(() => showNotification(`⏰ Due Soon: ${task.title}`, `Due in 15 minutes — Priority: ${task.priority}`), reminderTime - now);
    }
    if (dueTime > now) {
      setTimeout(() => showNotification(`🚨 Overdue: ${task.title}`, 'This task is now overdue!'), dueTime - now);
    }
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    month: 'short', day: 'numeric', year: 'numeric', 
    hour: 'numeric', minute: '2-digit',
    hour12: true
  });
}

function isToday(dateStr) {
  const d = new Date(new Date(dateStr).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isPast(dateStr) {
  return new Date(dateStr) < new Date();
}

function toDatetimeLocal(dateStr) {
  // Convert UTC date to IST for datetime-local input
  const d = new Date(new Date(dateStr).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Run theme immediately
initTheme();
