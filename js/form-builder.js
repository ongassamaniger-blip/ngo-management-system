// FORM BUILDER YÖNETİMİ

let formFields = [];
let selectedFieldIndex = null;
let fieldCounter = 0;
let currentFormName = '';

// Drag and Drop Functions
function allowDrop(ev) {
    ev.preventDefault();
    document.getElementById('formCanvas').classList.add('drag-over');
}

function drag(ev) {
    ev.dataTransfer.setData("fieldType", ev.target.getAttribute('data-type'));
}

function drop(ev) {
    ev.preventDefault();
    document.getElementById('formCanvas').classList.remove('drag-over');
    
    const fieldType = ev.dataTransfer.getData("fieldType");
    addField(fieldType);
}

// Alan ekle
function addField(type) {
    const field = {
        id: 'field_' + fieldCounter++,
        type: type,
        label: getFieldLabel(type),
        placeholder: '',
        required: false,
        options: type === 'select' || type === 'radio' ? ['Seçenek 1', 'Seçenek 2'] : null,
        validation: null,
        defaultValue: ''
    };

    formFields.push(field);
    renderForm();
}

// Alan etiketi
function getFieldLabel(type) {
    const labels = {
        'text': 'Metin Alanı',
        'number': 'Sayı Alanı',
        'email': 'E-posta',
        'phone': 'Telefon',
        'date': 'Tarih',
        'time': 'Saat',
        'textarea': 'Açıklama',
        'select': 'Seçim Listesi',
        'checkbox': 'Onay Kutusu',
        'radio': 'Seçenek Grubu',
        'file': 'Dosya Yükleme',
        'currency': 'Tutar',
        'location': 'Konum',
        'signature': 'İmza'
    };
    return labels[type] || 'Alan';
}

// Formu render et
function renderForm() {
    const canvas = document.getElementById('formCanvas');
    
    if (formFields.length === 0) {
        canvas.innerHTML = `
            <div class="text-center text-gray-400 py-20">
                <i class="fas fa-mouse-pointer text-6xl mb-4"></i>
                <p class="text-lg font-semibold">Soldan form elemanlarını buraya sürükleyin</p>
                <p class="text-sm mt-2">veya şablon seçerek başlayın</p>
            </div>
        `;
        return;
    }

    canvas.innerHTML = formFields.map((field, index) => `
        <div class="form-field p-4 mb-3 border border-gray-200 rounded-lg ${selectedFieldIndex === index ? 'selected' : ''}" 
             onclick="selectField(${index})">
            <div class="flex items-center justify-between mb-2">
                <label class="font-semibold text-gray-700">
                    ${field.label} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                </label>
                <div class="form-field-actions flex space-x-2">
                    <button onclick="moveFieldUp(${index}); event.stopPropagation();" class="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition">
                        <i class="fas fa-arrow-up text-xs"></i>
                    </button>
                    <button onclick="moveFieldDown(${index}); event.stopPropagation();" class="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition">
                        <i class="fas fa-arrow-down text-xs"></i>
                    </button>
                    <button onclick="duplicateField(${index}); event.stopPropagation();" class="px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition">
                        <i class="fas fa-copy text-xs"></i>
                    </button>
                    <button onclick="deleteField(${index}); event.stopPropagation();" class="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
            ${renderFieldPreview(field)}
        </div>
    `).join('');
}

// Alan önizlemesi
function renderFieldPreview(field) {
    switch(field.type) {
        case 'textarea':
            return `<textarea class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="${field.placeholder}" rows="3"></textarea>`;
        case 'select':
            return `<select class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                ${field.options.map(opt => `<option>${opt}</option>`).join('')}
            </select>`;
        case 'checkbox':
            return `<div class="flex items-center"><input type="checkbox" class="mr-2"><span class="text-sm text-gray-600">${field.label}</span></div>`;
        case 'radio':
            return field.options.map(opt => `
                <div class="flex items-center mb-2">
                    <input type="radio" name="${field.id}" class="mr-2">
                    <span class="text-sm text-gray-600">${opt}</span>
                </div>
            `).join('');
        case 'file':
            return `<input type="file" class="w-full px-4 py-2 border border-gray-300 rounded-lg">`;
        case 'currency':
            return `<div class="relative"><span class="absolute left-3 top-3 text-gray-500">₺</span><input type="number" class="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="${field.placeholder}"></div>`;
        default:
            return `<input type="${field.type}" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="${field.placeholder}">`;
    }
}

