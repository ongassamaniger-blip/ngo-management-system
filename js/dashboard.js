// ==================== DASHBOARD TAM VERSİYON ====================

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    await initDashboard();
});

async function initDashboard() {
    // Loading göster
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.classList.remove('hidden');

    try {
        // Auth kontrolü
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            window.location.href = 'login.html';
            return;
        }

        // Kullanıcı bilgilerini yükle
        await loadUserInfo(session.user);

        // Verileri yükle
        await loadAllData();

        // Temayı başlat
        if (window.ThemeModule) {
            window.ThemeModule.initTheme();
        }

        // Dili başlat
        if (window.i18n) {
            window.i18n.initLanguage();
        }

        // Event listener'ları kur
        setupEventListeners();
        
    } catch (error) {
        console.error('Dashboard yükleme hatası:', error);
        showToast('Bir hata oluştu, lütfen sayfayı yenileyin', 'error');
    } finally {
        // Loading gizle
        setTimeout(() => {
            if (loading) loading.classList.add('hidden');
        }, 500);
    }
}

// Kullanıcı bilgileri
async function loadUserInfo(user) {
    const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

    if (userData) {
        const initials = userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
        document.getElementById('userInitials').textContent = initials;
        document.getElementById('userName').textContent = userData.full_name;
        
        const roleNames = {
            'admin': 'Yönetici',
            'finance_manager': 'Mali Müdür',
            'project_manager': 'Proje Müdürü',
            'user': 'Kullanıcı'
        };
        document.getElementById('userRole').textContent = roleNames[userData.role] || 'Kullanıcı';
    }
}

// Tüm verileri yükle
async function loadAllData() {
    await Promise.all([
        loadDashboardStats(),
        loadRecentTransactions(),
        loadFacilities(),
        loadProjects(),
        loadSacrifices(),
        loadPersonnel()
    ]);
    
    // Grafikleri yükle
    if (window.ChartsModule) {
        await window.ChartsModule.initCharts();
    }
}

// Dashboard istatistikleri (Animasyonlu)
async function loadDashboardStats() {
    const stats = await window.FinanceModule.getFinanceStats();

    // Animasyonlu sayı güncelleme
    animateValue('totalIncome', 0, stats.totalIncome, 1000);
    animateValue('totalExpense', 0, stats.totalExpense, 1000);
    animateValue('balance', 0, stats.balance, 1000);

    const facilities = await window.FacilityModule.getFacilities();
    animateValue('totalFacilities', 0, facilities.length, 800, false);
}

// Sayı animasyonu
function animateValue(elementId, start, end, duration, isCurrency = true) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        element.textContent = isCurrency ? formatCurrency(current) : Math.floor(current);
    }, 16);
}

// Son işlemler
async function loadRecentTransactions() {
    const transactions = await window.FinanceModule.getTransactions({ limit: 10 });
    
    const container = document.getElementById('recentTransactions');
    const allContainer = document.getElementById('allTransactions');
    
    if (!transactions || transactions.length === 0) {
        const emptyMsg = '<p class="text-gray-500 text-center py-8">Henüz işlem yok</p>';
        if (container) container.innerHTML = emptyMsg;
        if (allContainer) allContainer.innerHTML = emptyMsg;
        return;
    }

    const html = transactions.slice(0, 5).map(t => createTransactionCard(t)).join('');
    const allHtml = transactions.map(t => createTransactionCard(t)).join('');
    
    if (container) container.innerHTML = html;
    if (allContainer) allContainer.innerHTML = allHtml;
}

// İşlem kartı oluştur
function createTransactionCard(t) {
    const isIncome = t.type === 'income';
    return `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div class="flex items-center">
                <div class="w-10 h-10 ${isIncome ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center mr-3">
                    <i class="fas fa-${isIncome ? 'arrow-down' : 'arrow-up'} ${isIncome ? 'text-green-600' : 'text-red-600'}"></i>
                </div>
                <div>
                    <p class="font-semibold text-gray-800">${t.title}</p>
                    <p class="text-xs text-gray-500">${formatDate(t.transaction_date)} • ${t.category}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}">
                    ${isIncome ? '+' : '-'}${formatCurrency(Math.abs(t.amount))}
                </p>
                <span class="text-xs px-2 py-1 ${getStatusBadgeClass(t.status)} rounded-full">
                    ${getStatusText(t.status)}
                </span>
            </div>
        </div>
    `;
}

