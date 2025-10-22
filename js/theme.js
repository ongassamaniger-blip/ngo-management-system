// TEMA YÖNETİMİ - Dark Mode

// Mevcut temayı kontrol et
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    updateThemeButton(savedTheme);
}

// Tema uygula
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
}

// Tema değiştir
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    updateThemeButton(newTheme);
    showToast(`${newTheme === 'dark' ? '🌙 Dark' : '☀️ Light'} mode aktif`, 'success');
}

// Tema butonunu güncelle
function updateThemeButton(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    
    if (theme === 'dark') {
        btn.innerHTML = '<i class="fas fa-sun text-xl"></i>';
    } else {
        btn.innerHTML = '<i class="fas fa-moon text-xl"></i>';
    }
}

// Global export
window.ThemeModule = {
    initTheme,
    toggleTheme
};