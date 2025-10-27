// ==================== SAMPLE DATA GENERATOR ====================
// This script generates sample data for all modules in the NGO Management System
// Author: NGO Management System
// Version: 1.0.0

const SampleDataGenerator = (function() {
    'use strict';

    // Sample data templates
    const SAMPLE_DATA = {
        facilities: [
            {
                name: 'İstanbul Merkez Ofis',
                code: 'IST-001',
                country: 'Türkiye',
                city: 'İstanbul',
                address: 'Kadıköy, İstanbul',
                category: 'office',
                established_date: '2020-01-15',
                area_sqm: 250,
                capacity: 30,
                monthly_budget: 15000,
                status: 'active'
            },
            {
                name: 'Ankara Şubesi',
                code: 'ANK-001',
                country: 'Türkiye',
                city: 'Ankara',
                address: 'Çankaya, Ankara',
                category: 'office',
                established_date: '2020-06-01',
                area_sqm: 180,
                capacity: 20,
                monthly_budget: 12000,
                status: 'active'
            },
            {
                name: 'Nijer Su Kuyusu Sahası',
                code: 'NGR-001',
                country: 'Nijer',
                city: 'Niamey',
                address: 'Niamey, Niger',
                category: 'water_well',
                established_date: '2021-03-10',
                area_sqm: 500,
                capacity: 10,
                monthly_budget: 8000,
                status: 'active'
            },
            {
                name: 'Somali Sağlık Merkezi',
                code: 'SOM-001',
                country: 'Somali',
                city: 'Mogadişu',
                address: 'Mogadishu, Somalia',
                category: 'health_center',
                established_date: '2021-08-20',
                area_sqm: 400,
                capacity: 50,
                monthly_budget: 20000,
                status: 'active'
            },
            {
                name: 'Suriye Eğitim Merkezi',
                code: 'SYR-001',
                country: 'Suriye',
                city: 'İdlib',
                address: 'İdlib, Syria',
                category: 'education',
                established_date: '2019-11-05',
                area_sqm: 600,
                capacity: 100,
                monthly_budget: 25000,
                status: 'active'
            }
        ],

        projects: [
            {
                name: 'Nijer Su Kuyusu Projesi',
                code: 'PRJ-2024-001',
                description: '50 adet su kuyusu açılması',
                category: 'water',
                budget: 500000,
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                target_beneficiaries: 10000,
                status: 'active',
                progress: 45
            },
            {
                name: 'Somali Sağlık Hizmeti',
                code: 'PRJ-2024-002',
                description: 'Sağlık merkezi işletimi ve ilaç temini',
                category: 'health',
                budget: 300000,
                start_date: '2024-01-15',
                end_date: '2024-12-31',
                target_beneficiaries: 5000,
                status: 'active',
                progress: 60
            },
            {
                name: 'Suriye Eğitim Desteği',
                code: 'PRJ-2024-003',
                description: 'Okul malzemesi ve öğretmen maaşları',
                category: 'education',
                budget: 200000,
                start_date: '2024-02-01',
                end_date: '2024-06-30',
                target_beneficiaries: 500,
                status: 'active',
                progress: 75
            },
            {
                name: 'Yemen Gıda Yardımı',
                code: 'PRJ-2024-004',
                description: 'Gıda kolisi dağıtımı',
                category: 'humanitarian',
                budget: 150000,
                start_date: '2024-03-01',
                end_date: '2024-08-31',
                target_beneficiaries: 3000,
                status: 'planning',
                progress: 15
            }
        ],

        transactions: [
            // Income transactions
            {
                type: 'income',
                title: 'Kurumsal Bağış - ABC Şirketi',
                amount: 50000,
                category: 'donation',
                payment_method: 'bank_transfer',
                transaction_date: '2024-10-01',
                status: 'approved',
                notes: 'Yıllık kurumsal bağış'
            },
            {
                type: 'income',
                title: 'Bireysel Bağış - Ali Yılmaz',
                amount: 5000,
                category: 'donation',
                payment_method: 'credit_card',
                transaction_date: '2024-10-15',
                status: 'approved',
                notes: 'Kurban bağışı'
            },
            {
                type: 'income',
                title: 'Hibe - Uluslararası Vakıf',
                amount: 100000,
                category: 'grant',
                payment_method: 'bank_transfer',
                transaction_date: '2024-10-20',
                status: 'approved',
                notes: 'Su kuyusu projesi hibesi'
            },
            // Expense transactions
            {
                type: 'expense',
                title: 'Ofis Kira Ödemesi - İstanbul',
                amount: 8000,
                category: 'rent',
                payment_method: 'bank_transfer',
                transaction_date: '2024-10-05',
                status: 'approved',
                notes: 'Ekim ayı kira'
            },
            {
                type: 'expense',
                title: 'Personel Maaşları - Ekim',
                amount: 35000,
                category: 'salary',
                payment_method: 'bank_transfer',
                transaction_date: '2024-10-01',
                status: 'approved',
                notes: 'Tüm personel maaşları'
            },
            {
                type: 'expense',
                title: 'Saha Malzeme Alımı - Nijer',
                amount: 12000,
                category: 'equipment',
                payment_method: 'bank_transfer',
                transaction_date: '2024-10-22',
                status: 'pending',
                notes: 'Su kuyusu için pompa ve boru malzemeleri'
            },
            {
                type: 'expense',
                title: 'Elektrik Faturası - Ankara',
                amount: 1500,
                category: 'utilities',
                payment_method: 'bank_transfer',
                transaction_date: '2024-10-10',
                status: 'pending',
                notes: 'Ekim ayı elektrik'
            },
            {
                type: 'expense',
                title: 'Araç Yakıt Gideri',
                amount: 3000,
                category: 'transportation',
                payment_method: 'cash',
                transaction_date: '2024-10-25',
                status: 'pending',
                notes: 'Ekim ayı araç yakıt giderleri'
            }
        ],

        sacrifices: [
            {
                donor_name: 'Mehmet Demir',
                donor_phone: '+90 532 111 2233',
                donor_email: 'mehmet@example.com',
                sacrifice_type: 'hisse',
                animal_type: 'büyükbaş',
                sacrifice_date: '2024-06-15',
                amount: 3000,
                payment_status: 'paid',
                sacrifice_status: 'completed',
                notes: 'Kurban kesimi tamamlandı',
                sms_notification: true,
                email_notification: true
            },
            {
                donor_name: 'Ayşe Yılmaz',
                donor_phone: '+90 533 222 3344',
                donor_email: 'ayse@example.com',
                sacrifice_type: 'tam',
                animal_type: 'küçükbaş',
                sacrifice_date: '2024-06-16',
                amount: 2500,
                payment_status: 'paid',
                sacrifice_status: 'completed',
                notes: 'Somali\'de kesildi',
                sms_notification: true,
                email_notification: true
            },
            {
                donor_name: 'Fatma Kaya',
                donor_phone: '+90 534 333 4455',
                donor_email: 'fatma@example.com',
                sacrifice_type: 'hisse',
                animal_type: 'büyükbaş',
                sacrifice_date: '2024-06-17',
                amount: 3000,
                payment_status: 'pending',
                sacrifice_status: 'registered',
                notes: 'Ödeme bekleniyor',
                sms_notification: false,
                email_notification: true
            }
        ],

        personnel: [
            {
                full_name: 'Ahmet Yıldırım',
                email: 'ahmet.yildirim@ngo.org',
                phone: '+90 532 555 1111',
                position: 'Genel Müdür',
                department: 'Yönetim',
                hire_date: '2020-01-01',
                salary: 15000,
                contract_type: 'full-time',
                blood_type: 'A+',
                status: 'active',
                role: 'admin'
            },
            {
                full_name: 'Zeynep Aksoy',
                email: 'zeynep.aksoy@ngo.org',
                phone: '+90 533 555 2222',
                position: 'Mali İşler Müdürü',
                department: 'Finans',
                hire_date: '2020-03-01',
                salary: 12000,
                contract_type: 'full-time',
                blood_type: 'B+',
                status: 'active',
                role: 'finance_manager'
            },
            {
                full_name: 'Mustafa Öztürk',
                email: 'mustafa.ozturk@ngo.org',
                phone: '+90 534 555 3333',
                position: 'Saha Koordinatörü',
                department: 'Operasyon',
                hire_date: '2021-01-15',
                salary: 10000,
                contract_type: 'full-time',
                blood_type: 'O+',
                status: 'active',
                role: 'facility_manager'
            },
            {
                full_name: 'Elif Demir',
                email: 'elif.demir@ngo.org',
                phone: '+90 535 555 4444',
                position: 'Proje Yöneticisi',
                department: 'Projeler',
                hire_date: '2021-06-01',
                salary: 11000,
                contract_type: 'full-time',
                blood_type: 'AB+',
                status: 'active',
                role: 'project_manager'
            },
            {
                full_name: 'Can Yılmaz',
                email: 'can.yilmaz@ngo.org',
                phone: '+90 536 555 5555',
                position: 'Muhasebe Uzmanı',
                department: 'Finans',
                hire_date: '2022-01-01',
                salary: 8000,
                contract_type: 'full-time',
                blood_type: 'A-',
                status: 'active',
                role: 'user'
            }
        ],

        users: [
            {
                email: 'admin@ngo.org',
                full_name: 'Admin User',
                phone: '+90 532 999 9999',
                role: 'admin'
            },
            {
                email: 'mali@ngo.org',
                full_name: 'Mali Müdür',
                phone: '+90 533 999 8888',
                role: 'finance_manager'
            },
            {
                email: 'tesis@ngo.org',
                full_name: 'Tesis Yöneticisi',
                phone: '+90 534 999 7777',
                role: 'facility_manager'
            },
            {
                email: 'proje@ngo.org',
                full_name: 'Proje Yöneticisi',
                phone: '+90 535 999 6666',
                role: 'project_manager'
            }
        ]
    };

    // ==================== GENERATION FUNCTIONS ====================

    /**
     * Generate all sample data
     * @returns {Promise<Object>} - Results of data generation
     */
    async function generateAllData() {
        const results = {
            facilities: { success: 0, failed: 0, errors: [] },
            projects: { success: 0, failed: 0, errors: [] },
            transactions: { success: 0, failed: 0, errors: [] },
            sacrifices: { success: 0, failed: 0, errors: [] },
            personnel: { success: 0, failed: 0, errors: [] },
            users: { success: 0, failed: 0, errors: [] }
        };

        console.log('🚀 Starting sample data generation...');

        // Generate users first (needed for foreign keys)
        results.users = await generateUsers();
        
        // Generate facilities
        results.facilities = await generateFacilities();
        
        // Generate projects (needs facilities)
        results.projects = await generateProjects();
        
        // Generate transactions
        results.transactions = await generateTransactions();
        
        // Generate sacrifices
        results.sacrifices = await generateSacrifices();
        
        // Generate personnel
        results.personnel = await generatePersonnel();

        console.log('✅ Sample data generation completed!', results);
        return results;
    }

    /**
     * Generate sample users
     * @returns {Promise<Object>} - Generation results
     */
    async function generateUsers() {
        const results = { success: 0, failed: 0, errors: [] };

        for (const user of SAMPLE_DATA.users) {
            try {
                // Check if user already exists
                const { data: existing } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', user.email)
                    .single();

                if (existing) {
                    console.log(`User ${user.email} already exists, skipping...`);
                    continue;
                }

                const { error } = await supabase.from('users').insert([user]);
                
                if (error) {
                    results.failed++;
                    results.errors.push({ user: user.email, error: error.message });
                    console.error(`Failed to create user ${user.email}:`, error);
                } else {
                    results.success++;
                    console.log(`✓ Created user: ${user.email}`);
                }
            } catch (e) {
                results.failed++;
                results.errors.push({ user: user.email, error: e.message });
            }
        }

        return results;
    }

    /**
     * Generate sample facilities
     * @returns {Promise<Object>} - Generation results
     */
    async function generateFacilities() {
        const results = { success: 0, failed: 0, errors: [] };

        for (const facility of SAMPLE_DATA.facilities) {
            try {
                // Check if facility already exists
                const { data: existing } = await supabase
                    .from('facilities')
                    .select('id')
                    .eq('code', facility.code)
                    .single();

                if (existing) {
                    console.log(`Facility ${facility.code} already exists, skipping...`);
                    continue;
                }

                const { error } = await supabase.from('facilities').insert([facility]);
                
                if (error) {
                    results.failed++;
                    results.errors.push({ facility: facility.name, error: error.message });
                    console.error(`Failed to create facility ${facility.name}:`, error);
                } else {
                    results.success++;
                    console.log(`✓ Created facility: ${facility.name}`);
                }
            } catch (e) {
                results.failed++;
                results.errors.push({ facility: facility.name, error: e.message });
            }
        }

        return results;
    }

    /**
     * Generate sample projects
     * @returns {Promise<Object>} - Generation results
     */
    async function generateProjects() {
        const results = { success: 0, failed: 0, errors: [] };

        // Get facilities for linking
        const { data: facilities } = await supabase.from('facilities').select('id, name');

        for (let i = 0; i < SAMPLE_DATA.projects.length; i++) {
            const project = { ...SAMPLE_DATA.projects[i] };
            
            try {
                // Assign facility if available
                if (facilities && facilities.length > 0) {
                    project.facility_id = facilities[i % facilities.length].id;
                }

                // Check if project already exists
                const { data: existing } = await supabase
                    .from('projects')
                    .select('id')
                    .eq('code', project.code)
                    .single();

                if (existing) {
                    console.log(`Project ${project.code} already exists, skipping...`);
                    continue;
                }

                const { error } = await supabase.from('projects').insert([project]);
                
                if (error) {
                    results.failed++;
                    results.errors.push({ project: project.name, error: error.message });
                    console.error(`Failed to create project ${project.name}:`, error);
                } else {
                    results.success++;
                    console.log(`✓ Created project: ${project.name}`);
                }
            } catch (e) {
                results.failed++;
                results.errors.push({ project: project.name, error: e.message });
            }
        }

        return results;
    }

    /**
     * Generate sample transactions
     * @returns {Promise<Object>} - Generation results
     */
    async function generateTransactions() {
        const results = { success: 0, failed: 0, errors: [] };

        // Get facilities for linking
        const { data: facilities } = await supabase.from('facilities').select('id');

        for (let i = 0; i < SAMPLE_DATA.transactions.length; i++) {
            const transaction = { ...SAMPLE_DATA.transactions[i] };
            
            try {
                // Assign facility to some transactions
                if (facilities && facilities.length > 0 && Math.random() > 0.5) {
                    transaction.facility_id = facilities[Math.floor(Math.random() * facilities.length)].id;
                }

                const { error } = await supabase.from('transactions').insert([transaction]);
                
                if (error) {
                    results.failed++;
                    results.errors.push({ transaction: transaction.title, error: error.message });
                    console.error(`Failed to create transaction ${transaction.title}:`, error);
                } else {
                    results.success++;
                    console.log(`✓ Created transaction: ${transaction.title}`);
                }
            } catch (e) {
                results.failed++;
                results.errors.push({ transaction: transaction.title, error: e.message });
            }
        }

        return results;
    }

    /**
     * Generate sample sacrifices
     * @returns {Promise<Object>} - Generation results
     */
    async function generateSacrifices() {
        const results = { success: 0, failed: 0, errors: [] };

        // Get facilities for linking
        const { data: facilities } = await supabase.from('facilities').select('id');

        for (let i = 0; i < SAMPLE_DATA.sacrifices.length; i++) {
            const sacrifice = { ...SAMPLE_DATA.sacrifices[i] };
            
            // Generate unique code
            sacrifice.code = `KRB-2024-${String(100000 + i).slice(-6)}`;
            
            try {
                // Assign facility
                if (facilities && facilities.length > 0) {
                    sacrifice.facility_id = facilities[i % facilities.length].id;
                }

                const { error } = await supabase.from('sacrifices').insert([sacrifice]);
                
                if (error) {
                    results.failed++;
                    results.errors.push({ sacrifice: sacrifice.donor_name, error: error.message });
                    console.error(`Failed to create sacrifice for ${sacrifice.donor_name}:`, error);
                } else {
                    results.success++;
                    console.log(`✓ Created sacrifice: ${sacrifice.donor_name}`);
                }
            } catch (e) {
                results.failed++;
                results.errors.push({ sacrifice: sacrifice.donor_name, error: e.message });
            }
        }

        return results;
    }

    /**
     * Generate sample personnel
     * @returns {Promise<Object>} - Generation results
     */
    async function generatePersonnel() {
        const results = { success: 0, failed: 0, errors: [] };

        // Get facilities and users for linking
        const { data: facilities } = await supabase.from('facilities').select('id');
        const { data: users } = await supabase.from('users').select('id, email');

        for (let i = 0; i < SAMPLE_DATA.personnel.length; i++) {
            const person = { ...SAMPLE_DATA.personnel[i] };
            
            try {
                // First create or get user
                let userId;
                const existingUser = users?.find(u => u.email === person.email);
                
                if (existingUser) {
                    userId = existingUser.id;
                } else {
                    const { data: newUser, error: userError } = await supabase
                        .from('users')
                        .insert([{
                            email: person.email,
                            full_name: person.full_name,
                            phone: person.phone,
                            role: person.role || 'user'
                        }])
                        .select()
                        .single();

                    if (userError) throw userError;
                    userId = newUser.id;
                }

                // Check if personnel already exists
                const { data: existing } = await supabase
                    .from('personnel')
                    .select('id')
                    .eq('user_id', userId)
                    .single();

                if (existing) {
                    console.log(`Personnel ${person.email} already exists, skipping...`);
                    continue;
                }

                // Create personnel record
                const personnelData = {
                    user_id: userId,
                    position: person.position,
                    department: person.department,
                    hire_date: person.hire_date,
                    salary: person.salary,
                    contract_type: person.contract_type,
                    blood_type: person.blood_type,
                    status: person.status
                };

                // Assign facility
                if (facilities && facilities.length > 0) {
                    personnelData.facility_id = facilities[i % facilities.length].id;
                }

                const { error } = await supabase.from('personnel').insert([personnelData]);
                
                if (error) {
                    results.failed++;
                    results.errors.push({ personnel: person.full_name, error: error.message });
                    console.error(`Failed to create personnel ${person.full_name}:`, error);
                } else {
                    results.success++;
                    console.log(`✓ Created personnel: ${person.full_name}`);
                }
            } catch (e) {
                results.failed++;
                results.errors.push({ personnel: person.full_name, error: e.message });
            }
        }

        return results;
    }

    /**
     * Clear all sample data
     * @returns {Promise<Object>} - Deletion results
     */
    async function clearAllData() {
        console.log('🗑️ Clearing all sample data...');

        const results = {
            personnel: { deleted: 0, error: null },
            sacrifices: { deleted: 0, error: null },
            transactions: { deleted: 0, error: null },
            projects: { deleted: 0, error: null },
            facilities: { deleted: 0, error: null },
            users: { deleted: 0, error: null }
        };

        // Delete in reverse order (due to foreign keys)
        try {
            const { error: personnelError } = await supabase.from('personnel').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (!personnelError) results.personnel.deleted = 1;
            else results.personnel.error = personnelError.message;

            const { error: sacrificesError } = await supabase.from('sacrifices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (!sacrificesError) results.sacrifices.deleted = 1;
            else results.sacrifices.error = sacrificesError.message;

            const { error: transactionsError } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (!transactionsError) results.transactions.deleted = 1;
            else results.transactions.error = transactionsError.message;

            const { error: projectsError } = await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (!projectsError) results.projects.deleted = 1;
            else results.projects.error = projectsError.message;

            const { error: facilitiesError } = await supabase.from('facilities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (!facilitiesError) results.facilities.deleted = 1;
            else results.facilities.error = facilitiesError.message;

        } catch (e) {
            console.error('Error clearing data:', e);
        }

        console.log('✅ Sample data cleared!', results);
        return results;
    }

    // ==================== PUBLIC API ====================

    return {
        generateAllData,
        generateUsers,
        generateFacilities,
        generateProjects,
        generateTransactions,
        generateSacrifices,
        generatePersonnel,
        clearAllData,
        SAMPLE_DATA
    };

})();

// Export to window
window.SampleDataGenerator = SampleDataGenerator;

// Log module load
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('✅ Sample Data Generator Module loaded!');
}
