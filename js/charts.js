// GRAFİK MODÜLÜ - Chart.js

let incomeExpenseChart = null;
let categoryChart = null;

// Grafikleri başlat
async function initCharts() {
    await loadIncomeExpenseChart();
    await loadCategoryChart();
}

// Gelir/Gider Trend Grafiği
async function loadIncomeExpenseChart() {
    const transactions = await window.FinanceModule.getTransactions();
    
    // Son 6 ayın verilerini hazırla
    const months = [];
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        months.push(date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }));
        
        const monthTransactions = transactions.filter(t => t.transaction_date.startsWith(monthKey));
        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        incomeData.push(income);
        expenseData.push(expense);
    }

    const ctx = document.getElementById('incomeExpenseChart');
    if (!ctx) return;

    // Eski grafiği temizle
    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }

    // Yeni grafik oluştur
    incomeExpenseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Gelir',
                    data: incomeData,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Gider',
                    data: expenseData,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ₺' + context.parsed.y.toLocaleString('tr-TR');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₺' + value.toLocaleString('tr-TR');
                        }
                    }
                }
            }
        }
    });
}

// Kategori Dağılım Grafiği
async function loadCategoryChart() {
    const transactions = await window.FinanceModule.getTransactions();
    
    // Kategori bazında toplam tutarlar
    const categoryTotals = {};
    transactions.forEach(t => {
        if (t.type === 'expense') {
            if (!categoryTotals[t.category]) {
                categoryTotals[t.category] = 0;
            }
            categoryTotals[t.category] += parseFloat(t.amount);
        }
    });

    const labels = Object.keys(categoryTotals).map(cat => getCategoryText(cat));
    const data = Object.values(categoryTotals);
    const colors = [
        'rgba(147, 51, 234, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(168, 85, 247, 0.8)'
    ];

    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    // Eski grafiği temizle
    if (categoryChart) {
        categoryChart.destroy();
    }

    // Yeni grafik oluştur
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ₺' + context.parsed.toLocaleString('tr-TR') + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Kategori çevirisi
function getCategoryText(category) {
    const texts = {
        'donation': 'Bağış',
        'bağış': 'Bağış',
        'sacrifice': 'Kurban',
        'kurban': 'Kurban',
        'project': 'Proje',
        'proje': 'Proje',
        'facility': 'Tesis',
        'tesis': 'Tesis',
        'salary': 'Maaş',
        'personel': 'Personel',
        'other': 'Diğer'
    };
    return texts[category.toLowerCase()] || category;
}

// Global export
window.ChartsModule = {
    initCharts,
    loadIncomeExpenseChart,
    loadCategoryChart
};