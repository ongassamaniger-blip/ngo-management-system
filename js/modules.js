// PROJE & KURBAN & PERSONEL MODÜLLERI

// ==================== PROJE MODÜLÜ ====================

// Yeni proje oluştur
async function createProject(data) {
    const code = `PRJ-${Date.now()}`;
    
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
        status: 'planning'
    }]).select();

    if (error) {
        console.error('Proje oluşturma hatası:', error);
        return { success: false, error };
    }

    return { success: true, data: project[0] };
}

// Projeleri listele
async function getProjects(filters = {}) {
    let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.facilityId) query = query.eq('facility_id', filters.facilityId);

    const { data, error } = await query;
    return data || [];
}

// Proje ilerlemesini güncelle
async function updateProjectProgress(projectId, progress) {
    const { error } = await supabase
        .from('projects')
        .update({ progress: progress })
        .eq('id', projectId);

    return !error;
}

// Projeye görev ekle
async function addTask(projectId, taskData) {
    const { error } = await supabase.from('tasks').insert([{
        project_id: projectId,
        title: taskData.title,
        description: taskData.description || '',
        assigned_to: taskData.assignedTo || null,
        due_date: taskData.dueDate || null,
        priority: taskData.priority || 'normal',
        status: 'pending'
    }]);

    return !error;
}

// Proje görevlerini çek
async function getProjectTasks(projectId) {
    const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    return data || [];
}

// ==================== KURBAN MODÜLÜ ====================

// Kurban kaydı oluştur
async function createSacrifice(data) {
    const code = `KRB-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
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
        email_notification: data.emailNotification || false
    }]).select();

    if (error) {
        console.error('Kurban kaydı hatası:', error);
        return { success: false, error };
    }

    if (data.paymentStatus === 'paid') {
        await supabase.from('transactions').insert([{
            type: 'income',
            title: `Kurban - ${data.donorName}`,
            amount: parseFloat(data.amount),
            category: 'sacrifice',
            transaction_date: new Date().toISOString().split('T')[0],
            status: 'approved'
        }]);
    }

    return { success: true, data: sacrifice[0] };
}

// Kurban kayıtlarını listele
async function getSacrifices(filters = {}) {
    let query = supabase
        .from('sacrifices')
        .select('*')
        .order('created_at', { ascending: false });

    if (filters.status) query = query.eq('sacrifice_status', filters.status);
    if (filters.facilityId) query = query.eq('facility_id', filters.facilityId);
    if (filters.year) {
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        query = query.gte('sacrifice_date', startDate).lte('sacrifice_date', endDate);
    }

    const { data, error } = await query;
    return data || [];
}

// Kurban durumunu güncelle
async function updateSacrificeStatus(id, status) {
    const { error } = await supabase
        .from('sacrifices')
        .update({ sacrifice_status: status })
        .eq('id', id);

    return !error;
}

// ==================== PERSONEL MODÜLÜ ====================

// Personel ekle
async function addPersonnel(data) {
    const { data: user, error: userError } = await supabase.from('users').insert([{
        email: data.email,
        full_name: data.fullName,
        phone: data.phone,
        role: 'user',
        facility_id: data.facilityId
    }]).select();

    if (userError) {
        console.error('Kullanıcı oluşturma hatası:', userError);
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
        status: 'active'
    }]);

    if (personnelError) {
        console.error('Personel kaydı hatası:', personnelError);
        return { success: false, error: personnelError };
    }

    return { success: true };
}

// Personel listesi
async function getPersonnel(filters = {}) {
    let query = supabase
        .from('personnel')
        .select('*, users(*), facilities(name)')
        .order('hire_date', { ascending: false });

    if (filters.facilityId) query = query.eq('facility_id', filters.facilityId);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    return data || [];
}

// ==================== TESİS MODÜLÜ ====================

// Tesis ekle
async function addFacility(data) {
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
        status: 'active'
    }]);

    return !error;
}

// Tesisleri çek
async function getFacilities(filters = {}) {
    let query = supabase
        .from('facilities')
        .select('*')
        .order('created_at', { ascending: false});

    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    return data || [];
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