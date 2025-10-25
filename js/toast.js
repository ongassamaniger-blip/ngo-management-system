// ==================== TOAST MANAGER - GELİŞMİŞ BİLDİRİM SİSTEMİ ====================

class ToastManager {
    static container = null;
    static queue = [];
    static maxToasts = 5;
    static defaultDuration = 3000;

    // Container'ı başlat
    static init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none';
            document.body.appendChild(this.container);
            
            // CSS ekle
            this.injectStyles();
        }
    }

    // CSS stilleri
    static injectStyles() {
        if (document.getElementById('toast-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { 
                    opacity: 0; 
                    transform: translateX(100px) scale(0.9); 
                }
                to { 
                    opacity: 1; 
                    transform: translateX(0) scale(1); 
                }
            }
            
            @keyframes slideOutRight {
                from { 
                    opacity: 1; 
                    transform: translateX(0) scale(1); 
                }
                to { 
                    opacity: 0; 
                    transform: translateX(100px) scale(0.9); 
                }
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
            }
            
            .toast-item {
                pointer-events: auto;
                animation: slideInRight 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            .toast-item.removing {
                animation: slideOutRight 0.3s ease-out;
            }
            
            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                animation: progress linear;
            }
            
            .toast-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }
            
            #toast-container > * {
                margin-bottom: 8px;
            }
        `;
        document.head.appendChild(style);
    }

    // Temel toast göster
    static show(message, type = 'info', duration = this.defaultDuration, options = {}) {
        this.init();

        // Maksimum toast sayısını kontrol et
        const toasts = this.container.querySelectorAll('.toast-item');
        if (toasts.length >= this.maxToasts) {
            toasts[0].remove();
        }

        const config = {
            success: {
                bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
                icon: 'fa-check-circle',
                sound: true
            },
            error: {
                bg: 'bg-gradient-to-r from-red-500 to-rose-600',
                icon: 'fa-times-circle',
                sound: true
            },
            warning: {
                bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
                icon: 'fa-exclamation-triangle',
                sound: false
            },
            info: {
                bg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
                icon: 'fa-info-circle',
                sound: false
            },
            loading: {
                bg: 'bg-gradient-to-r from-purple-500 to-indigo-600',
                icon: 'fa-spinner fa-spin',
                sound: false
            }
        };

        const typeConfig = config[type] || config.info;

        const toast = document.createElement('div');
        toast.className = `toast-item ${typeConfig.bg} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 min-w-[320px] max-w-md relative overflow-hidden backdrop-blur-sm`;
        
        // Progress bar ekle (eğer duration varsa)
        let progressBar = '';
        if (duration > 0 && type !== 'loading') {
            progressBar = `<div class="toast-progress" style="animation-duration: ${duration}ms;"></div>`;
        }

        toast.innerHTML = `
            <div class="flex-shrink-0">
                <i class="fas ${typeConfig.icon} text-2xl"></i>
            </div>
            <div class="flex-1 min-w-0">
                ${options.title ? `<p class="font-bold text-sm mb-1">${options.title}</p>` : ''}
                <p class="font-semibold text-sm ${options.title ? 'text-white/90' : ''}">${message}</p>
            </div>
            ${type !== 'loading' ? `
                <button class="toast-close flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-200">
                    <i class="fas fa-times text-sm"></i>
                </button>
            ` : ''}
            ${progressBar}
        `;
        
        // Close butonu
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.remove(toast);
        }

        // Toast'ı ekle
        this.container.appendChild(toast);

        // Ses efekti (opsiyonel)
        if (typeConfig.sound && options.sound !== false) {
            this.playSound(type);
        }

        // Auto remove (loading hariç)
        let autoRemoveTimer = null;
        if (duration > 0 && type !== 'loading') {
            autoRemoveTimer = setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        // Toast nesnesini döndür (loading için güncelleme yapabilmek için)
        toast.toastId = Date.now() + Math.random();
        toast.remove = () => {
            if (autoRemoveTimer) clearTimeout(autoRemoveTimer);
            this.remove(toast);
        };
        toast.update = (newMessage, newType) => {
            if (autoRemoveTimer) clearTimeout(autoRemoveTimer);
            this.update(toast, newMessage, newType, duration);
        };

        return toast;
    }

    // Toast kaldır
    static remove(toast) {
        if (!toast || !toast.parentElement) return;
        
        toast.classList.add('removing');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }

    // Toast güncelle (loading -> success gibi)
    static update(toast, message, type = 'success', duration = this.defaultDuration) {
        const config = {
            success: {
                bg: 'from-green-500 to-emerald-600',
                icon: 'fa-check-circle'
            },
            error: {
                bg: 'from-red-500 to-rose-600',
                icon: 'fa-times-circle'
            },
            warning: {
                bg: 'from-yellow-500 to-orange-500',
                icon: 'fa-exclamation-triangle'
            },
            info: {
                bg: 'from-blue-500 to-cyan-600',
                icon: 'fa-info-circle'
            }
        };

        const typeConfig = config[type] || config.success;

        // Renk değiştir
        toast.className = `toast-item bg-gradient-to-r ${typeConfig.bg} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 min-w-[320px] max-w-md relative overflow-hidden backdrop-blur-sm`;
        
        // İçeriği güncelle
        const iconElement = toast.querySelector('.fa-spinner') || toast.querySelector('.fas');
        if (iconElement) {
            iconElement.className = `fas ${typeConfig.icon} text-2xl`;
        }
        
        const messageElement = toast.querySelector('.font-semibold');
        if (messageElement) {
            messageElement.textContent = message;
        }

        // Close butonu ekle (loading'den geliyorsa)
        if (!toast.querySelector('.toast-close')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'toast-close flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-200';
            closeBtn.innerHTML = '<i class="fas fa-times text-sm"></i>';
            closeBtn.onclick = () => this.remove(toast);
            toast.appendChild(closeBtn);
        }

        // Progress bar ekle
        const progressBar = document.createElement('div');
        progressBar.className = 'toast-progress';
        progressBar.style.animationDuration = `${duration}ms`;
        toast.appendChild(progressBar);

        // Bounce animasyonu
        toast.style.animation = 'bounce 0.5s ease';
        
        // Auto remove
        setTimeout(() => {
            this.remove(toast);
        }, duration);

        // Ses efekti
        this.playSound(type);
    }

    // Kısa yollar
    static success(message, duration, options) {
        return this.show(message, 'success', duration, options);
    }

    static error(message, duration, options) {
        return this.show(message, 'error', duration, options);
    }

    static warning(message, duration, options) {
        return this.show(message, 'warning', duration, options);
    }

    static info(message, duration, options) {
        return this.show(message, 'info', duration, options);
    }

    static loading(message = 'Yükleniyor...', options) {
        return this.show(message, 'loading', 0, options);
    }

    // Promise ile çalışan loading
    static async promise(promise, messages = {}) {
        const defaults = {
            loading: 'İşlem yapılıyor...',
            success: 'İşlem başarılı!',
            error: 'Bir hata oluştu!'
        };
        
        const msgs = { ...defaults, ...messages };
        
        const toast = this.loading(msgs.loading);
        
        try {
            const result = await promise;
            toast.update(msgs.success, 'success');
            return result;
        } catch (error) {
            const errorMsg = typeof msgs.error === 'function' ? msgs.error(error) : msgs.error;
            toast.update(errorMsg, 'error');
            throw error;
        }
    }

    // Onay dialogu
    static confirm(message, title = 'Onay', options = {}) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] animate-fade-in';
            modal.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-4 shadow-2xl transform scale-100 animate-scale-in">
                    <div class="flex items-start mb-4">
                        <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-question-circle text-blue-600 dark:text-blue-400 text-2xl"></i>
                        </div>
                        <div class="ml-4 flex-1">
                            <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">${title}</h3>
                            <p class="text-gray-600 dark:text-gray-300">${message}</p>
                        </div>
                    </div>
                    <div class="flex space-x-3 mt-6">
                        <button id="confirmBtn" class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                            ${options.confirmText || 'Evet'}
                        </button>
                        <button id="cancelBtn" class="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-all duration-200">
                            ${options.cancelText || 'İptal'}
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('#confirmBtn').onclick = () => {
                modal.style.animation = 'fadeOut 0.2s ease';
                setTimeout(() => modal.remove(), 200);
                resolve(true);
            };
            
            modal.querySelector('#cancelBtn').onclick = () => {
                modal.style.animation = 'fadeOut 0.2s ease';
                setTimeout(() => modal.remove(), 200);
                resolve(false);
            };
            
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.animation = 'fadeOut 0.2s ease';
                    setTimeout(() => modal.remove(), 200);
                    resolve(false);
                }
            };

            // ESC tuşu ile kapat
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    modal.style.animation = 'fadeOut 0.2s ease';
                    setTimeout(() => modal.remove(), 200);
                    resolve(false);
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        });
    }

    // Prompt dialogu (input ile)
    static prompt(message, title = 'Giriş', defaultValue = '', options = {}) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] animate-fade-in';
            modal.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl transform scale-100 animate-scale-in">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">${title}</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-4">${message}</p>
                    <input type="${options.type || 'text'}" 
                           id="promptInput" 
                           value="${defaultValue}"
                           placeholder="${options.placeholder || ''}"
                           class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200">
                    <div class="flex space-x-3 mt-6">
                        <button id="submitBtn" class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                            ${options.submitText || 'Tamam'}
                        </button>
                        <button id="cancelBtn" class="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-all duration-200">
                            ${options.cancelText || 'İptal'}
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const input = modal.querySelector('#promptInput');
            input.focus();
            input.select();
            
            const submit = () => {
                const value = input.value.trim();
                if (value || !options.required) {
                    modal.style.animation = 'fadeOut 0.2s ease';
                    setTimeout(() => modal.remove(), 200);
                    resolve(value || null);
                } else {
                    input.classList.add('border-red-500');
                    input.animate([
                        { transform: 'translateX(0)' },
                        { transform: 'translateX(-10px)' },
                        { transform: 'translateX(10px)' },
                        { transform: 'translateX(0)' }
                    ], {
                        duration: 300,
                        easing: 'ease-in-out'
                    });
                }
            };
            
            modal.querySelector('#submitBtn').onclick = submit;
            input.onkeypress = (e) => {
                if (e.key === 'Enter') submit();
            };
            
            modal.querySelector('#cancelBtn').onclick = () => {
                modal.style.animation = 'fadeOut 0.2s ease';
                setTimeout(() => modal.remove(), 200);
                resolve(null);
            };
            
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.animation = 'fadeOut 0.2s ease';
                    setTimeout(() => modal.remove(), 200);
                    resolve(null);
                }
            };
        });
    }

    // Ses efekti (opsiyonel - tarayıcı izni gerektirir)
    static playSound(type) {
        // Basit ses efekti için Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Ses tiplerine göre farklı frekanslar
            const frequencies = {
                success: [523.25, 659.25], // C5, E5
                error: [329.63, 261.63], // E4, C4
                warning: [440, 440], // A4
                info: [523.25] // C5
            };

            const freq = frequencies[type] || frequencies.info;
            
            oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime);
            if (freq[1]) {
                oscillator.frequency.exponentialRampToValueAtTime(freq[1], audioContext.currentTime + 0.1);
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Ses çalmazsa sessizce devam et
        }
    }

    // Tüm toast'ları temizle
    static clear() {
        if (this.container) {
            const toasts = this.container.querySelectorAll('.toast-item');
            toasts.forEach(toast => this.remove(toast));
        }
    }
}

// Fade in/out animasyonları
const extraStyles = document.createElement('style');
extraStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes scale-in {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    
    .animate-fade-in {
        animation: fadeIn 0.2s ease;
    }
    
    .animate-scale-in {
        animation: scale-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
`;
document.head.appendChild(extraStyles);

// Global export
window.ToastManager = ToastManager;

// Eski showToast fonksiyonunu override et (geriye dönük uyumluluk için)
window.showToast = (message, type = 'info') => {
    ToastManager.show(message, type);
};

console.log('✅ Toast Manager yüklendi!');