// Tesisler
async function loadFacilities() {
    const facilities = await window.FacilityModule.getFacilities();
    const container = document.getElementById('facilitiesList');
    
    if (!container) return;
    
    if (!facilities || facilities.length === 0) {
        container.innerHTML = '<p class="text-gray-500 col-span-3 text-center py-8">Henüz tesis yok</p>';
        return;
    }

    container.innerHTML = facilities.map(f => `
        <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition cursor-pointer">
            <div class="flex items-center justify-between mb-4">
                <h4 class="font-bold text-gray-800 text-lg">${f.name}</h4>
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Aktif</span>
            </div>
            <div class="space-y-2 text-sm text-gray-600">
                <p><i class="fas fa-map-marker-alt mr-2 text-gray-400"></i>${f.city}, ${f.country}</p>
                <p><i class="fas fa-calendar mr-2 text-gray-400"></i>Kuruluş: ${new Date(f.established_date).getFullYear()}</p>
                <p><i class="fas fa-wallet mr-2 text-gray-400"></i>${formatCurrency(f.monthly_budget)}/ay</p>
            </div>
            <button onclick="viewFacilityDetail('${f.id}')" class="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
                <i class="fas fa-eye mr-2"></i>Detay Gör
            </button>
        </div>
    `).join('');
}

// Projeler
async function loadProjects() {
    const projects = await window.ProjectModule.getProjects();
    const container = document.getElementById('projectsList');
    
    if (!container) return;
    
    if (!projects || projects.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Henüz proje yok</p>';
        return;
    }

    container.innerHTML = projects.map(p => `
        <div class="border-l-4 border-${getProjectColor(p.status)}-500 bg-white rounded-lg shadow p-6 mb-4 hover:shadow-xl transition">
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-bold text-gray-800 text-lg">${p.name}</h4>
                <span class="px-3 py-1 bg-${getProjectColor(p.status)}-100 text-${getProjectColor(p.status)}-800 rounded-full text-xs font-semibold">
                    ${getProjectStatusText(p.status)}
                </span>
            </div>
            <div class="mb-4">
                <div class="flex items-center justify-between text-sm mb-2">
                    <span class="text-gray-600">İlerleme</span>
                    <span class="font-semibold text-${getProjectColor(p.status)}-600">${p.progress}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-gradient-to-r from-${getProjectColor(p.status)}-500 to-${getProjectColor(p.status)}-700 h-2 rounded-full transition-all duration-500" style="width: ${p.progress}%"></div>
                </div>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span><i class="fas fa-calendar mr-1"></i>${formatDate(p.start_date)}</span>
                <span><i class="fas fa-wallet mr-1"></i>${formatCurrency(p.budget)}</span>
            </div>
            <button onclick="viewProjectDetail('${p.id}')" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                <i class="fas fa-eye mr-2"></i>Detay Gör
            </button>
        </div>
    `).join('');
}

