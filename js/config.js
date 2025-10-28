// SUPABASE AYARLARI
const SUPABASE_URL = 'https://duyljvmymdjiooxxjhxw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eWxqdm15bWRqaW9veHhqaHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzQ3NTIsImV4cCI6MjA3NjYxMDc1Mn0.Au9f71CHZ59vOrQd97fGEB7UJhlt3EKoHwhalk41ZsU';

// Supabase istemcisini güvenli şekilde başlat
let supabase = null;
let initializationAttempted = false;

/**
 * Supabase istemcisini başlatır
 * Kütüphane yüklenene kadar bekler ve tekrar dener
 */
function initializeSupabase() {
    if (initializationAttempted) {
        return supabase !== null;
    }
    
    initializationAttempted = true;
    
    try {
        // window.supabase kütüphanesinin yüklendiğini kontrol et
        if (typeof window.supabase === 'undefined' || window.supabase === null) {
            console.warn('⚠️ Supabase kütüphanesi yüklenmedi - CDN engellenmiş olabilir');
            return false;
        }
        
        // Eğer window.supabase bir fonksiyon/kütüphane ise
        if (typeof window.supabase.createClient === 'function') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('✅ Supabase client başarıyla başlatıldı');
            return true;
        } else {
            console.warn('⚠️ Supabase.createClient fonksiyonu bulunamadı');
            return false;
        }
    } catch (error) {
        console.error('❌ Supabase başlatma hatası:', error);
        return false;
    }
}

/**
 * Supabase istemcisini al - henüz başlatılmamışsa başlat
 * @returns {Object|null} Supabase client veya null
 */
function getSupabaseClient() {
    if (!supabase && !initializationAttempted) {
        initializeSupabase();
    }
    
    if (!supabase) {
        console.error('❌ Supabase client başlatılamadı. Lütfen sayfayı yenileyin veya internet bağlantınızı kontrol edin.');
        if (typeof window.ToastManager !== 'undefined' && window.ToastManager.show) {
            window.ToastManager.show('Veritabanı bağlantısı kurulamadı. Lütfen sayfayı yenileyin.', 'error');
        }
    }
    
    return supabase;
}

// Sayfa yüklendiğinde Supabase'i başlat
// Kütüphanenin yüklenmesi için birkaç saniye bekle
function attemptInitialization() {
    if (!initializationAttempted) {
        setTimeout(() => {
            if (initializeSupabase()) {
                console.log('✅ Supabase otomatik başlatma başarılı');
            } else {
                // Başarısız olursa birkaç kez daha dene
                let retryCount = 0;
                const retryInterval = setInterval(() => {
                    retryCount++;
                    initializationAttempted = false; // Reset flag için
                    if (initializeSupabase() || retryCount >= 5) {
                        clearInterval(retryInterval);
                        if (supabase) {
                            console.log('✅ Supabase başlatma başarılı (retry)');
                        } else {
                            console.error('❌ Supabase başlatılamadı - CDN erişilebilir değil');
                        }
                    }
                }, 500);
            }
        }, 200);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attemptInitialization);
} else {
    attemptInitialization();
}