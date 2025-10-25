// TOAST MANAGER - Gelişmiş bildirim sistemi
class ToastManager {
    constructor() {
        this.toasts = [];
        this.maxToasts = 5;
        this.defaultDuration = 3000;
        this.createContainer();
    }

    // Toast container oluştur
    createContainer() {
        if (document.getElementById('toastContainer')) return;

        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed top-4 right-4 z-[9999] space-y-3';
        container.style.maxWidth = '400px';
        document.body.appendChild(container);
    }

    // Toast göster
    show(message, type = 'info', options = {}) {
        const {
            duration = this.defaultDuration,
            title = '',
            action = null,
            icon = null,
            closable = true,
            progress = true
        } = options;

        // Maksimum toast sayısı kontrolü
        if (this.toasts.length >= this.maxToasts) {
            this.removeOldest();
        }

        // Toast ID
        const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Toast tiplerine göre renkler ve ikonlar
        const styles = {
            success: {
                bg: 'bg-green-500',
                icon: icon || 'fa-check-circle',
                text: 'text-white'
            },
            error: {
                bg: 'bg-red-500',
                icon: icon || 'fa-exclamation-circle',
                text: 'text-white'
            },
            warning: {
                bg: 'bg-yellow-500',
                icon: icon || 'fa-exclamation-triangle',
                text: 'text-white'
            },
            info: {
                bg: 'bg-blue-500',
                icon: icon || 'fa-info-circle',
                text: 'text-white'
            }
        };

        const style = styles[type] || styles.info;

        // Toast HTML
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `${style.bg} ${style.text} rounded-xl shadow-2xl p-4 transform transition-all duration-300 translate-x-0 opacity-100`;
        
        toast.innerHTML = `
            <div class="flex items-start space-x-3">
                <i class="fas ${style.icon} text-xl flex-shrink-0 mt-1"></i>
                <div class="flex-1 min-w-0">
                    ${title ? `<h4 class="font-bold mb-1">${title}</h4>` : ''}
                    <p class="text-sm opacity-90">${message}</p>
                    ${action ? `<button onclick="${action.onClick}" class="mt-2 text-xs font-semibold underline hover:no-underline">${action.text}</button>` : ''}
                </div>
                ${closable ? `
                    <button onclick="window.ToastManager.remove('${toastId}')" class="flex-shrink-0 opacity-70 hover:opacity-100 transition">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </div>
            ${progress && duration > 0 ? `
                <div class="mt-3 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                    <div class="h-full bg-white rounded-full transition-all" style="width: 100%; animation: shrink ${duration}ms linear;"></div>
                </div>
            ` : ''}
        `;

        // Container'a ekle
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);

        // Listeye ekle
        this.toasts.push({
            id: toastId,
            element: toast,
            timestamp: Date.now()
        });

        // Animasyon için setTimeout
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);

        // Otomatik kaldır
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toastId);
            }, duration);
        }

        // CSS animation ekle (bir kere)
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.textContent = `
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                
                #toastContainer > div {
                    transform: translateX(100%);
                    opacity: 0;
                }
            `;
            document.head.appendChild(style);
        }

        return toastId;
    }

    // Toast kaldır
    remove(toastId) {
        const toast = document.getElementById(toastId);
        if (!toast) return;

        // Animasyon ile kaldır
        toast.style.transform = 'translateX(400px)';
        toast.style.opacity = '0';

        setTimeout(() => {
            toast.remove();
            this.toasts = this.toasts.filter(t => t.id !== toastId);
        }, 300);
    }

    // En eski toast'u kaldır
    removeOldest() {
        if (this.toasts.length === 0) return;
        const oldest = this.toasts[0];
        this.remove(oldest.id);
    }

    // Tüm toast'ları kaldır
    clearAll() {
        this.toasts.forEach(toast => {
            this.remove(toast.id);
        });
    }

    // Shortcut metodlar
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', { ...options, duration: 5000 });
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    // Confirm toast (action butonlu)
    confirm(message, onConfirm, options = {}) {
        return this.show(message, 'warning', {
            ...options,
            duration: 0,
            action: {
                text: 'Onayla',
                onClick: `window.ToastManager.confirmAction('${onConfirm}')`
            }
        });
    }

    // Action handler
    confirmAction(callback) {
        if (typeof callback === 'function') {
            callback();
        } else if (typeof window[callback] === 'function') {
            window[callback]();
        }
    }

    // Loading toast
    loading(message, options = {}) {
        const toastId = this.show(`
            <div class="flex items-center space-x-3">
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>${message}</span>
            </div>
        `, 'info', {
            ...options,
            duration: 0,
            progress: false,
            closable: false
        });

        return toastId;
    }

    // Loading toast güncelle
    updateLoading(toastId, message, type = 'success') {
        this.remove(toastId);
        return this.show(message, type);
    }
}

// Global instance
window.ToastManager = new ToastManager();

// Eski showToast fonksiyonunu override et
window.showToast = (message, type = 'info') => {
    window.ToastManager.show(message, type);
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToastManager;
}