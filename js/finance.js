// FİNANS MODÜLÜ - Gelir/Gider/Rapor İşlemleri
// Enhanced with approval workflow and error handling

// YENİ GELİR EKLE
async function addIncome(data) {
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase.from('transactions').insert([{
            type: 'income',
            title: data.title,
            amount: parseFloat(data.amount),
            category: data.category,
            payment_method: data.paymentMethod || 'bank_transfer',
            transaction_date: data.date || new Date().toISOString().split('T')[0],
            status: 'approved', // Gelirler otomatik onaylı
            notes: data.notes || '',
            created_by: user?.id || null
        }]);

        if (error) {
            console.error('Gelir ekleme hatası:', error);
            window.ErrorHandler?.handleAPIError(error, 'addIncome');
            return { success: false, error };
        }

        window.ToastManager?.show('Gelir kaydı başarıyla eklendi', 'success');
        
        // Log audit event
        if (window.ApprovalWorkflow) {
            await window.ApprovalWorkflow.logAuditEvent('CREATE_INCOME', 'transaction', null, {
                title: data.title,
                amount: data.amount
            });
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('Gelir ekleme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'addIncome');
        return { success: false, error };
    }
}

// YENİ GİDER EKLE
async function addExpense(data) {
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase.from('transactions').insert([{
            type: 'expense',
            title: data.title,
            amount: parseFloat(data.amount),
            category: data.category,
            facility_id: data.facilityId || null,
            payment_method: data.paymentMethod || 'bank_transfer',
            transaction_date: data.date || new Date().toISOString().split('T')[0],
            status: 'pending', // Giderler onay bekler
            notes: data.notes || '',
            created_by: user?.id || null
        }]);

        if (error) {
            console.error('Gider ekleme hatası:', error);
            window.ErrorHandler?.handleAPIError(error, 'addExpense');
            return { success: false, error };
        }

        window.ToastManager?.show('Gider kaydı oluşturuldu, onay bekleniyor', 'info');
        
        // Log audit event
        if (window.ApprovalWorkflow) {
            await window.ApprovalWorkflow.logAuditEvent('CREATE_EXPENSE', 'transaction', null, {
                title: data.title,
                amount: data.amount
            });
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('Gider ekleme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'addExpense');
        return { success: false, error };
    }
}

// TÜM İŞLEMLERİ ÇEKME
async function getTransactions(filters = {}) {
    try {
        let query = supabase
            .from('transactions')
            .select('*, facilities(name), created_by_user:users!created_by(full_name), approved_by_user:users!approved_by(full_name)')
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
            window.ErrorHandler?.handleAPIError(error, 'getTransactions');
            return [];
        }

        return data || [];
        
    } catch (error) {
        console.error('İşlem çekme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'getTransactions');
        return [];
    }
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
    try {
        if (!window.ValidationUtils?.isValidUUID(id)) {
            throw new Error('Geçersiz işlem ID');
        }
        
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        window.ToastManager?.show('İşlem başarıyla silindi', 'success');
        
        // Log audit event
        if (window.ApprovalWorkflow) {
            await window.ApprovalWorkflow.logAuditEvent('DELETE_TRANSACTION', 'transaction', id);
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('İşlem silme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'deleteTransaction');
        return { success: false, error };
    }
}

// İŞLEM GÜNCELLEME
async function updateTransactionStatus(id, status) {
    try {
        if (!window.ValidationUtils?.isValidUUID(id)) {
            throw new Error('Geçersiz işlem ID');
        }
        
        const { error } = await supabase
            .from('transactions')
            .update({ status: status })
            .eq('id', id);

        if (error) throw error;
        
        window.ToastManager?.show('İşlem durumu güncellendi', 'success');
        
        // Log audit event
        if (window.ApprovalWorkflow) {
            await window.ApprovalWorkflow.logAuditEvent('UPDATE_TRANSACTION_STATUS', 'transaction', id, { status });
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('İşlem güncelleme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'updateTransactionStatus');
        return { success: false, error };
    }
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