// NETWORK MONITOR - İnternet bağlantısını izle
class NetworkMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.listeners = [];
        this.init();
    }

    // Initialize
    init() {
        // Online/offline eventleri
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Sayfa yüklendiğinde kontrol et
        if (!this.isOnline) {
            this.showOfflineWarning();
        }
    }

    // Online olduğunda
    handleOnline() {
        this.isOnline = true;
        console.log('🟢 Internet connection restored');
        
        window.ToastManager?.success('İnternet bağlantısı yeniden kuruldu', {
            title: 'Çevrimiçi',
            duration: 3000
        });

        this.hideOfflineWarning();
        this.notifyListeners('online');
    }

    // Offline olduğunda
    handleOffline() {
        this.isOnline = false;
        console.warn('🔴 Internet connection lost');
        
        window.ToastManager?.error('İnternet bağlantısı kesildi', {
            title: 'Çevrimdışı',
            duration: 0,
            closable: false
        });

        this.showOfflineWarning();
        this.notifyListeners('offline');
    }

    // Offline uyarısı göster
    showOfflineWarning() {
        if (document.getElementById('offlineWarning')) return;

        const warning = document.createElement('div');
        warning.id = 'offlineWarning';
        warning.className = 'fixed top-0 left-0 right-0 bg-red-600 text-white py-2 px-4 text-center z-[9999] shadow-lg';
        warning.innerHTML = `
            <div class="flex items-center justify-center space-x-2">
                <i class="fas fa-wifi-slash"></i>
                <span class="font-semibold">İnternet bağlantısı yok</span>
                <span class="text-red-200">•</span>
                <span class="text-sm">Bazı özellikler çalışmayabilir</span>
            </div>
        `;
        document.body.appendChild(warning);
    }

    // Offline uyarısını gizle
    hideOfflineWarning() {
        const warning = document.getElementById('offlineWarning');
        if (warning) {
            warning.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => warning.remove(), 300);
        }

        // CSS animation ekle
        if (!document.getElementById('networkStyles')) {
            const style = document.createElement('style');
            style.id = 'networkStyles';
            style.textContent = `
                @keyframes slideUp {
                    to { transform: translateY(-100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Listener ekle
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Listener'ları bilgilendir
    notifyListeners(status) {
        this.listeners.forEach(callback => {
            try {
                callback(status, this.isOnline);
            } catch (error) {
                console.error('Network listener error:', error);
            }
        });
    }

    // Bağlantı durumunu kontrol et
    async checkConnection() {
        try {
            const response = await fetch('https://www.google.com/favicon.ico', {
                mode: 'no-cors',
                cache: 'no-cache'
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    // API isteği için retry logic
    async fetchWithRetry(fetchFn, maxRetries = 3, delay = 1000) {
        let lastError;

        for (let i = 0; i < maxRetries; i++) {
            try {
                if (!this.isOnline) {
                    throw new Error('No internet connection');
                }

                const result = await fetchFn();
                return { success: true, data: result, error: null };

            } catch (error) {
                lastError = error;
                console.warn(`Attempt ${i + 1}/${maxRetries} failed:`, error.message);

                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                }
            }
        }

        window.ToastManager?.error('İşlem başarısız oldu. Lütfen tekrar deneyin.', {
            title: 'Bağlantı Hatası'
        });

        return { success: false, data: null, error: lastError };
    }

    // Status al
    getStatus() {
        return {
            isOnline: this.isOnline,
            connectionType: navigator.connection?.effectiveType || 'unknown',
            downlink: navigator.connection?.downlink || null,
            rtt: navigator.connection?.rtt || null
        };
    }
}

// Global instance
window.NetworkMonitor = new NetworkMonitor();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkMonitor;
}