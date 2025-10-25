// LOADING MANAGER - Loading animasyonlarını yönet
class LoadingManager {
    constructor() {
        this.loadingElements = new Map();
        this.globalLoading = false;
        this.createGlobalLoader();
    }

    // Global loader oluştur
    createGlobalLoader() {
        if (document.getElementById('globalLoader')) return;

        const loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.className = 'fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-[9999]';
        loader.innerHTML = `
            <div class="bg-white rounded-2xl p-8 shadow-2xl text-center">
                <div class="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-lg font-semibold text-gray-700" id="globalLoaderText">Yükleniyor...</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    // Global loading göster
    showGlobal(message = 'Yükleniyor...') {
        const loader = document.getElementById('globalLoader');
        const text = document.getElementById('globalLoaderText');
        
        if (loader) {
            text.textContent = message;
            loader.classList.remove('hidden');
            loader.classList.add('flex');
            this.globalLoading = true;
        }
    }

    // Global loading gizle
    hideGlobal() {
        const loader = document.getElementById('globalLoader');
        
        if (loader) {
            loader.classList.add('hidden');
            loader.classList.remove('flex');
            this.globalLoading = false;
        }
    }

    // Element'e loading ekle
    show(element, options = {}) {
        if (!element) return;

        const {
            text = '',
            size = 'md',
            spinner = true,
            overlay = true,
            disable = true
        } = options;

        // Element ID'si oluştur
        const elementId = element.id || `loading-${Date.now()}`;
        if (!element.id) element.id = elementId;

        // Disable et
        if (disable) {
            element.disabled = true;
            element.style.pointerEvents = 'none';
        }

        // Loading state class ekle
        element.classList.add('loading-active');

        // Spinner boyutları
        const sizes = {
            sm: 'w-4 h-4 border-2',
            md: 'w-6 h-6 border-2',
            lg: 'w-8 h-8 border-3'
        };

        // Loading container oluştur
        const loadingId = `loading-indicator-${elementId}`;
        let loadingContainer = document.getElementById(loadingId);

        if (!loadingContainer) {
            loadingContainer = document.createElement('div');
            loadingContainer.id = loadingId;
            loadingContainer.className = 'inline-flex items-center space-x-2';

            if (spinner) {
                const spinnerDiv = document.createElement('div');
                spinnerDiv.className = `${sizes[size]} border-white border-t-transparent rounded-full animate-spin`;
                loadingContainer.appendChild(spinnerDiv);
            }

            if (text) {
                const textSpan = document.createElement('span');
                textSpan.textContent = text;
                loadingContainer.appendChild(textSpan);
            }

            // Butonda ise içeriği değiştir
            if (element.tagName === 'BUTTON') {
                const originalContent = element.innerHTML;
                this.loadingElements.set(elementId, originalContent);
                element.innerHTML = '';
                element.appendChild(loadingContainer);
            }
        }

        return elementId;
    }

    // Element loading'ini gizle
    hide(element) {
        if (!element) return;

        const elementId = element.id;

        // Enable et
        element.disabled = false;
        element.style.pointerEvents = '';

        // Loading state class kaldır
        element.classList.remove('loading-active');

        // Original içeriği geri yükle
        if (this.loadingElements.has(elementId)) {
            element.innerHTML = this.loadingElements.get(elementId);
            this.loadingElements.delete(elementId);
        }

        // Loading indicator'ı kaldır
        const loadingIndicator = document.getElementById(`loading-indicator-${elementId}`);
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    // Async fonksiyon wrapper
    async withLoading(element, asyncFn, options = {}) {
        try {
            this.show(element, options);
            const result = await asyncFn();
            return result;
        } finally {
            this.hide(element);
        }
    }

    // Global async wrapper
    async withGlobalLoading(asyncFn, message = 'Yükleniyor...') {
        try {
            this.showGlobal(message);
            const result = await asyncFn();
            return result;
        } finally {
            this.hideGlobal();
        }
    }

    // Skeleton loader oluştur
    createSkeleton(container, type = 'card', count = 1) {
        if (!container) return;

        const skeletons = {
            card: `
                <div class="animate-pulse bg-white rounded-xl p-6 shadow">
                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div class="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
            `,
            list: `
                <div class="animate-pulse flex items-center space-x-4 p-4 bg-white rounded-lg">
                    <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div class="flex-1">
                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            `,
            table: `
                <tr class="animate-pulse">
                    <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded"></div></td>
                    <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded"></div></td>
                    <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded"></div></td>
                </tr>
            `
        };

        const skeletonHTML = Array(count).fill(skeletons[type] || skeletons.card).join('');
        container.innerHTML = skeletonHTML;
    }

    // Tüm loading'leri temizle
    clearAll() {
        this.hideGlobal();
        this.loadingElements.forEach((content, elementId) => {
            const element = document.getElementById(elementId);
            if (element) this.hide(element);
        });
    }
}

// Global instance
window.LoadingManager = new LoadingManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}