// Kurban kayıtları
async function loadSacrifices() {
    const sacrifices = await window.SacrificeModule.getSacrifices();
    const container = document.getElementById('sacrificesList');
    
    if (!container) return;
    
    if (!sacrifices || sacrifices.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Henüz kurban kaydı yok</p>';
        return;
    }

    container.innerHTML = sacrifices.map(s => `
        <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <span class="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold mr-2">${s.code}</span>
                        <span class="px-2 py-1 bg-${getSacrificeStatusColor(s.sacrifice_status)}-100 text-${getSacrificeStatusColor(s.sacrifice_status)}-800 rounded text-xs">${getSacrificeStatusText(s.sacrifice_status)}</span>
                    </div>
                    <p class="font-semibold text-gray-800">${s.donor_name}</p>
                    <p class="text-sm text-gray-500">${s.donor_phone} • ${s.sacrifice_type}</p>
                    <p class="text-xs text-gray-400 mt-1">Kesim: ${formatDate(s.sacrifice_date)}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold text-orange-600 text-lg">${formatCurrency(s.amount)}</p>
                    <span class="text-xs px-2 py-1 ${s.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} rounded-full">
                        ${s.payment_status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Personel
async function loadPersonnel() {
    const personnel = await window.PersonnelModule.getPersonnel();
    const container = document.getElementById('personnelList');
    
    if (!container) return;
    
    if (!personnel || personnel.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Henüz personel kaydı yok</p>';
        return;
    }

    container.innerHTML = personnel.map(p => `
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-3 hover:bg-gray-50 transition">
            <div class="flex items-center">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    ${p.users?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}
                </div>
                <div>
                    <p class="font-semibold text-gray-800">${p.users?.full_name || 'N/A'}</p>
                    <p class="text-sm text-gray-500">${p.position} • ${p.facilities?.name || 'N/A'}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold text-gray-800">${formatCurrency(p.salary)}</p>
                <span class="text-xs px-2 py-1 ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} rounded-full">
                    ${p.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
            </div>
        </div>
    `).join('');
}

// Event Listeners
function setupEventListeners() {
    // Menü navigasyonu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });

    // Çıkış butonu
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });

    // Form submit'leri
    setupFormHandlers();
    
    // Global arama
    setupGlobalSearch();
    
    // Bildirimleri yükle
    loadNotifications();
    
    // Ayarlar event'leri
    setupAyarlarHandlers();
}

// Sayfa navigasyonu
function navigateToPage(page) {
    // Menü aktifliği
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    const menuItem = document.querySelector(`[data-page="${page}"]`);
    if (menuItem) menuItem.classList.add('active');

    // Sayfa görünürlüğü
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    const pageContent = document.getElementById(`${page}-page`);
    if (pageContent) pageContent.classList.add('active');

    // Başlık güncelle
    const titles = {
        'dashboard': ['Dashboard', 'Genel Bakış'],
        'finans': ['Finans', 'Gelir ve Gider Yönetimi'],
        'tesisler': ['Tesisler', 'Tesis Yönetimi'],
        'projeler': ['Projeler', 'Proje Takip Sistemi'],
        'kurban': ['Kurban', 'Kurban Yönetimi'],
        'personel': ['Personel', 'Personel Yönetimi'],
        'formbuilder': ['Form Builder', 'Sistem Formlarını Özelleştir'],
        'ayarlar': ['Ayarlar', 'Sistem Ayarları']
    };
    
    if (titles[page]) {
        document.getElementById('pageTitle').textContent = titles[page][0];
        document.getElementById('pageSubtitle').textContent = titles[page][1];
    }
    
    // Sayfa özel yüklemeleri
    if (page === 'ayarlar') {
        setTimeout(() => {
            loadAyarlarData();
        }, 100);
    }
}

// Form işleyicileri
function setupFormHandlers() {
    // Gelir formu
    const incomeForm = document.getElementById('incomeForm');
    if (incomeForm) {
        incomeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const result = await window.FinanceModule.addIncome({
                title: incomeForm.querySelector('input[type="text"]').value,
                amount: incomeForm.querySelector('input[type="number"]').value,
                category: incomeForm.querySelector('select').value.toLowerCase()
            });

            if (result.success) {
                showToast('Gelir başarıyla kaydedildi!', 'success');
                closeModal('incomeModal');
                incomeForm.reset();
                await loadAllData();
            } else {
                showToast('Hata oluştu: ' + (result.error?.message || 'Bilinmeyen hata'), 'error');
            }
        });
    }

    // Gider formu
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const result = await window.FinanceModule.addExpense({
                title: expenseForm.querySelector('input[type="text"]').value,
                amount: expenseForm.querySelector('input[type="number"]').value,
                category: expenseForm.querySelector('select').value.toLowerCase()
            });

            if (result.success) {
                showToast('Gider başarıyla kaydedildi!', 'success');
                closeModal('expenseModal');
                expenseForm.reset();
                await loadAllData();
            } else {
                showToast('Hata oluştu: ' + (result.error?.message || 'Bilinmeyen hata'), 'error');
            }
        });
    }

    // Proje formu
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = projectForm.querySelectorAll('input');
            
            const result = await window.ProjectModule.createProject({
                name: inputs[0].value,
                budget: inputs[1].value,
                startDate: inputs[2].value,
                category: 'humanitarian_aid',
                description: 'Yeni proje'
            });

            if (result.success) {
                showToast('Proje başarıyla oluşturuldu!', 'success');
                closeModal('projectModal');
                projectForm.reset();
                await loadAllData();
            } else {
                showToast('Hata oluştu: ' + (result.error?.message || 'Bilinmeyen hata'), 'error');
            }
        });
    }

    // Kurban formu
    const sacrificeForm = document.getElementById('sacrificeForm');
    if (sacrificeForm) {
        sacrificeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = sacrificeForm.querySelectorAll('input, select');
            
            const result = await window.SacrificeModule.createSacrifice({
                donorName: inputs[0].value,
                donorPhone: inputs[1].value,
                amount: inputs[2].value,
                sacrificeType: inputs[3].value,
                animalType: 'sheep',
                sacrificeDate: new Date().toISOString().split('T')[0],
                paymentStatus: 'paid'
            });

            if (result.success) {
                showToast('Kurban kaydı başarıyla oluşturuldu!', 'success');
                closeModal('sacrificeModal');
                sacrificeForm.reset();
                await loadAllData();
            } else {
                showToast('Hata oluştu: ' + (result.error?.message || 'Bilinmeyen hata'), 'error');
            }
        });
    }

    // Yeni kullanıcı formu
    const newUserForm = document.getElementById('newUserForm');
    if (newUserForm) {
        newUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = newUserForm.querySelectorAll('input, select');
            
            const result = await window.ProfileModule.addNewUser({
                fullName: inputs[0].value,
                email: inputs[1].value,
                phone: inputs[2].value,
                password: inputs[3].value,
                role: inputs[4].value
            });

            if (result.success) {
                showToast('Kullanıcı başarıyla eklendi!', 'success');
                closeModal('newUserModal');
                newUserForm.reset();
                loadAyarlarUsersData();
            } else {
                showToast('Kullanıcı eklenemedi: ' + (result.error.message || 'Bilinmeyen hata'), 'error');
            }
        });
    }
}

// Modal fonksiyonları
window.openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};
// Toast bildirimi
function showToast(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-xl z-50 animate-fade-in`;
    toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Yardımcı fonksiyonlar
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0
    }).format(amount || 0);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getStatusBadgeClass(status) {
    const classes = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'approved': 'bg-green-100 text-green-800',
        'paid': 'bg-blue-100 text-blue-800',
        'rejected': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status) {
    const texts = {
        'pending': 'Bekliyor',
        'approved': 'Onaylandı',
        'paid': 'Ödendi',
        'rejected': 'Reddedildi'
    };
    return texts[status] || status;
}

function getProjectColor(status) {
    const colors = {
        'planning': 'yellow',
        'active': 'blue',
        'review': 'purple',
        'completed': 'green'
    };
    return colors[status] || 'gray';
}

function getProjectStatusText(status) {
    const texts = {
        'planning': 'Planlama',
        'active': 'Devam Ediyor',
        'review': 'İnceleme',
        'completed': 'Tamamlandı'
    };
    return texts[status] || status;
}

function getSacrificeStatusColor(status) {
    const colors = {
        'registered': 'yellow',
        'scheduled': 'blue',
        'completed': 'green'
    };
    return colors[status] || 'gray';
}

function getSacrificeStatusText(status) {
    const texts = {
        'registered': 'Kayıtlı',
        'scheduled': 'Planlandı',
        'completed': 'Kesildi'
    };
    return texts[status] || status;
}

function getRoleTextForTable(role) {
    const roles = {
        'admin': 'Yönetici',
        'finance_manager': 'Mali Müdür',
        'project_manager': 'Proje Müdürü',
        'user': 'Kullanıcı'
    };
    return roles[role] || 'Kullanıcı';
}

// Tesis detayını göster
window.viewFacilityDetail = function(facilityId) {
    window.location.href = `facility-detail.html?id=${facilityId}`;
};

// Proje detayını göster
window.viewProjectDetail = function(projectId) {
    window.location.href = `project-detail.html?id=${projectId}`;
};

// ==================== FİLTRELEME VE RAPORLAMA ====================

let currentFilters = {};

// Filtreleri uygula
window.applyFilters = async function() {
    const type = document.getElementById('filterType')?.value;
    const status = document.getElementById('filterStatus')?.value;
    const startDate = document.getElementById('filterStartDate')?.value;
    const endDate = document.getElementById('filterEndDate')?.value;

    currentFilters = {};
    if (type) currentFilters.type = type;
    if (status) currentFilters.status = status;
    if (startDate) currentFilters.startDate = startDate;
    if (endDate) currentFilters.endDate = endDate;

    await loadFilteredTransactions();
    await updateFinanceStats();
};

// Filtreleri temizle
window.clearFilters = async function() {
    currentFilters = {};
    
    if (document.getElementById('filterType')) document.getElementById('filterType').value = '';
    if (document.getElementById('filterStatus')) document.getElementById('filterStatus').value = '';
    if (document.getElementById('filterStartDate')) document.getElementById('filterStartDate').value = '';
    if (document.getElementById('filterEndDate')) document.getElementById('filterEndDate').value = '';

    await loadFilteredTransactions();
    await updateFinanceStats();
};

// Filtrelenmiş işlemleri yükle
async function loadFilteredTransactions() {
    const transactions = await window.FinanceModule.getTransactions(currentFilters);
    
    const container = document.getElementById('allTransactions');
    if (!container) return;
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Sonuç bulunamadı</p>';
        return;
    }

    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="border-b-2 border-gray-200">
                        <th class="text-left py-3 px-4 text-gray-600 font-semibold">Tarih</th>
                        <th class="text-left py-3 px-4 text-gray-600 font-semibold">Başlık</th>
                        <th class="text-left py-3 px-4 text-gray-600 font-semibold">Kategori</th>
                        <th class="text-left py-3 px-4 text-gray-600 font-semibold">Tür</th>
                        <th class="text-right py-3 px-4 text-gray-600 font-semibold">Tutar</th>
                        <th class="text-center py-3 px-4 text-gray-600 font-semibold">Durum</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td class="py-3 px-4 text-sm text-gray-600">${formatDate(t.transaction_date)}</td>
                            <td class="py-3 px-4 text-sm font-semibold text-gray-800">${t.title}</td>
                            <td class="py-3 px-4 text-sm text-gray-600">${t.category}</td>
                            <td class="py-3 px-4">
                                <span class="px-2 py-1 ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded text-xs font-semibold">
                                    ${t.type === 'income' ? 'Gelir' : 'Gider'}
                                </span>
                            </td>
                            <td class="py-3 px-4 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                                ${t.type === 'income' ? '+' : '-'}${formatCurrency(Math.abs(t.amount))}
                            </td>
                            <td class="py-3 px-4 text-center">
                                <span class="px-2 py-1 ${getStatusBadgeClass(t.status)} rounded-full text-xs font-semibold">
                                    ${getStatusText(t.status)}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Finans istatistiklerini güncelle
async function updateFinanceStats() {
    const stats = await window.FinanceModule.getFinanceStats(currentFilters);

    const incomeEl = document.getElementById('financeIncome');
    const expenseEl = document.getElementById('financeExpense');
    const balanceEl = document.getElementById('financeBalance');
    const incomeCountEl = document.getElementById('incomeCount');
    const expenseCountEl = document.getElementById('expenseCount');

    if (incomeEl) incomeEl.textContent = formatCurrency(stats.totalIncome);
    if (expenseEl) expenseEl.textContent = formatCurrency(stats.totalExpense);
    if (balanceEl) balanceEl.textContent = formatCurrency(stats.balance);
    if (incomeCountEl) incomeCountEl.textContent = stats.incomeCount;
    if (expenseCountEl) expenseCountEl.textContent = stats.expenseCount;
}

// Excel raporu indir
window.exportReport = async function() {
    const transactions = await window.FinanceModule.getTransactions(currentFilters);
    
    if (!transactions || transactions.length === 0) {
        showToast('Export edilecek veri yok', 'error');
        return;
    }

    window.FinanceModule.exportToCSV(transactions);
    showToast('Rapor indiriliyor...', 'success');
};

// PDF raporu indir
window.exportPDF = async function() {
    const transactions = await window.FinanceModule.getTransactions(currentFilters);
    
    if (!transactions || transactions.length === 0) {
        showToast('Export edilecek veri yok', 'error');
        return;
    }

    showToast('PDF oluşturuluyor...', 'info');
    
    try {
        await window.PDFModule.generatePDFReport(currentFilters);
        showToast('PDF başarıyla indirildi!', 'success');
    } catch (error) {
        console.error('PDF oluşturma hatası:', error);
        showToast('PDF oluşturulurken hata oluştu', 'error');
    }
};

// ==================== BİLDİRİM SİSTEMİ ====================

let notificationsOpen = false;

// Bildirimleri yükle
async function loadNotifications() {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.session.user.email)
        .single();

    if (!user) return;

    const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

    updateNotificationBadge(notifications);
    renderNotifications(notifications);
}

