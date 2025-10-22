// PROJE DETAY YÖNETİMİ

let currentProject = null;
let currentProjectTab = 'overview';

// Proje detayını yükle
async function loadProjectDetail(projectId) {
    try {
        // Proje bilgilerini çek
        const { data: project, error } = await supabase
            .from('projects')
            .select('*, facilities(name, city, country)')
            .eq('id', projectId)
            .single();

        if (error) throw error;

        currentProject = project;
        renderProjectDetail(project);
        await loadProjectStats(projectId);
        await loadProjectTasks(projectId);
        await loadProjectMilestones(projectId);
        
    } catch (error) {
        console.error('Proje detay yükleme hatası:', error);
        showToast('Proje bilgileri yüklenemedi', 'error');
    }
}

// Proje detayını render et
function renderProjectDetail(project) {
    // Header
    document.getElementById('projectName').textContent = project.name;
    document.getElementById('projectCode').textContent = project.code;
    document.getElementById('projectFacility').textContent = project.facilities?.name || 'Belirtilmemiş';
    document.getElementById('projectCategory').textContent = getCategoryName(project.category);
    
    // Hero section
    document.getElementById('projectNameHero').textContent = project.name;
    document.getElementById('projectDescHero').textContent = project.description || 'Açıklama yok';
    document.getElementById('projectInitials').textContent = project.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    
    // Dates
    document.getElementById('projectStartDate').textContent = formatDate(project.start_date);
    if (project.end_date) {
        document.getElementById('projectEndDate').textContent = formatDate(project.end_date);
    }
    
    // Budget
    document.getElementById('projectBudget').textContent = formatCurrency(project.budget);
    
    // Progress
    document.getElementById('projectProgress').textContent = `${project.progress}%`;
    document.getElementById('progressBar').style.width = `${project.progress}%`;
    
    // Status badge
    const statusBadge = document.getElementById('projectStatus');
    statusBadge.textContent = getProjectStatusText(project.status);
    statusBadge.className = `px-3 py-1 bg-${getProjectColor(project.status)}-100 text-${getProjectColor(project.status)}-800 rounded-full text-sm font-semibold`;
    
    // Overview bilgileri
    document.getElementById('overviewCategory').textContent = getCategoryName(project.category);
    document.getElementById('overviewBudget').textContent = formatCurrency(project.budget);
    document.getElementById('overviewStart').textContent = formatDate(project.start_date);
    document.getElementById('overviewEnd').textContent = project.end_date ? formatDate(project.end_date) : 'Devam ediyor';
    document.getElementById('overviewBeneficiaries').textContent = project.target_beneficiaries || 0;
    document.getElementById('overviewDescription').textContent = project.description || 'Açıklama eklenmemiş';
}

// Proje istatistiklerini yükle
async function loadProjectStats(projectId) {
    try {
        // Görev istatistikleri
        const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', projectId);

        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
        const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0;
        
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;

        // Milestone istatistikleri
        const { data: milestones } = await supabase
            .from('milestones')
            .select('*')
            .eq('project_id', projectId);

        const totalMilestones = milestones?.length || 0;
        const completedMilestones = milestones?.filter(m => m.status === 'completed').length || 0;
        
        document.getElementById('totalMilestones').textContent = totalMilestones;
        document.getElementById('completedMilestones').textContent = completedMilestones;

        // Harcama istatistikleri
        const { data: expenses } = await supabase
            .from('transactions')
            .select('amount')
            .eq('type', 'expense')
            .eq('category', 'project');

        const totalSpent = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
        const remainingBudget = currentProject.budget - totalSpent;
        const spentPercent = currentProject.budget > 0 ? ((totalSpent / currentProject.budget) * 100).toFixed(0) : 0;

        document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
        document.getElementById('remainingBudget').textContent = formatCurrency(remainingBudget);
        document.getElementById('spentPercent').textContent = `${spentPercent}%`;
        
        const budgetBar = document.getElementById('budgetBar');
        if (budgetBar) {
            budgetBar.style.width = `${spentPercent}%`;
        }

        // Timeline grafiği
        await loadProjectTimeline(projectId);
        
    } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
    }
}

