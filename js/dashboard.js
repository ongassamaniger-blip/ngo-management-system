// ==================== DASHBOARD TAM VERSİYON ====================

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    await initDashboard();
});

async function initDashboard() {
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

    // Event listener'ları kur
    setupEventListeners();
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
}

// Dashboard istatistikleri
async function loadDashboardStats() {
    const stats = await window.FinanceModule.getFinanceStats();

    document.getElementById('totalIncome').textContent = formatCurrency(stats.totalIncome);
    document.getElementById('totalExpense').textContent = formatCurrency(stats.totalExpense);
    document.getElementById('balance').textContent = formatCurrency(stats.balance);

    const facilities = await window.FacilityModule.getFacilities();
    document.getElementById('totalFacilities').textContent = facilities.length;
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
            <div class="flex items-center justify-between text-sm text-gray-600">
                <span><i class="fas fa-calendar mr-1"></i>${formatDate(p.start_date)}</span>
                <span><i class="fas fa-wallet mr-1"></i>${formatCurrency(p.budget)}</span>
            </div>
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
                    ${p.users?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                    <p class="font-semibold text-gray-800">${p.users?.full_name}</p>
                    <p class="text-sm text-gray-500">${p.position} • ${p.facilities?.name}</p>
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
}

// Sayfa navigasyonu
function navigateToPage(page) {
    // Menü aktifliği
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');

    // Sayfa görünürlüğü
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}-page`).classList.add('active');

    // Başlık güncelle
    const titles = {
        'dashboard': ['Dashboard', 'Genel Bakış'],
        'finans': ['Finans', 'Gelir ve Gider Yönetimi'],
        'tesisler': ['Tesisler', 'Tesis Yönetimi'],
        'projeler': ['Projeler', 'Proje Takip Sistemi'],
        'kurban': ['Kurban', 'Kurban Yönetimi'],
        'personel': ['Personel', 'Personel Yönetimi']
    };
    
    document.getElementById('pageTitle').textContent = titles[page][0];
    document.getElementById('pageSubtitle').textContent = titles[page][1];
}

// Form işleyicileri
function setupFormHandlers() {
    // Gelir formu
    const incomeForm = document.getElementById('incomeForm');
    if (incomeForm) {
        incomeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const result = await window.FinanceModule.addIncome({
                title: formData.get('title') || incomeForm.querySelector('input[type="text"]').value,
                amount: formData.get('amount') || incomeForm.querySelector('input[type="number"]').value,
                category: formData.get('category') || incomeForm.querySelector('select').value.toLowerCase()
            });

            if (result.success) {
                showToast('Gelir başarıyla kaydedildi!', 'success');
                closeModal('incomeModal');
                e.target.reset();
                await loadAllData();
            } else {
                showToast('Hata oluştu: ' + result.error.message, 'error');
            }
        });
    }

    // Gider formu
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const result = await window.FinanceModule.addExpense({
                title: formData.get('title') || expenseForm.querySelector('input[type="text"]').value,
                amount: formData.get('amount') || expenseForm.querySelector('input[type="number"]').value,
                category: formData.get('category') || expenseForm.querySelector('select').value.toLowerCase()
            });

            if (result.success) {
                showToast('Gider başarıyla kaydedildi!', 'success');
                closeModal('expenseModal');
                e.target.reset();
                await loadAllData();
            } else {
                showToast('Hata oluştu: ' + result.error.message, 'error');
            }
        });
    }
}

// Modal fonksiyonları
window.openModal = (modalId) => {
    document.getElementById(modalId).classList.remove('hidden');
    document.getElementById(modalId).classList.add('flex');
};

window.closeModal = (modalId) => {
    document.getElementById(modalId).classList.add('hidden');
    document.getElementById(modalId).classList.remove('flex');
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
                            <td class="py-3 px-4 text-sm text-gray-600">${getCategoryText(t.category)}</td>
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

// Kategori metinleri
function getCategoryText(category) {
    const texts = {
        'donation': 'Bağış',
        'sacrifice': 'Kurban',
        'project': 'Proje',
        'facility': 'Tesis',
        'salary': 'Maaş',
        'other': 'Diğer'
    };
    return texts[category] || category;
}

// Tesis detayını göster
window.viewFacilityDetail = function(facilityId) {
    showToast('Tesis detay sayfası yakında eklenecek!', 'info');
};