// Bildirim badge'ini güncelle
function updateNotificationBadge(notifications) {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;

    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Bildirimleri render et
function renderNotifications(notifications) {
    const container = document.getElementById('notificationList');
    if (!container) return;

    if (!notifications || notifications.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8 text-sm">Henüz bildirim yok</p>';
        return;
    }

    container.innerHTML = notifications.map(n => `
        <div class="p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${n.is_read ? 'opacity-60' : 'bg-blue-50'}" onclick="markAsRead('${n.id}')">
            <div class="flex items-start">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getNotificationIconBg(n.type)}">
                    <i class="fas ${getNotificationIcon(n.type)} ${getNotificationIconColor(n.type)}"></i>
                </div>
                <div class="flex-1">
                    <p class="font-semibold text-gray-800 text-sm">${n.title}</p>
                    <p class="text-xs text-gray-600 mt-1">${n.message}</p>
                    <p class="text-xs text-gray-400 mt-2">${formatTimeAgo(n.created_at)}</p>
                </div>
                ${!n.is_read ? '<div class="w-2 h-2 bg-blue-500 rounded-full"></div>' : ''}
            </div>
        </div>
    `).join('');
}

// Bildirim modalını aç/kapat
window.toggleNotifications = function() {
    const modal = document.getElementById('notificationModal');
    if (!modal) return;

    notificationsOpen = !notificationsOpen;

    if (notificationsOpen) {
        modal.classList.remove('hidden');
        loadNotifications();
    } else {
        modal.classList.add('hidden');
    }
};

// Bildirimleri kapat
window.closeNotifications = function() {
    const modal = document.getElementById('notificationModal');
    if (modal) modal.classList.add('hidden');
    notificationsOpen = false;
};

// Bildirimi okundu işaretle
window.markAsRead = async function(notificationId) {
    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    await loadNotifications();
};

// Tümünü okundu işaretle
window.markAllAsRead = async function() {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.session.user.email)
        .single();

    if (!user) return;

    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    await loadNotifications();
    showToast('Tüm bildirimler okundu işaretlendi', 'success');
};

