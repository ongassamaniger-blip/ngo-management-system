// ERROR HANDLER - Tüm hataları buradan yönet
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50; // Son 50 hatayı sakla
        this.initGlobalErrorHandler();
    }

    // Global hata yakalayıcı
    initGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            this.logError({
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error,
                type: 'javascript'
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                message: 'Unhandled Promise Rejection',
                error: event.reason,
                type: 'promise'
            });
        });
    }

    // Hata kaydet
    logError(errorInfo) {
        const errorLog = {
            ...errorInfo,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errors.push(errorLog);
        
        // Maksimum hata sayısını aşma
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Console'a yaz
        console.error('Error logged:', errorLog);

        // LocalStorage'a kaydet (debugging için)
        this.saveErrorsToStorage();
    }

    // Hataları LocalStorage'a kaydet
    saveErrorsToStorage() {
        try {
            localStorage.setItem('app_errors', JSON.stringify(this.errors.slice(-10)));
        } catch (e) {
            console.warn('Could not save errors to localStorage');
        }
    }

    // API hatalarını işle
    handleAPIError(error, context = '') {
        let userMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
        let errorDetails = {
            context,
            error: error.message || error,
            type: 'api'
        };

        // Supabase hatalarına özel mesajlar
        if (error.code === '23505') {
            userMessage = 'Bu kayıt zaten mevcut.';
        } else if (error.code === '23503') {
            userMessage = 'İlişkili kayıtlar mevcut, silinemez.';
        } else if (error.code === 'PGRST301') {
            userMessage = 'Kayıt bulunamadı.';
        } else if (error.message?.includes('JWT')) {
            userMessage = 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else if (error.message?.includes('permission denied')) {
            userMessage = 'Bu işlem için yetkiniz yok.';
        } else if (error.message?.includes('network')) {
            userMessage = 'İnternet bağlantınızı kontrol edin.';
        }

        this.logError(errorDetails);
        window.ToastManager?.show(userMessage, 'error');

        return { userMessage, errorDetails };
    }

    // Form validasyon hatalarını işle
    handleValidationError(errors) {
        const messages = Object.entries(errors)
            .map(([field, error]) => `${field}: ${error}`)
            .join('\n');

        window.ToastManager?.show('Lütfen formu kontrol edin', 'warning');
        this.logError({
            type: 'validation',
            errors
        });

        return messages;
    }

    // Hata loglarını al
    getErrors() {
        return this.errors;
    }

    // Hataları temizle
    clearErrors() {
        this.errors = [];
        localStorage.removeItem('app_errors');
    }

    // Hata raporunu indir
    downloadErrorReport() {
        const report = {
            timestamp: new Date().toISOString(),
            errors: this.errors,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Global instance
window.ErrorHandler = new ErrorHandler();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}