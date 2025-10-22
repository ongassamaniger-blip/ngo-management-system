// PROFİL YÖNETİMİ - Kullanıcı & Şifre

// Profil bilgilerini yükle
async function loadProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single();

    if (!user) return;

    // Formu doldur
    document.getElementById('profileFullName').value = user.full_name || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profilePhone').value = user.phone || '';
    document.getElementById('profileRole').value = getRoleText(user.role);
}

// Profil güncelle
async function updateProfile(data) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: 'Oturum bulunamadı' };

    const { error } = await supabase
        .from('users')
        .update({
            full_name: data.fullName,
            phone: data.phone
        })
        .eq('email', session.user.email);

    if (error) {
        console.error('Profil güncelleme hatası:', error);
        return { success: false, error };
    }

    // Dashboard'daki kullanıcı adını güncelle
    const initials = data.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('userInitials').textContent = initials;
    document.getElementById('userName').textContent = data.fullName;

    return { success: true };
}

// Şifre değiştir
async function changePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        console.error('Şifre değiştirme hatası:', error);
        return { success: false, error };
    }

    return { success: true };
}

// Avatar yükle (Base64)
async function uploadAvatar(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target.result;
            
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                resolve({ success: false, error: 'Oturum bulunamadı' });
                return;
            }

            const { error } = await supabase
                .from('users')
                .update({ avatar_url: base64 })
                .eq('email', session.user.email);

            if (error) {
                console.error('Avatar yükleme hatası:', error);
                resolve({ success: false, error });
            } else {
                // Avatar önizlemesini güncelle
                document.getElementById('avatarPreview').src = base64;
                resolve({ success: true, url: base64 });
            }
        };
        reader.readAsDataURL(file);
    });
}

// Kullanıcı listesini getir (Admin için)
async function getUsersList() {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Kullanıcı listesi hatası:', error);
        return [];
    }

    return data || [];
}

// Yeni kullanıcı ekle
async function addNewUser(userData) {
    // Email ile kullanıcı oluştur
    const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
            data: {
                full_name: userData.fullName
            }
        }
    });

    if (authError) {
        console.error('Auth kullanıcı oluşturma hatası:', authError);
        return { success: false, error: authError };
    }

    // Users tablosuna ekle
    const { error: dbError } = await supabase
        .from('users')
        .insert([{
            email: userData.email,
            full_name: userData.fullName,
            phone: userData.phone || '',
            role: userData.role || 'user',
            facility_id: userData.facilityId || null
        }]);

    if (dbError) {
        console.error('DB kullanıcı oluşturma hatası:', dbError);
        return { success: false, error: dbError };
    }

    return { success: true, data: authUser };
}

// Kullanıcı sil
async function deleteUser(userId) {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

    if (error) {
        console.error('Kullanıcı silme hatası:', error);
        return { success: false, error };
    }

    return { success: true };
}

// Kullanıcı rolünü güncelle
async function updateUserRole(userId, newRole) {
    const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) {
        console.error('Rol güncelleme hatası:', error);
        return { success: false, error };
    }

    return { success: true };
}

// Rol metni
function getRoleText(role) {
    const roles = {
        'admin': 'Yönetici',
        'finance_manager': 'Mali Müdür',
        'project_manager': 'Proje Müdürü',
        'user': 'Kullanıcı'
    };
    return roles[role] || 'Kullanıcı';
}

// Global export
window.ProfileModule = {
    loadProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    getUsersList,
    addNewUser,
    deleteUser,
    updateUserRole
};