// Bildirim ikonu
function getNotificationIcon(type) {
    const icons = {
        'info': 'fa-info-circle',
        'success': 'fa-check-circle',
        'warning': 'fa-exclamation-triangle',
        'error': 'fa-times-circle'
    };
    return icons[type] || 'fa-bell';
}

// Bildirim ikon arkaplanı
function getNotificationIconBg(type) {
    const colors = {
        'info': 'bg-blue-100',
        'success': 'bg-green-100',
        'warning': 'bg-yellow-100',
        'error': 'bg-red-100'
    };
    return colors[type] || 'bg-gray-100';
}

// Bildirim ikon rengi
function getNotificationIconColor(type) {
    const colors = {
        'info': 'text-blue-600',
        'success': 'text-green-600',
        'warning': 'text-yellow-600',
        'error': 'text-red-600'
    };
    return colors[type] || 'text-gray-600';
}

// Zaman farkı hesapla
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return formatDate(dateString);
}

// ==================== GLOBAL ARAMA ====================

let searchTimeout;

// Arama event listener'ını kur
function setupGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performGlobalSearch(e.target.value);
        }, 300);
    });
}

// Global arama yap
async function performGlobalSearch(query) {
    if (!query || query.length < 2) return;

    const lowerQuery = query.toLowerCase();

    // İşlemlerde ara
    const transactions = await window.FinanceModule.getTransactions();
    const matchingTransactions = transactions.filter(t => 
        t.title.toLowerCase().includes(lowerQuery) ||
        t.category.toLowerCase().includes(lowerQuery)
    );

    // Tesislerde ara
    const facilities = await window.FacilityModule.getFacilities();
    const matchingFacilities = facilities.filter(f => 
        f.name.toLowerCase().includes(lowerQuery) ||
        f.city.toLowerCase().includes(lowerQuery) ||
        f.country.toLowerCase().includes(lowerQuery)
    );

    // Projelerde ara
    const projects = await window.ProjectModule.getProjects();
    const matchingProjects = projects.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery))
    );

    // Sonuçları göster
    showSearchResults(matchingTransactions, matchingFacilities, matchingProjects);
}