// Alan seç
window.selectField = function(index) {
    selectedFieldIndex = index;
    renderForm();
    renderFieldSettings();
};

// Alan ayarlarını render et
function renderFieldSettings() {
    if (selectedFieldIndex === null) return;
    
    const field = formFields[selectedFieldIndex];
    const settings = document.getElementById('fieldSettings');

    let optionsHTML = '';
    if (field.type === 'select' || field.type === 'radio') {
        optionsHTML = `
            <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Seçenekler</label>
                ${field.options.map((opt, i) => `
                    <div class="flex items-center mb-2">
                        <input type="text" value="${opt}" onchange="updateOption(${i}, this.value)" 
                               class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <button onclick="removeOption(${i})" class="ml-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                            <i class="fas fa-times text-xs"></i>
                        </button>
                    </div>
                `).join('')}
                <button onclick="addOption()" class="w-full px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 text-sm font-semibold mt-2">
                    <i class="fas fa-plus mr-2"></i>Seçenek Ekle
                </button>
            </div>
        `;
    }

    settings.innerHTML = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Alan Etiketi</label>
                <input type="text" value="${field.label}" onchange="updateField('label', this.value)" 
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Placeholder</label>
                <input type="text" value="${field.placeholder}" onchange="updateField('placeholder', this.value)" 
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            </div>

            ${optionsHTML}

            <div class="flex items-center">
                <input type="checkbox" ${field.required ? 'checked' : ''} onchange="updateField('required', this.checked)" 
                       class="mr-2" id="requiredCheck">
                <label for="requiredCheck" class="text-sm font-semibold text-gray-700">Zorunlu Alan</label>
            </div>

            <div class="pt-4 border-t">
                <button onclick="deleteField(${selectedFieldIndex})" class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    <i class="fas fa-trash mr-2"></i>Alanı Sil
                </button>
            </div>
        </div>
    `;
}

// Alan güncelle
window.updateField = function(property, value) {
    if (selectedFieldIndex !== null) {
        formFields[selectedFieldIndex][property] = value;
        renderForm();
    }
};

// Seçenek yönetimi
window.addOption = function() {
    if (selectedFieldIndex !== null) {
        formFields[selectedFieldIndex].options.push('Yeni Seçenek');
        renderFieldSettings();
    }
};

window.updateOption = function(index, value) {
    if (selectedFieldIndex !== null) {
        formFields[selectedFieldIndex].options[index] = value;
    }
};

window.removeOption = function(index) {
    if (selectedFieldIndex !== null) {
        formFields[selectedFieldIndex].options.splice(index, 1);
        renderFieldSettings();
    }
};

// Alan işlemleri
window.deleteField = function(index) {
    if (confirm('Bu alanı silmek istediğinizden emin misiniz?')) {
        formFields.splice(index, 1);
        selectedFieldIndex = null;
        renderForm();
        document.getElementById('fieldSettings').innerHTML = `
            <div class="text-center text-gray-400 py-12">
                <i class="fas fa-hand-pointer text-5xl mb-3"></i>
                <p class="text-sm">Bir alan seçerek<br>özelliklerini düzenleyin</p>
            </div>
        `;
    }
};

window.duplicateField = function(index) {
    const field = {...formFields[index]};
    field.id = 'field_' + fieldCounter++;
    if (field.options) field.options = [...field.options];
    formFields.splice(index + 1, 0, field);
    renderForm();
};

window.moveFieldUp = function(index) {
    if (index > 0) {
        [formFields[index - 1], formFields[index]] = [formFields[index], formFields[index - 1]];
        if (selectedFieldIndex === index) selectedFieldIndex = index - 1;
        else if (selectedFieldIndex === index - 1) selectedFieldIndex = index;
        renderForm();
    }
};

window.moveFieldDown = function(index) {
    if (index < formFields.length - 1) {
        [formFields[index], formFields[index + 1]] = [formFields[index + 1], formFields[index]];
        if (selectedFieldIndex === index) selectedFieldIndex = index + 1;
        else if (selectedFieldIndex === index + 1) selectedFieldIndex = index;
        renderForm();
    }
};

window.clearForm = function() {
    if (confirm('Tüm alanları silmek istediğinizden emin misiniz?')) {
        formFields = [];
        selectedFieldIndex = null;
        renderForm();
    }
};

// Şablon yükle
window.loadTemplate = async function(templateName) {
    const templates = getFormTemplates();
    
    if (templates[templateName]) {
        formFields = JSON.parse(JSON.stringify(templates[templateName]));
        fieldCounter = formFields.length;
        selectedFieldIndex = null;
        currentFormName = templateName;
        renderForm();
        closeTemplatesModal();
        document.getElementById('formSelector').value = templateName;
    }
};

// Form şablonları
function getFormTemplates() {
    return {
        'gelir': [
            {id: 'field_0', type: 'text', label: 'Bağışçı Adı Soyadı', placeholder: 'Ad Soyad', required: true},
            {id: 'field_1', type: 'phone', label: 'Telefon', placeholder: '+90 555 123 4567', required: true},
            {id: 'field_2', type: 'email', label: 'E-posta', placeholder: 'ornek@email.com', required: false},
            {id: 'field_3', type: 'currency', label: 'Bağış Tutarı', placeholder: '0.00', required: true},
            {id: 'field_4', type: 'select', label: 'Bağış Türü', required: true, options: ['Nakit', 'Banka Transferi', 'Kredi Kartı']},
            {id: 'field_5', type: 'date', label: 'Bağış Tarihi', required: true},
            {id: 'field_6', type: 'select', label: 'Kategori', required: true, options: ['Genel Bağış', 'Proje', 'Kurban', 'Tesis']},
            {id: 'field_7', type: 'textarea', label: 'Notlar', placeholder: 'Ek açıklama...', required: false}
        ],
        'gider': [
            {id: 'field_0', type: 'text', label: 'Harcama Başlığı', placeholder: 'Örn: Elektrik Faturası', required: true},
            {id: 'field_1', type: 'select', label: 'Kategori', required: true, options: ['Personel', 'Tesis', 'Proje', 'Operasyonel', 'Diğer']},
            {id: 'field_2', type: 'currency', label: 'Tutar', placeholder: '0.00', required: true},
            {id: 'field_3', type: 'date', label: 'Harcama Tarihi', required: true},
            {id: 'field_4', type: 'select', label: 'Ödeme Yöntemi', required: true, options: ['Nakit', 'Banka', 'Kredi Kartı', 'Çek']},
            {id: 'field_5', type: 'text', label: 'Tedarikçi', placeholder: 'Firma adı', required: false},
            {id: 'field_6', type: 'text', label: 'Fatura No', placeholder: 'Fatura numarası', required: false},
            {id: 'field_7', type: 'file', label: 'Fatura/Makbuz', required: false},
            {id: 'field_8', type: 'textarea', label: 'Açıklama', placeholder: 'Detaylı açıklama...', required: false}
        ],
        'kurban': [
            {id: 'field_0', type: 'text', label: 'Ad Soyad', placeholder: 'Kurban sahibi adı', required: true},
            {id: 'field_1', type: 'phone', label: 'Telefon', placeholder: '+90 555 123 4567', required: true},
            {id: 'field_2', type: 'email', label: 'E-posta', placeholder: 'ornek@email.com', required: false},
            {id: 'field_3', type: 'radio', label: 'Kurban Türü', required: true, options: ['Tek Kurban', 'Hisseli Kurban']},
            {id: 'field_4', type: 'select', label: 'Hayvan Türü', required: true, options: ['Koyun', 'Keçi', 'Dana', 'İnek', 'Deve']},
            {id: 'field_5', type: 'date', label: 'Kesim Tarihi', required: true},
            {id: 'field_6', type: 'currency', label: 'Tutar', placeholder: '0.00', required: true},
            {id: 'field_7', type: 'select', label: 'Ödeme Durumu', required: true, options: ['Ödendi', 'Beklemede']},
            {id: 'field_8', type: 'file', label: 'Kurban Fotoğrafı', required: false},
            {id: 'field_9', type: 'checkbox', label: 'SMS Bildirimi', required: false},
            {id: 'field_10', type: 'checkbox', label: 'E-posta Bildirimi', required: false},
            {id: 'field_11', type: 'textarea', label: 'Özel Notlar', placeholder: 'Adına kurban kesilecek kişi vb.', required: false}
        ],
        'personel': [
            {id: 'field_0', type: 'text', label: 'Ad Soyad', placeholder: 'Ad Soyad', required: true},
            {id: 'field_1', type: 'phone', label: 'Telefon', placeholder: '+90 555 123 4567', required: true},
            {id: 'field_2', type: 'email', label: 'E-posta', placeholder: 'ornek@email.com', required: true},
            {id: 'field_3', type: 'date', label: 'Doğum Tarihi', required: true},
            {id: 'field_4', type: 'select', label: 'Pozisyon', required: true, options: ['Tesis Müdürü', 'Proje Koordinatörü', 'Finans Uzmanı', 'Saha Görevlisi', 'Diğer']},
            {id: 'field_5', type: 'date', label: 'İşe Başlama Tarihi', required: true},
            {id: 'field_6', type: 'currency', label: 'Maaş', placeholder: '0.00', required: true},
            {id: 'field_7', type: 'text', label: 'TC Kimlik No', placeholder: '11 haneli', required: true},
            {id: 'field_8', type: 'text', label: 'Acil Durum İletişim', placeholder: 'Ad Soyad - Telefon', required: true},
            {id: 'field_9', type: 'file', label: 'Özgeçmiş', required: false},
            {id: 'field_10', type: 'file', label: 'Fotoğraf', required: false},
            {id: 'field_11', type: 'textarea', label: 'Notlar', placeholder: 'Ek bilgiler...', required: false}
        ],
        'proje': [
            {id: 'field_0', type: 'text', label: 'Proje Adı', placeholder: 'Proje başlığı', required: true},
            {id: 'field_1', type: 'select', label: 'Kategori', required: true, options: ['Eğitim Yardımı', 'Sağlık Yardımı', 'Su & Altyapı', 'Gıda Yardımı', 'İnsani Yardım']},
            {id: 'field_2', type: 'textarea', label: 'Proje Özeti', placeholder: 'Kısa açıklama', required: true},
            {id: 'field_3', type: 'currency', label: 'Bütçe', placeholder: '0.00', required: true},
            {id: 'field_4', type: 'date', label: 'Başlangıç Tarihi', required: true},
            {id: 'field_5', type: 'date', label: 'Bitiş Tarihi', required: true},
            {id: 'field_6', type: 'number', label: 'Hedef Faydalanıcı', placeholder: 'Kişi sayısı', required: true},
            {id: 'field_7', type: 'text', label: 'Proje Müdürü', placeholder: 'Ad Soyad', required: true},
            {id: 'field_8', type: 'file', label: 'Proje Teklifi', required: false},
            {id: 'field_9', type: 'textarea', label: 'Risk Analizi', placeholder: 'Olası riskler...', required: false}
        ],
        'tesis': [
            {id: 'field_0', type: 'text', label: 'Tesis Adı', placeholder: 'Tesis adı', required: true},
            {id: 'field_1', type: 'text', label: 'Ülke', placeholder: 'Ülke', required: true},
            {id: 'field_2', type: 'text', label: 'Şehir', placeholder: 'Şehir adı', required: true},
            {id: 'field_3', type: 'textarea', label: 'Adres', placeholder: 'Detaylı adres', required: true},
            {id: 'field_4', type: 'select', label: 'Kategori', required: true, options: ['Eğitim & İnsani Yardım', 'Sağlık Merkezi', 'Yetimhane', 'Su Kuyusu', 'Cami']},
            {id: 'field_5', type: 'date', label: 'Kuruluş Tarihi', required: true},
            {id: 'field_6', type: 'number', label: 'Alan (m²)', placeholder: 'Metrekare', required: true},
            {id: 'field_7', type: 'number', label: 'Kapasite', placeholder: 'Kişi', required: true},
            {id: 'field_8', type: 'currency', label: 'Aylık Bütçe', placeholder: '0.00', required: true},
            {id: 'field_9', type: 'textarea', label: 'Açıklama', placeholder: 'Tesis hakkında bilgi...', required: false}
        ]
    };
}

// Form kaydet (Supabase)
window.saveFormToDatabase = async function() {
    if (formFields.length === 0) {
        showToast('Form boş! Lütfen alan ekleyin.', 'error');
        return;
    }

    const formName = document.getElementById('formSelector').value || prompt('Form adı girin:');
    if (!formName) return;

    try {
        const formData = {
            name: formName,
            fields: formFields,
            updated_at: new Date().toISOString()
        };

        // Supabase'e kaydet (custom_forms tablosu gerekli)
        const { data, error } = await supabase
            .from('custom_forms')
            .upsert([formData], { onConflict: 'name' });

        if (error) throw error;

        showToast('Form başarıyla kaydedildi!', 'success');
        
    } catch (error) {
        console.error('Form kaydetme hatası:', error);
        
        // Fallback: LocalStorage'a kaydet
        localStorage.setItem('form_' + formName, JSON.stringify({
            name: formName,
            fields: formFields,
            updated: new Date().toISOString()
        }));
        
        showToast('Form LocalStorage\'a kaydedildi', 'info');
    }
};

// Export JSON
window.exportFormJSON = function() {
    const formData = {
        name: document.getElementById('formSelector').value || 'custom_form',
        fields: formFields,
        created: new Date().toISOString()
    };
    
    document.getElementById('exportCode').textContent = JSON.stringify(formData, null, 2);
    document.getElementById('exportModal').classList.add('active');
};

window.downloadJSON = function() {
    const formData = {
        name: document.getElementById('formSelector').value || 'custom_form',
        fields: formFields,
        created: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(formData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = formData.name + '_form.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

window.copyToClipboard = function() {
    const code = document.getElementById('exportCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showToast('JSON kopyalandı!', 'success');
    });
};

// Preview
window.previewForm = function() {
    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = formFields.map(field => `
        <div class="mb-4">
            <label class="block font-semibold text-gray-700 mb-2">
                ${field.label} ${field.required ? '<span class="text-red-500">*</span>' : ''}
            </label>
            ${renderFieldPreview(field)}
        </div>
    `).join('');
    document.getElementById('previewModal').classList.add('active');
};

// Modal functions
window.openTemplatesModal = function() {
    document.getElementById('templatesModal').classList.add('active');
};

window.closeTemplatesModal = function() {
    document.getElementById('templatesModal').classList.remove('active');
};

window.closePreviewModal = function() {
    document.getElementById('previewModal').classList.remove('active');
};

window.closeExportModal = function() {
    document.getElementById('exportModal').classList.remove('active');
};

window.loadFormTemplate = function() {
    const selector = document.getElementById('formSelector');
    if (selector.value) {
        loadTemplate(selector.value);
    }
};

window.createNewForm = function() {
    if (formFields.length > 0) {
        if (!confirm('Mevcut formu silip yeni form oluşturmak istiyor musunuz?')) return;
    }
    formFields = [];
    selectedFieldIndex = null;
    fieldCounter = 0;
    renderForm();
    document.getElementById('formSelector').value = '';
};

// Global export
window.FormBuilderModule = {
    renderForm,
    loadTemplate,
    saveFormToDatabase: saveFormToDatabase
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('formCanvas')) {
        renderForm();
    }
});