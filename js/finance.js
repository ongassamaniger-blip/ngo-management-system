// FİNANS MODÜLÜ - Gelir/Gider/Rapor İşlemleri

// YENİ GELİR EKLE
async function addIncome(data) {
    const { error } = await supabase.from('transactions').insert([{
        type: 'income',
        title: data.title,
        amount: parseFloat(data.amount),
        category: data.category,
        payment_method: data.paymentMethod || 'bank_transfer',
        transaction_date: data.date || new Date().toISOString().split('T')[0],
        status: 'approved',
        notes: data.notes || ''
    }]);

    if (error) {
        console.error('Gelir ekleme hatası:', error);
        return { success: false, error };
    }

    return { success: true };
}

// YENİ GİDER EKLE
async function addExpense(data) {
    const { error } = await supabase.from('transactions').insert([{
        type: 'expense',
        title: data.title,
        amount: parseFloat(data.amount),
        category: data.category,
        facility_id: data.facilityId || null,
        payment_method: data.paymentMethod || 'bank_transfer',
        transaction_date: data.date || new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: data.notes || ''
    }]);

    if (error) {
        console.error('Gider ekleme hatası:', error);
        return { success: false, error };
    }

    return { success: true };
}

// TÜM İŞLEMLERİ ÇEKME
async function getTransactions(filters = {}) {
    let query = supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

    if (filters.type) query = query.eq('type', filters.type);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.facilityId) query = query.eq('facility_id', filters.facilityId);
    if (filters.startDate) query = query.gte('transaction_date', filters.startDate);
    if (filters.endDate) query = query.lte('transaction_date', filters.endDate);

    const { data, error } = await query;

    if (error) {
        console.error('İşlem çekme hatası:', error);
        return [];
    }

    return data || [];
}

// İSTATİSTİKLER HESAPLA
async function getFinanceStats(filters = {}) {
    const transactions = await getTransactions(filters);

    const stats = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        incomeCount: 0,
        expenseCount: 0,
        pendingApprovalCount: 0
    };

    transactions.forEach(t => {
        const amount = parseFloat(t.amount);
        
        if (t.type === 'income') {
            stats.totalIncome += amount;
            stats.incomeCount++;
        } else {
            stats.totalExpense += amount;
            stats.expenseCount++;
        }

        if (t.status === 'pending') {
            stats.pendingApprovalCount++;
        }
    });

    stats.balance = stats.totalIncome - stats.totalExpense;

    return stats;
}

// İŞLEM SİLME
async function deleteTransaction(id) {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    return !error;
}

// İŞLEM GÜNCELLEME
async function updateTransactionStatus(id, status) {
    const { error } = await supabase
        .from('transactions')
        .update({ status: status })
        .eq('id', id);

    return !error;
}

// EXCEL EXPORT
function exportToCSV(transactions) {
    const headers = ['Tarih', 'Tür', 'Başlık', 'Kategori', 'Tutar', 'Durum'];
    const rows = transactions.map(t => [
        t.transaction_date,
        t.type === 'income' ? 'Gelir' : 'Gider',
        t.title,
        t.category,
        t.amount,
        t.status
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.join(',') + '\n';
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `finansal-rapor-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Global fonksiyon olarak tanımla
window.FinanceModule = {
    addIncome,
    addExpense,
    getTransactions,
    getFinanceStats,
    deleteTransaction,
    updateTransactionStatus,
    exportToCSV
};