// Arama sonuçlarını göster
function showSearchResults(transactions, facilities, projects) {
    const totalResults = transactions.length + facilities.length + projects.length;

    if (totalResults === 0) {
        showToast('Sonuç bulunamadı', 'info');
        return;
    }

    let message = `${totalResults} sonuç bulundu: `;
    if (transactions.length > 0) message += `${transactions.length} işlem `;
    if (facilities.length > 0) message += `${facilities.length} tesis `;
    if (projects.length > 0) message += `${projects.length} proje`;

    showToast(message, 'success');
}

// ==================== KLAVYE KISAYOLLARI ====================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd tuşu ile kombinasyonlar
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'k': // Ctrl+K: Arama
                e.preventDefault();
                document.getElementById('globalSearch')?.focus();
                break;
            case 'n': // Ctrl+N: Yeni Gelir
                e.preventDefault();
                openModal('incomeModal');
                break;
            case 'e': // Ctrl+E: Yeni Gider
                e.preventDefault();
                openModal('expenseModal');
                break;
            case 'b': // Ctrl+B: Bildirimler
                e.preventDefault();
                toggleNotifications();
                break;
        }
    }

    // Escape: Modal'ları kapat
    if (e.key === 'Escape') {
        closeAllModals();
    }

    // Alt tuşları: Hızlı sayfa geçişi
    if (e.altKey) {
        const pages = ['dashboard', 'finans', 'tesisler', 'projeler', 'kurban', 'personel'];
        const keyNum = parseInt(e.key);
        if (keyNum >= 1 && keyNum <= pages.length) {
            e.preventDefault();
            navigateToPage(pages[keyNum - 1]);
        }
    }
});

