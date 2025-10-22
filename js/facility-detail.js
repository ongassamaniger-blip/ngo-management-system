// TESİS DETAY YÖNETİMİ

let currentFacility = null;
let currentTab = 'genel';

// Tesis detayını yükle
async function loadFacilityDetail(facilityId) {
    try {
        // Tesis bilgilerini çek
        const { data: facility, error } = await supabase
            .from('facilities')
            .select('*')
            .eq('id', facilityId)
            .single();

        if (error) throw error;

        currentFacility = facility;
        renderFacilityDetail(facility);
        await loadFacilityStats(facilityId);
        
    } catch (error) {
        console.error('Tesis detay yükleme hatası:', error);
        showToast('Tesis bilgileri yüklenemedi', 'error');
    }
}

// Tesis detayını render et
function renderFacilityDetail(facility) {
    // Header bilgileri
    document.getElementById('facilityName').textContent = facility.name;
    document.getElementById('facilityLocation').innerHTML = `<i class="fas fa-map-marker-alt mr-1"></i>${facility.city}, ${facility.country}`;
    document.getElementById('facilityCode').textContent = facility.code || 'N/A';
    document.getElementById('facilityCategory').textContent = getCategoryName(facility.category);
    document.getElementById('facilityEstablished').textContent = formatDate(facility.established_date);
    document.getElementById('facilityArea').textContent = `${facility.area_sqm || 0} m²`;
    document.getElementById('facilityCapacity').textContent = `${facility.capacity || 0} Kişi`;
}

// Tesis istatistiklerini yükle
async function loadFacilityStats(facilityId) {
    try {
        // Bütçe bilgisi
        const monthlyBudget = currentFacility.monthly_budget || 0;
        document.getElementById('facilityBudget').textContent = formatCurrency(monthlyBudget);

        // Personel sayısı
        const { data: personnel } = await supabase
            .from('personnel')
            .select('*')
            .eq('facility_id', facilityId)
            .eq('status', 'active');

        const personnelCount = personnel?.length || 0;
        document.getElementById('facilityPersonnel').textContent = personnelCount;
        document.getElementById('activePersonnel').textContent = personnelCount;

        // Aktif projeler
        const { data: projects } = await supabase
            .from('projects')
            .select('*')
            .eq('facility_id', facilityId)
            .eq('status', 'active');

        const projectCount = projects?.length || 0;
        document.getElementById('facilityProjects').textContent = projectCount;

        // Bu ay harcamalar
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        
        const { data: expenses } = await supabase
            .from('transactions')
            .select('amount')
            .eq('facility_id', facilityId)
            .eq('type', 'expense')
            .gte('transaction_date', startOfMonth.toISOString().split('T')[0]);

        const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
        const budgetUsagePercent = monthlyBudget > 0 ? ((totalExpenses / monthlyBudget) * 100).toFixed(0) : 0;
        
        document.getElementById('budgetUsed').textContent = formatCurrency(totalExpenses);
        document.getElementById('budgetPercent').textContent = `${budgetUsagePercent}%`;
        document.getElementById('budgetRemaining').textContent = formatCurrency(monthlyBudget - totalExpenses);
        
        // Progress bar
        const progressBar = document.getElementById('budgetProgressBar');
        if (progressBar) {
            progressBar.style.width = `${budgetUsagePercent}%`;
        }

        // Grafik verilerini yükle
        await loadFacilityChart(facilityId);
        
    } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
    }
}

// Tesis grafiğini yükle
async function loadFacilityChart(facilityId) {
    try {
        // Son 6 ayın verilerini al
        const months = [];
        const expenseData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().slice(0, 7);
            months.push(date.toLocaleDateString('tr-TR', { month: 'short' }));
            
            const { data: expenses } = await supabase
                .from('transactions')
                .select('amount')
                .eq('facility_id', facilityId)
                .eq('type', 'expense')
                .like('transaction_date', `${monthKey}%`);

            const total = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
            expenseData.push(total);
        }

        // Chart.js grafiği
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Harcama',
                    data: expenseData,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '₺' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Grafik yükleme hatası:', error);
    }
}