// Proje timeline grafiği
async function loadProjectTimeline(projectId) {
    try {
        const { data: milestones } = await supabase
            .from('milestones')
            .select('*')
            .eq('project_id', projectId)
            .order('due_date', { ascending: true });

        if (!milestones || milestones.length === 0) return;

        const ctx = document.getElementById('timelineChart');
        if (!ctx) return;

        const labels = milestones.map(m => m.title);
        const data = milestones.map(m => m.status === 'completed' ? 100 : (m.progress || 0));

        new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'İlerleme (%)',
                    data: data,
                    backgroundColor: data.map(d => d === 100 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(102, 126, 234, 0.8)'),
                    borderRadius: 8
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
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Timeline grafiği hatası:', error);
    }
}

// Görevleri yükle
async function loadProjectTasks(projectId) {
    try {
        const { data: tasks } = await supabase
            .from('tasks')
            .select('*, users(full_name)')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        const container = document.getElementById('tasksList');
        if (!container) return;

        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Henüz görev yok</p>';
            return;
        }

        container.innerHTML = tasks.map(t => `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center">
                        <input type="checkbox" ${t.status === 'completed' ? 'checked' : ''} 
                               onchange="updateTaskStatus('${t.id}', this.checked)"
                               class="w-5 h-5 text-purple-600 rounded mr-3">
                        <h4 class="font-semibold text-gray-800 ${t.status === 'completed' ? 'line-through text-gray-500' : ''}">${t.title}</h4>
                    </div>
                    <span class="px-2 py-1 ${getTaskPriorityClass(t.priority)} rounded text-xs font-semibold">
                        ${getTaskPriorityText(t.priority)}
                    </span>
                </div>
                <p class="text-sm text-gray-600 mb-3">${t.description || 'Açıklama yok'}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span><i class="fas fa-user mr-1"></i>${t.users?.full_name || 'Atanmamış'}</span>
                    ${t.due_date ? `<span><i class="fas fa-calendar mr-1"></i>${formatDate(t.due_date)}</span>` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Görev yükleme hatası:', error);
    }
}

// Milestone'ları yükle
async function loadProjectMilestones(projectId) {
    try {
        const { data: milestones } = await supabase
            .from('milestones')
            .select('*')
            .eq('project_id', projectId)
            .order('due_date', { ascending: true });

        const container = document.getElementById('milestonesList');
        if (!container) return;

        if (!milestones || milestones.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Henüz milestone yok</p>';
            return;
        }

        container.innerHTML = milestones.map(m => `
            <div class="border-l-4 ${m.status === 'completed' ? 'border-green-500' : 'border-blue-500'} bg-white rounded-lg p-6 shadow-md">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-bold text-gray-800 text-lg">${m.title}</h4>
                    <span class="px-3 py-1 ${m.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} rounded-full text-xs font-semibold">
                        ${m.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                    </span>
                </div>
                <p class="text-gray-600 mb-4">${m.description || 'Açıklama yok'}</p>
                <div class="mb-3">
                    <div class="flex items-center justify-between text-sm mb-2">
                        <span class="text-gray-600">İlerleme</span>
                        <span class="font-semibold text-blue-600">${m.progress || 0}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill bg-gradient-to-r from-blue-500 to-purple-600" style="width: ${m.progress || 0}%"></div>
                    </div>
                </div>
                <div class="flex items-center justify-between text-sm text-gray-500">
                    <span><i class="fas fa-calendar mr-1"></i>Hedef: ${formatDate(m.due_date)}</span>
                    ${m.completed_at ? `<span><i class="fas fa-check mr-1"></i>Tamamlandı: ${formatDate(m.completed_at)}</span>` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Milestone yükleme hatası:', error);
    }
}

// Görev durumunu güncelle
window.updateTaskStatus = async function(taskId, isCompleted) {
    try {
        const newStatus = isCompleted ? 'completed' : 'pending';
        
        const { error } = await supabase
            .from('tasks')
            .update({ 
                status: newStatus,
                completed_at: isCompleted ? new Date().toISOString() : null
            })
            .eq('id', taskId);

        if (error) throw error;

        showToast('Görev durumu güncellendi', 'success');
        await loadProjectDetail(currentProject.id);
        
    } catch (error) {
        console.error('Görev güncelleme hatası:', error);
        showToast('Görev güncellenemedi', 'error');
    }
};

// Tab değiştirme
window.showProjectTab = async function(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) selectedTab.classList.add('active');
    
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
    
    currentProjectTab = tabName;
};

// Yardımcı fonksiyonlar
function getTaskPriorityClass(priority) {
    const classes = {
        'low': 'bg-gray-100 text-gray-800',
        'normal': 'bg-blue-100 text-blue-800',
        'high': 'bg-orange-100 text-orange-800',
        'urgent': 'bg-red-100 text-red-800'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
}

function getTaskPriorityText(priority) {
    const texts = {
        'low': 'Düşük',
        'normal': 'Normal',
        'high': 'Yüksek',
        'urgent': 'Acil'
    };
    return texts[priority] || priority;
}

function getCategoryName(category) {
    const names = {
        'education_aid': 'Eğitim Yardımı',
        'food_aid': 'Gıda Yardımı',
        'health_aid': 'Sağlık Yardımı',
        'humanitarian_aid': 'İnsani Yardım',
        'water_well': 'Su Kuyusu',
        'orphanage': 'Yetimhane',
        'mosque': 'Cami'
    };
    return names[category] || category;
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

// Global export
window.ProjectDetailModule = {
    loadProjectDetail
};