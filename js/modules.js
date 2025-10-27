// PROJE & KURBAN & PERSONEL MODÜLLERI
// Enhanced with error handling and validation

// ==================== PROJE MODÜLÜ ====================

// Yeni proje oluştur
async function createProject(data) {
    try {
        const code = `PRJ-${Date.now()}`;
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: project, error } = await supabase.from('projects').insert([{
            code: code,
            name: data.name,
            description: data.description || '',
            category: data.category,
            facility_id: data.facilityId,
            budget: parseFloat(data.budget),
            start_date: data.startDate,
            end_date: data.endDate,
            target_beneficiaries: parseInt(data.targetBeneficiaries) || 0,
            status: 'planning',
            progress: 0,
            created_by: user?.id || null
        }]).select();

        if (error) {
            console.error('Proje oluşturma hatası:', error);
            window.ErrorHandler?.handleAPIError(error, 'createProject');
            return { success: false, error };
        }

        window.ToastManager?.show('Proje başarıyla oluşturuldu', 'success');
        
        // Log audit event
        if (window.ApprovalWorkflow) {
            await window.ApprovalWorkflow.logAuditEvent('CREATE_PROJECT', 'project', project[0].id, {
                name: data.name,
                code: code
            });
        }

        return { success: true, data: project[0] };
        
    } catch (error) {
        console.error('Proje oluşturma hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'createProject');
        return { success: false, error };
    }
}

// Projeleri listele
async function getProjects(filters = {}) {
    try {
        let query = supabase
            .from('projects')
            .select('*, facilities(name)')
            .order('created_at', { ascending: false });

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.facilityId) query = query.eq('facility_id', filters.facilityId);

        const { data, error } = await query;
        
        if (error) {
            console.error('Proje listeleme hatası:', error);
            window.ErrorHandler?.handleAPIError(error, 'getProjects');
            return [];
        }
        
        return data || [];
        
    } catch (error) {
        console.error('Proje listeleme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'getProjects');
        return [];
    }
}