// Tüm modal'ları kapat
function closeAllModals() {
    ['incomeModal', 'expenseModal', 'projectModal', 'sacrificeModal', 'notificationModal', 'newUserModal', 'templatesModal', 'previewModal', 'exportModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && !modal.classList.contains('hidden')) {
            closeModal(modalId);
        }
    });
    closeNotifications();
}
// ==================== AYARLAR YÖNETİMİ ====================

// Ayarlar event handler'larını kur
function setupAyarlarHandlers() {
    // Profil formu (Ayarlar)
    const ayarlarProfilForm = document.getElementById('ayarlarProfilForm');
    if (ayarlarProfilForm) {
        ayarlarProfilForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const result = await window.ProfileModule.updateProfile({
                fullName: document.getElementById('ayarlarFullName').value,
                phone: document.getElementById('ayarlarPhone').value
            });

            if (result.success) {
                showToast('Profil başarıyla güncellendi!', 'success');
                await loadAyarlarData();
            } else {
                showToast('Profil güncellenemedi!', 'error');
            }
        });
    }
}

// Ayarlar verilerini yükle
async function loadAyarlarData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single();

    if (userData) {
        const initials = userData.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        // Profil tab verileri
        if (document.getElementById('ayarlarAvatar')) {
            document.getElementById('ayarlarAvatar').textContent = initials;
        }
        if (document.getElementById('ayarlarUserName')) {
            document.getElementById('ayarlarUserName').textContent = userData.full_name;
        }
        if (document.getElementById('ayarlarUserEmail')) {
            document.getElementById('ayarlarUserEmail').textContent = userData.email;
        }
        if (document.getElementById('ayarlarFullName')) {
            document.getElementById('ayarlarFullName').value = userData.full_name;
        }
        if (document.getElementById('ayarlarPhone')) {
            document.getElementById('ayarlarPhone').value = userData.phone || '';
        }
    }

    // İlk yüklemede profil tab'ını göster
    const firstTab = document.querySelector('.ayarlar-tab-btn');
    if (firstTab && !document.querySelector('.ayarlar-tab-btn.active')) {
        firstTab.click();
    }
}