// Personel listesini yükle
async function loadFacilityPersonnel(facilityId) {
    try {
        const { data: personnel } = await supabase
            .from('personnel')
            .select('*, users(*)')
            .eq('facility_id', facilityId)
            .order('hire_date', { ascending: false });

        const container = document.getElementById('personnelGrid');
        if (!container) return;

        if (!personnel || personnel.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-3">Henüz personel yok</p>';
            return;
        }

        container.innerHTML = personnel.map(p => `
            <div class="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                            ${p.users?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}
                        </div>
                        <div class="ml-3">
                            <h4 class="font-bold text-gray-800">${p.users?.full_name || 'N/A'}</h4>
                            <p class="text-sm text-gray-500">${p.position}</p>
                        </div>
                    </div>
                    <span class="px-2 py-1 ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} rounded-full text-xs font-semibold">
                        ${p.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                </div>
                <div class="space-y-2 text-sm text-gray-600 mb-4">
                    <p><i class="fas fa-phone mr-2 text-gray-400"></i>${p.users?.phone || 'N/A'}</p>
                    <p><i class="fas fa-calendar mr-2 text-gray-400"></i>${formatDate(p.hire_date)}</p>
                    <p><i class="fas fa-wallet mr-2 text-gray-400"></i>${formatCurrency(p.salary)}</p>
                </div>
                <button onclick="viewPersonnelDetail('${p.id}')" class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">
                    <i class="fas fa-eye mr-1"></i>Detay
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Personel yükleme hatası:', error);
    }
}

// Harcamaları yükle
async function loadFacilityExpenses(facilityId) {
    try {
        const { data: expenses } = await supabase
            .from('transactions')
            .select('*')
            .eq('facility_id', facilityId)
            .eq('type', 'expense')
            .order('transaction_date', { ascending: false })
            .limit(20);

        const container = document.getElementById('expensesTable');
        if (!container) return;

        if (!expenses || expenses.length === 0) {
            container.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">Henüz harcama yok</td></tr>';
            return;
        }

        container.innerHTML = expenses.map(e => `
            <tr class="border-t hover:bg-gray-50">
                <td class="px-6 py-4 text-gray-600">${formatDate(e.transaction_date)}</td>
                <td class="px-6 py-4">
                    <p class="font-semibold text-gray-800">${e.title}</p>
                    <p class="text-xs text-gray-500">${e.notes || ''}</p>
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 ${getCategoryBadgeClass(e.category)} rounded-full text-sm">
                        ${getCategoryText(e.category)}
                    </span>
                </td>
                <td class="px-6 py-4 font-bold text-red-600">${formatCurrency(e.amount)}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 ${getStatusBadgeClass(e.status)} rounded-full text-sm">
                        ${getStatusText(e.status)}
                    </span>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Harcama yükleme hatası:', error);
    }
}

// Projeleri yükle
async function loadFacilityProjects(facilityId) {
    try {
        const { data: projects } = await supabase
            .from('projects')
            .select('*')
            .eq('facility_id', facilityId)
            .order('created_at', { ascending: false });

        const container = document.getElementById('projectsGrid');
        if (!container) return;

        if (!projects || projects.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Henüz proje yok</p>';
            return;
        }

        container.innerHTML = projects.map(p => `
            <div class="card p-6 border-l-4 border-${getProjectColor(p.status)}-500">
                <div class="flex items-center justify-between mb-4">
                    <span class="px-3 py-1 bg-${getProjectColor(p.status)}-100 text-${getProjectColor(p.status)}-800 rounded-full text-sm font-semibold">
                        ${getCategoryText(p.category)}
                    </span>
                    <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        ${getProjectStatusText(p.status)}
                    </span>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">${p.name}</h3>
                <p class="text-gray-600 mb-4">${p.description || 'Açıklama yok'}</p>
                <div class="mb-4">
                    <div class="flex items-center justify-between text-sm mb-2">
                        <span class="text-gray-600">İlerleme</span>
                        <span class="font-semibold text-${getProjectColor(p.status)}-600">${p.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill bg-gradient-to-r from-${getProjectColor(p.status)}-500 to-${getProjectColor(p.status)}-600" style="width: ${p.progress}%"></div>
                    </div>
                </div>
                <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span><i class="fas fa-calendar mr-1"></i>${formatDate(p.start_date)}</span>
                    <span><i class="fas fa-wallet mr-1"></i>${formatCurrency(p.budget)}</span>
                </div>
                <button onclick="viewProjectDetail('${p.id}')" class="w-full px-4 py-2 bg-${getProjectColor(p.status)}-600 text-white rounded-lg hover:bg-${getProjectColor(p.status)}-700 transition">
                    <i class="fas fa-eye mr-1"></i>Proje Detayı
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Proje yükleme hatası:', error);
    }
}

// Tab değiştirme
window.showFacilityTab = async function(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) selectedTab.classList.add('active');
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
    
    currentTab = tabName;

    // Tab'a özel veri yükleme
    if (!currentFacility) return;

    switch(tabName) {
        case 'personel':
            await loadFacilityPersonnel(currentFacility.id);
            break;
        case 'harcamalar':
            await loadFacilityExpenses(currentFacility.id);
            break;
        case 'projeler':
            await loadFacilityProjects(currentFacility.id);
            break;
    }
};

// Kategori rengi
function getCategoryBadgeClass(category) {
    const classes = {
        'salary': 'bg-purple-100 text-purple-800',
        'operational': 'bg-blue-100 text-blue-800',
        'project': 'bg-green-100 text-green-800',
        'maintenance': 'bg-orange-100 text-orange-800'
    };
    return classes[category] || 'bg-gray-100 text-gray-800';
}

// Kategori ismi
function getCategoryName(category) {
    const names = {
        'education_aid': 'Eğitim & İnsani Yardım',
        'orphanage': 'Yetimhane',
        'health_center': 'Sağlık Merkezi',
        'water_well': 'Su Kuyusu',
        'mosque': 'Cami'
    };
    return names[category] || category;
}

// Yardımcı fonksiyonlar (dashboard.js'dekilerle aynı)
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

function getCategoryText(category) {
    const texts = {
        'education_aid': 'Eğitim',
        'food_aid': 'Gıda',
        'health_aid': 'Sağlık',
        'humanitarian_aid': 'İnsani Yardım',
        'donation': 'Bağış',
        'sacrifice': 'Kurban',
        'project': 'Proje',
        'salary': 'Maaş',
        'operational': 'Operasyonel',
        'maintenance': 'Bakım'
    };
    return texts[category] || category;
}

// Placeholder fonksiyonlar
window.viewPersonnelDetail = function(id) {
    showToast('Personel detay sayfası yakında!', 'info');
};

window.viewProjectDetail = function(id) {
    showToast('Proje detay sayfası yakında!', 'info');
};

// Global export
window.FacilityDetailModule = {
    loadFacilityDetail
};