// Proje ilerlemesini güncelle
async function updateProjectProgress(projectId, progress) {
    try {
        if (!window.ValidationUtils?.isValidUUID(projectId)) {
            throw new Error('Geçersiz proje ID');
        }
        
        const { error } = await supabase
            .from('projects')
            .update({ progress: progress })
            .eq('id', projectId);

        if (error) throw error;
        
        window.ToastManager?.show('Proje ilerlemesi güncellendi', 'success');
        
        // Log audit event
        if (window.ApprovalWorkflow) {
            await window.ApprovalWorkflow.logAuditEvent('UPDATE_PROJECT_PROGRESS', 'project', projectId, { progress });
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('Proje güncelleme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'updateProjectProgress');
        return { success: false, error };
    }
}

// Projeye görev ekle
async function addTask(projectId, taskData) {
    try {
        if (!window.ValidationUtils?.isValidUUID(projectId)) {
            throw new Error('Geçersiz proje ID');
        }
        
        const { error } = await supabase.from('tasks').insert([{
            project_id: projectId,
            title: taskData.title,
            description: taskData.description || '',
            assigned_to: taskData.assignedTo || null,
            due_date: taskData.dueDate || null,
            priority: taskData.priority || 'normal',
            status: 'pending'
        }]);

        if (error) throw error;
        
        window.ToastManager?.show('Görev başarıyla eklendi', 'success');
        return { success: true };
        
    } catch (error) {
        console.error('Görev ekleme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'addTask');
        return { success: false, error };
    }
}

// Proje görevlerini çek
async function getProjectTasks(projectId) {
    try {
        if (!window.ValidationUtils?.isValidUUID(projectId)) {
            throw new Error('Geçersiz proje ID');
        }
        
        const { data, error } = await supabase
            .from('tasks')
            .select('*, assigned_to_user:users!assigned_to(full_name)')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        return data || [];
        
    } catch (error) {
        console.error('Görev listeleme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'getProjectTasks');
        return [];
    }
}

// ==================== KURBAN MODÜLÜ ====================

// Kurban kaydı oluştur
async function createSacrifice(data) {
    try {
        const code = `KRB-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: sacrifice, error } = await supabase.from('sacrifices').insert([{
            code: code,
            donor_name: data.donorName,
            donor_phone: data.donorPhone,
            donor_email: data.donorEmail || '',
            sacrifice_type: data.sacrificeType,
            animal_type: data.animalType,
            facility_id: data.facilityId,
            sacrifice_date: data.sacrificeDate,
            amount: parseFloat(data.amount),
            payment_status: data.paymentStatus || 'pending',
            sacrifice_status: 'registered',
            notes: data.notes || '',
            sms_notification: data.smsNotification || false,
            email_notification: data.emailNotification || false,
            created_by: user?.id || null
        }]).select();

        if (error) {
            console.error('Kurban kaydı hatası:', error);
            window.ErrorHandler?.handleAPIError(error, 'createSacrifice');
            return { success: false, error };
        }

        // Ödeme yapıldıysa otomatik gelir kaydı oluştur
        if (data.paymentStatus === 'paid') {
            await supabase.from('transactions').insert([{
                type: 'income',
                title: `Kurban - ${data.donorName}`,
                amount: parseFloat(data.amount),
                category: 'sacrifice',
                transaction_date: new Date().toISOString().split('T')[0],
                status: 'approved',
                created_by: user?.id || null
            }]);
        }

        window.ToastManager?.show('Kurban kaydı başarıyla oluşturuldu', 'success');
        
        // Log audit event
        if (window.ApprovalWorkflow) {
            await window.ApprovalWorkflow.logAuditEvent('CREATE_SACRIFICE', 'sacrifice', sacrifice[0].id, {
                code: code,
                donor_name: data.donorName
            });
        }

        return { success: true, data: sacrifice[0] };
        
    } catch (error) {
        console.error('Kurban kaydı hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'createSacrifice');
        return { success: false, error };
    }
}

// Kurban kayıtlarını listele
async function getSacrifices(filters = {}) {
    try {
        let query = supabase
            .from('sacrifices')
            .select('*, facilities(name)')
            .order('created_at', { ascending: false });

        if (filters.status) query = query.eq('sacrifice_status', filters.status);
        if (filters.facilityId) query = query.eq('facility_id', filters.facilityId);
        if (filters.year) {
            const startDate = `${filters.year}-01-01`;
            const endDate = `${filters.year}-12-31`;
            query = query.gte('sacrifice_date', startDate).lte('sacrifice_date', endDate);
        }

        const { data, error } = await query;
        
        if (error) {
            console.error('Kurban listeleme hatası:', error);
            window.ErrorHandler?.handleAPIError(error, 'getSacrifices');
            return [];
        }
        
        return data || [];
        
    } catch (error) {
        console.error('Kurban listeleme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'getSacrifices');
        return [];
    }
}

// Kurban durumunu güncelle
async function updateSacrificeStatus(id, status) {
    try {
        if (!window.ValidationUtils?.isValidUUID(id)) {
            throw new Error('Geçersiz kurban ID');
        }
        
        const { error } = await supabase
            .from('sacrifices')
            .update({ sacrifice_status: status })
            .eq('id', id);

        if (error) throw error;
        
        window.ToastManager?.show('Kurban durumu güncellendi', 'success');
        
        // Log audit event
        if (window.ApprovalWorkflow) {
            await window.ApprovalWorkflow.logAuditEvent('UPDATE_SACRIFICE_STATUS', 'sacrifice', id, { status });
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('Kurban güncelleme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'updateSacrificeStatus');
        return { success: false, error };
    }
}

// ==================== PERSONEL MODÜLÜ ====================

// Personel ekle
async function addPersonnel(data) {
    try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        const { data: user, error: userError } = await supabase.from('users').insert([{
            email: data.email,
            full_name: data.fullName,
            phone: data.phone,
            role: 'user',
            facility_id: data.facilityId
        }]).select();

        if (userError) {
            console.error('Kullanıcı oluşturma hatası:', userError);
            window.ErrorHandler?.handleAPIError(userError, 'addPersonnel - createUser');
            return { success: false, error: userError };
        }

        const { error: personnelError } = await supabase.from('personnel').insert([{
            user_id: user[0].id,
            facility_id: data.facilityId,
            position: data.position,
            department: data.department || '',
            hire_date: data.hireDate,
            salary: parseFloat(data.salary),
            contract_type: data.contractType || 'full-time',
            emergency_contact: data.emergencyContact || '',
            blood_type: data.bloodType || '',
            status: 'active',
            created_by: currentUser?.id || null
        }]);

        if (personnelError) {
            console.error('Personel kaydı hatası:', personnelError);
            window.ErrorHandler?.handleAPIError(personnelError, 'addPersonnel - createPersonnel');
            return { success: false, error: personnelError };
        }

        window.ToastManager?.show('Personel başarıyla eklendi', 'success');
        
        // Log audit event
        if (window.ApprovalWorkflow) {
            await window.ApprovalWorkflow.logAuditEvent('CREATE_PERSONNEL', 'personnel', user[0].id, {
                full_name: data.fullName,
                position: data.position
            });
        }

        return { success: true };
        
    } catch (error) {
        console.error('Personel ekleme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'addPersonnel');
        return { success: false, error };
    }
}

// Personel listesi
async function getPersonnel(filters = {}) {
    try {
        let query = supabase
            .from('personnel')
            .select('*, users(*), facilities(name)')
            .order('hire_date', { ascending: false });

        if (filters.facilityId) query = query.eq('facility_id', filters.facilityId);
        if (filters.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        
        if (error) {
            console.error('Personel listeleme hatası:', error);
            window.ErrorHandler?.handleAPIError(error, 'getPersonnel');
            return [];
        }
        
        return data || [];
        
    } catch (error) {
        console.error('Personel listeleme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'getPersonnel');
        return [];
    }
}

// ==================== TESİS MODÜLÜ ====================

// Tesis ekle
async function addFacility(data) {
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase.from('facilities').insert([{
            name: data.name,
            code: data.code,
            country: data.country,
            city: data.city,
            address: data.address || '',
            category: data.category,
            established_date: data.establishedDate,
            area_sqm: parseInt(data.areaSqm) || 0,
            capacity: parseInt(data.capacity) || 0,
            monthly_budget: parseFloat(data.monthlyBudget) || 0,
            status: 'active',
            created_by: user?.id || null
        }]);

        if (error) {
            console.error('Tesis ekleme hatası:', error);
            window.ErrorHandler?.handleAPIError(error, 'addFacility');
            return { success: false, error };
        }

        window.ToastManager?.show('Tesis başarıyla eklendi', 'success');
        
        // Log audit event
        if (window.ApprovalWorkflow) {
            await window.ApprovalWorkflow.logAuditEvent('CREATE_FACILITY', 'facility', null, {
                name: data.name,
                code: data.code
            });
        }

        return { success: true };
        
    } catch (error) {
        console.error('Tesis ekleme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'addFacility');
        return { success: false, error };
    }
}

// Tesisleri çek
async function getFacilities(filters = {}) {
    try {
        let query = supabase
            .from('facilities')
            .select('*')
            .order('created_at', { ascending: false});

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.country) query = query.eq('country', filters.country);
        if (filters.category) query = query.eq('category', filters.category);

        const { data, error } = await query;
        
        if (error) {
            console.error('Tesis listeleme hatası:', error);
            window.ErrorHandler?.handleAPIError(error, 'getFacilities');
            return [];
        }
        
        return data || [];
        
    } catch (error) {
        console.error('Tesis listeleme hatası:', error);
        window.ErrorHandler?.handleAPIError(error, 'getFacilities');
        return [];
    }
}

// Global export
window.ProjectModule = {
    createProject,
    getProjects,
    updateProjectProgress,
    addTask,
    getProjectTasks
};

window.SacrificeModule = {
    createSacrifice,
    getSacrifices,
    updateSacrificeStatus
};

window.PersonnelModule = {
    addPersonnel,
    getPersonnel
};

window.FacilityModule = {
    addFacility,
    getFacilities
};