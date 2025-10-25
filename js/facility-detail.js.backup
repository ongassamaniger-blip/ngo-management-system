// ==================== TESİS DETAY YÖNETİMİ - TAM VERSİYON ====================

let currentFacility = null;
let currentTab = 'genel';
let charts = {};

// ==================== ANA YÜKLEME FONKSİYONU ====================

async function loadFacilityDetail(facilityId) {
    try {
        showLoading(true);

        // Tesis bilgilerini çek
        const { data: facility, error } = await supabase
            .from('facilities')
            .select('*')
            .eq('id', facilityId)
            .single();

        if (error) throw error;
        if (!facility) {
            ToastManager.error('Tesis bulunamadı!');
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
            return;
        }

        currentFacility = facility;
        
        // Tüm bileşenleri yükle
        await Promise.all([
            renderFacilityHeader(facility),
            renderFacilityHero(facility),
            loadFacilityStats(facilityId),
            loadFacilityInfo(facility),
            loadBudgetUsage(facilityId, facility.monthly_budget),
            loadMonthlyTrend(facilityId)
        ]);

        ToastManager.success('Tesis detayları yüklendi!', 2000);

    } catch (error) {
        console.error('Tesis detay yükleme hatası:', error);
        ToastManager.error('Tesis bilgileri yüklenemedi: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// ==================== HEADER & HERO RENDER ====================

function renderFacilityHeader(facility) {
    document.getElementById('facilityName').textContent = facility.name;
    document.getElementById('facilityLocation').innerHTML = 
        `<i class="fas fa-map-marker-alt mr-1"></i>${facility.city}, ${facility.country}`;
}

function renderFacilityHero(facility) {
    const initials = facility.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    
    document.getElementById('facilityInitials').textContent = initials;
    document.getElementById('facilityNameHero').textContent = facility.name;
    document.getElementById('facilityCategoryHero').textContent = getCategoryName(facility.category);
    document.getElementById('facilityEstDate').textContent = new Date(facility.established_date).getFullYear();
}

// ==================== İSTATİSTİKLER ====================

async function loadFacilityStats(facilityId) {
    try {
        // Bütçe
        const monthlyBudget = currentFacility.monthly_budget || 0;
        document.getElementById('facilityBudget').textContent = formatCurrency(monthlyBudget);

        // Personel sayısı
        const { data: personnel } = await supabase
            .from('personnel')
            .select('id, status')
            .eq('facility_id', facilityId);

        const totalPersonnel = personnel?.length || 0;
        const activePersonnel = personnel?.filter(p => p.status === 'active').length || 0;

        document.getElementById('facilityPersonnel').textContent = totalPersonnel;
        document.getElementById('activePersonnel').textContent = activePersonnel;
        document.getElementById('heroPersonnel').textContent = totalPersonnel;

        // Aktif projeler
        const { data: projects } = await supabase
            .from('projects')
            .select('id')
            .eq('facility_id', facilityId)
            .in('status', ['planning', 'active']);

        const projectCount = projects?.length || 0;
        document.getElementById('facilityProjects').textContent = projectCount;

        // Faydalanıcılar (proje toplamı)
        const { data: projectsWithBenef } = await supabase
            .from('projects')
            .select('target_beneficiaries')
            .eq('facility_id', facilityId);

        const totalBeneficiaries = projectsWithBenef?.reduce((sum, p) => 
            sum + (parseInt(p.target_beneficiaries) || 0), 0) || 0;

        document.getElementById('facilityBeneficiaries').textContent = totalBeneficiaries;
        document.getElementById('heroBeneficiaries').textContent = totalBeneficiaries;

        // Bu ay harcamalar
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { data: expenses } = await supabase
            .from('transactions')
            .select('amount')
            .eq('facility_id', facilityId)
            .eq('type', 'expense')
            .gte('transaction_date', startOfMonth.toISOString().split('T')[0]);

        const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
        const budgetUsagePercent = monthlyBudget > 0 
            ? Math.round((totalExpenses / monthlyBudget) * 100) 
            : 0;
        
        document.getElementById('budgetPercent').textContent = `${budgetUsagePercent}%`;

        // İlerleme çubuğu animasyonu
        setTimeout(() => {
            const progressBar = document.getElementById('budgetProgressBar');
            if (progressBar) {
                progressBar.style.width = `${Math.min(budgetUsagePercent, 100)}%`;
            }
        }, 100);

    } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
        ToastManager.error('İstatistikler yüklenemedi!');
    }
}

// ==================== GENEL BİLGİLER TAB ====================

function loadFacilityInfo(facility) {
    document.getElementById('facilityCode').textContent = facility.code || 'FAC-' + facility.id.slice(0, 8);
    document.getElementById('facilityCategory').textContent = getCategoryName(facility.category);
    document.getElementById('facilityEstablished').textContent = formatDate(facility.established_date);
    document.getElementById('facilityArea').textContent = `${facility.area_sqm || 0} m²`;
    document.getElementById('facilityCapacity').textContent = `${facility.capacity || 0} Kişi`;
}

async function loadBudgetUsage(facilityId, monthlyBudget) {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        
        const { data: expenses } = await supabase
            .from('transactions')
            .select('amount')
            .eq('facility_id', facilityId)
            .eq('type', 'expense')
            .gte('transaction_date', startOfMonth.toISOString().split('T')[0]);

        const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
        const remaining = monthlyBudget - totalExpenses;
        const usagePercent = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;

        document.getElementById('totalBudget').textContent = formatCurrency(monthlyBudget);
        document.getElementById('budgetUsed').textContent = formatCurrency(totalExpenses);
        document.getElementById('budgetRemaining').textContent = formatCurrency(remaining);

        // Progress bar
        const progressBar = document.getElementById('budgetProgressBar');
        if (progressBar) {
            progressBar.style.width = `${Math.min(usagePercent, 100)}%`;
            
            // Renk değiştir (bütçe aşımı varsa)
            if (usagePercent > 100) {
                progressBar.classList.remove('from-purple-500', 'to-blue-600');
                progressBar.classList.add('from-red-500', 'to-red-700');
            } else if (usagePercent > 80) {
                progressBar.classList.remove('from-purple-500', 'to-blue-600');
                progressBar.classList.add('from-yellow-500', 'to-orange-600');
            }
        }

    } catch (error) {
        console.error('Bütçe yükleme hatası:', error);
    }
}

async function loadMonthlyTrend(facilityId) {
    try {
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

        // Chart oluştur
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        // Eski chart'ı temizle
        if (charts.trend) {
            charts.trend.destroy();
        }

        charts.trend = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Harcama',
                    data: expenseData,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: 'rgb(102, 126, 234)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Harcama: ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
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

// ==================== PERSONEL TAB ====================

async function loadFacilityPersonnel(facilityId) {
    try {
        const { data: personnel, error } = await supabase
            .from('personnel')
            .select('*, users(*)')
            .eq('facility_id', facilityId)
            .order('hire_date', { ascending: false });

        if (error) throw error;

        const container = document.getElementById('personnelGrid');
        if (!container) return;

        if (!personnel || personnel.length === 0) {
            container.innerHTML = `
                <div class="col-span-3 text-center py-16">
                    <i class="fas fa-users text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg mb-4">Henüz personel kaydı yok</p>
                    <button onclick="openAddPersonnelModal()" class="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
                        <i class="fas fa-user-plus mr-2"></i>İlk Personeli Ekle
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = personnel.map(p => {
            const initials = p.users?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A';
            const statusColor = p.status === 'active' ? 'green' : 'gray';
            const statusText = p.status === 'active' ? 'Aktif' : 'Pasif';
            
            return `
                <div class="border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-purple-300 transition-all duration-300 bg-white">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center flex-1">
                            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                ${initials}
                            </div>
                            <div class="ml-4 flex-1">
                                <h4 class="font-bold text-gray-800 text-lg">${p.users?.full_name || 'N/A'}</h4>
                                <p class="text-sm text-gray-500">${p.position}</p>
                            </div>
                        </div>
                        <span class="px-3 py-1 bg-${statusColor}-100 text-${statusColor}-800 rounded-full text-xs font-semibold">
                            ${statusText}
                        </span>
                    </div>
                    <div class="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg p-4">
                        <p class="flex items-center">
                            <i class="fas fa-envelope w-5 text-gray-400"></i>
                            <span class="ml-2">${p.users?.email || 'N/A'}</span>
                        </p>
                        <p class="flex items-center">
                            <i class="fas fa-phone w-5 text-gray-400"></i>
                            <span class="ml-2">${p.users?.phone || 'N/A'}</span>
                        </p>
                        <p class="flex items-center">
                            <i class="fas fa-calendar w-5 text-gray-400"></i>
                            <span class="ml-2">İşe Giriş: ${formatDate(p.hire_date)}</span>
                        </p>
                        <p class="flex items-center">
                            <i class="fas fa-wallet w-5 text-gray-400"></i>
                            <span class="ml-2 font-bold text-purple-600">${formatCurrency(p.salary)}</span>
                        </p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editPersonnel('${p.id}')" class="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-semibold">
                            <i class="fas fa-edit mr-1"></i>Düzenle
                        </button>
                        <button onclick="viewPersonnelDetail('${p.id}')" class="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-semibold">
                            <i class="fas fa-eye mr-1"></i>Detay
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Personel yükleme hatası:', error);
        ToastManager.error('Personel listesi yüklenemedi!');
    }
}

// ==================== HARCAMALAR TAB ====================

async function loadFacilityExpenses(facilityId) {
    try {
        const { data: expenses, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('facility_id', facilityId)
            .eq('type', 'expense')
            .order('transaction_date', { ascending: false })
            .limit(50);

        if (error) throw error;

        const container = document.getElementById('expensesTable');
        if (!container) return;

        if (!expenses || expenses.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-16">
                        <i class="fas fa-receipt text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500 text-lg mb-4">Henüz harcama kaydı yok</p>
                        <button onclick="openAddExpenseModal()" class="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition">
                            <i class="fas fa-plus mr-2"></i>İlk Harcamayı Ekle
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = expenses.map(e => `
            <tr class="border-t hover:bg-purple-50 transition-colors duration-200">
                <td class="px-6 py-4 text-gray-600 font-medium">${formatDate(e.transaction_date)}</td>
                <td class="px-6 py-4">
                    <p class="font-semibold text-gray-800">${e.title}</p>
                    ${e.notes ? `<p class="text-xs text-gray-500 mt-1">${e.notes}</p>` : ''}
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 ${getCategoryBadgeClass(e.category)} rounded-full text-sm font-semibold">
                        ${getCategoryText(e.category)}
                    </span>
                </td>
                <td class="px-6 py-4 font-bold text-red-600 text-lg">${formatCurrency(e.amount)}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 ${getStatusBadgeClass(e.status)} rounded-full text-sm font-semibold">
                        ${getStatusText(e.status)}
                    </span>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Harcama yükleme hatası:', error);
        ToastManager.error('Harcamalar yüklenemedi!');
    }
}

// ==================== PROJELER TAB ====================

async function loadFacilityProjects(facilityId) {
    try {
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .eq('facility_id', facilityId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const container = document.getElementById('projectsGrid');
        if (!container) return;

        if (!projects || projects.length === 0) {
            container.innerHTML = `
                <div class="col-span-2 text-center py-16">
                    <i class="fas fa-project-diagram text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg mb-4">Bu tesise ait proje yok</p>
                    <button onclick="openAddProjectModal()" class="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                        <i class="fas fa-plus mr-2"></i>İlk Projeyi Ekle
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = projects.map(p => {
            const statusColor = getProjectColor(p.status);
            const progressColor = p.progress > 75 ? 'green' : p.progress > 50 ? 'blue' : p.progress > 25 ? 'yellow' : 'red';
            
            return `
                <div class="card p-6 border-l-4 border-${statusColor}-500 hover:shadow-2xl transition-all duration-300">
                    <div class="flex items-center justify-between mb-4">
                        <span class="px-3 py-1 bg-${statusColor}-100 text-${statusColor}-800 rounded-full text-sm font-semibold">
                            ${getCategoryText(p.category)}
                        </span>
                        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            ${getProjectStatusText(p.status)}
                        </span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${p.name}</h3>
                    <p class="text-gray-600 mb-4 text-sm line-clamp-2">${p.description || 'Açıklama yok'}</p>
                    
                    <div class="mb-4">
                        <div class="flex items-center justify-between text-sm mb-2">
                            <span class="text-gray-600 font-medium">İlerleme</span>
                            <span class="font-bold text-${progressColor}-600">${p.progress || 0}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill bg-gradient-to-r from-${progressColor}-500 to-${progressColor}-600" style="width: ${p.progress || 0}%"></div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg p-3">
                        <span class="flex items-center">
                            <i class="fas fa-calendar mr-2 text-gray-400"></i>
                            ${formatDate(p.start_date)}
                        </span>
                        <span class="flex items-center font-bold text-purple-600">
                            <i class="fas fa-wallet mr-2"></i>
                            ${formatCurrency(p.budget)}
                        </span>
                    </div>
                    
                    <button onclick="viewProjectDetail('${p.id}')" class="w-full px-4 py-3 bg-gradient-to-r from-${statusColor}-600 to-${statusColor}-700 text-white rounded-lg hover:from-${statusColor}-700 hover:to-${statusColor}-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                        <i class="fas fa-eye mr-2"></i>Proje Detayı
                    </button>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Proje yükleme hatası:', error);
        ToastManager.error('Projeler yüklenemedi!');
    }
}

// ==================== TAB DEĞİŞTİRME ====================

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
        btn.classList.add('text-gray-700', 'hover:bg-gray-100');
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
        event.currentTarget.classList.remove('text-gray-700', 'hover:bg-gray-100');
    }
    
    currentTab = tabName;

    // Tab'a özel veri yükleme
    if (!currentFacility) return;

    const loading = ToastManager.loading(`${tabName} yükleniyor...`);

    try {
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
        loading.update('Yüklendi!', 'success');
    } catch (error) {
        loading.update('Yükleme başarısız!', 'error');
    }
};

// ==================== MODAL FONKSİYONLARI ====================

window.openAddPersonnelModal = function() {
    ToastManager.info('Personel ekleme modalı açılacak (yakında!)');
    // TODO: Modal implementasyonu
};

window.openAddExpenseModal = function() {
    ToastManager.info('Harcama ekleme modalı açılacak (yakında!)');
    // TODO: Modal implementasyonu
};

window.openAddProjectModal = function() {
    ToastManager.info('Proje ekleme modalı açılacak (yakında!)');
    // TODO: Modal implementasyonu
};

window.editPersonnel = function(id) {
    ToastManager.info('Personel düzenleme modalı açılacak (yakında!)');
    // TODO: Edit modal
};

window.viewPersonnelDetail = function(id) {
    ToastManager.info('Personel detay sayfası açılacak (yakında!)');
    // TODO: Detail page
};

window.viewProjectDetail = function(id) {
    window.location.href = `project-detail.html?id=${id}`;
};

// ==================== DÜZENLEME & RAPOR ====================

window.editFacility = async function() {
    if (!currentFacility) return;
    
    const name = await ToastManager.prompt(
        'Tesis adını girin:',
        'Tesis Düzenle',
        currentFacility.name
    );
    
    if (!name) return;
    
    await ToastManager.promise(
        supabase
            .from('facilities')
            .update({ name: name })
            .eq('id', currentFacility.id),
        {
            loading: 'Güncelleniyor...',
            success: 'Tesis adı güncellendi!',
            error: 'Güncelleme başarısız!'
        }
    );
    
    await loadFacilityDetail(currentFacility.id);
};

window.exportFacilityReport = async function() {
    if (!currentFacility) return;
    
    ToastManager.info('PDF raporu hazırlanıyor...', 2000);
    
    // TODO: PDF export implementasyonu
    setTimeout(() => {
        ToastManager.success('Rapor indirildi!');
    }, 2000);
};

// ==================== YARDIMCI FONKSİYONLAR ====================

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
}

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

function getCategoryBadgeClass(category) {
    const classes = {
        'salary': 'bg-purple-100 text-purple-800',
        'personel': 'bg-purple-100 text-purple-800',
        'operational': 'bg-blue-100 text-blue-800',
        'project': 'bg-green-100 text-green-800',
        'proje': 'bg-green-100 text-green-800',
        'maintenance': 'bg-orange-100 text-orange-800',
        'facility': 'bg-cyan-100 text-cyan-800',
        'tesis': 'bg-cyan-100 text-cyan-800'
    };
    return classes[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

function getCategoryText(category) {
    const texts = {
        'education_aid': 'Eğitim',
        'food_aid': 'Gıda',
        'health_aid': 'Sağlık',
        'humanitarian_aid': 'İnsani Yardım',
        'donation': 'Bağış',
        'sacrifice': 'Kurban',
        'kurban': 'Kurban',
        'project': 'Proje',
        'proje': 'Proje',
        'salary': 'Maaş',
        'personel': 'Personel',
        'operational': 'Operasyonel',
        'maintenance': 'Bakım',
        'facility': 'Tesis',
        'tesis': 'Tesis'
    };
    return texts[category.toLowerCase()] || category;
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

// ==================== GLOBAL EXPORT ====================

window.FacilityDetailModule = {
    loadFacilityDetail,
    editFacility,
    exportFacilityReport
};

console.log('✅ Facility Detail Module yüklendi!');