// Ayarlar tab değiştirme
window.showAyarlarTab = function(tabId) {
    // Tüm tab içeriklerini gizle
    document.querySelectorAll('.ayarlar-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Seçili tab'ı göster
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // Tab butonlarını güncelle
    document.querySelectorAll('.ayarlar-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('text-gray-700');
        btn.classList.remove('text-white');
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
        event.currentTarget.classList.remove('text-gray-700');
        event.currentTarget.classList.add('text-white');
    }
    
    // Tab'a özel veri yükleme
    if (tabId === 'kullanici-ayarlar') {
        loadAyarlarUsersData();
    }
};

// Kullanıcılar verilerini yükle (Ayarlar)
async function loadAyarlarUsersData() {
    const users = await window.ProfileModule.getUsersList();
    const container = document.getElementById('ayarlarUsersList');
    
    if (!container) return;
    
    if (!users || users.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Henüz kullanıcı yok</p>';
        return;
    }

    container.innerHTML = `
        <table class="w-full">
            <thead>
                <tr class="border-b-2 border-gray-200">
                    <th class="text-left py-3 px-4">Ad Soyad</th>
                    <th class="text-left py-3 px-4">E-posta</th>
                    <th class="text-left py-3 px-4">Telefon</th>
                    <th class="text-left py-3 px-4">Rol</th>
                    <th class="text-center py-3 px-4">İşlemler</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(u => `
                    <tr class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="py-3 px-4 font-semibold">${u.full_name}</td>
                        <td class="py-3 px-4 text-sm">${u.email}</td>
                        <td class="py-3 px-4 text-sm">${u.phone || '-'}</td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                                ${getRoleTextForTable(u.role)}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <button onclick="deleteUserConfirm('${u.id}')" class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Kullanıcı silme onayı
window.deleteUserConfirm = function(userId) {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
        deleteUserAction(userId);
    }
};

// Kullanıcı silme işlemi
async function deleteUserAction(userId) {
    const result = await window.ProfileModule.deleteUser(userId);
    
    if (result.success) {
        showToast('Kullanıcı başarıyla silindi!', 'success');
        await loadAyarlarUsersData();
    } else {
        showToast('Kullanıcı silinemedi!', 'error');
    }
}