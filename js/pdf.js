// PDF RAPOR MODÜLÜ - jsPDF

// PDF Rapor Oluştur
async function generatePDFReport(filters = {}) {
    // jsPDF kütüphanesini yükle
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Verileri çek
    const transactions = await window.FinanceModule.getTransactions(filters);
    const stats = await window.FinanceModule.getFinanceStats(filters);

    // Başlık
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('NGO Finansal Rapor', 105, 20, { align: 'center' });

    // Tarih
    doc.setFontSize(10);
    doc.setTextColor(100);
    const today = new Date().toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.text(`Rapor Tarihi: ${today}`, 105, 28, { align: 'center' });

    // Çizgi
    doc.setDrawColor(200);
    doc.line(20, 32, 190, 32);

    // İstatistikler Kutusu
    let yPos = 45;

    // Özet Kartları
    doc.setFillColor(240, 253, 244); // Açık yeşil
    doc.rect(20, yPos, 55, 25, 'F');
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74);
    doc.text('TOPLAM GELİR', 47.5, yPos + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(formatCurrencyPDF(stats.totalIncome), 47.5, yPos + 18, { align: 'center' });

    doc.setFillColor(254, 242, 242); // Açık kırmızı
    doc.rect(80, yPos, 55, 25, 'F');
    doc.setFontSize(10);
    doc.setTextColor(220, 38, 38);
    doc.text('TOPLAM GİDER', 107.5, yPos + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(formatCurrencyPDF(stats.totalExpense), 107.5, yPos + 18, { align: 'center' });

    doc.setFillColor(239, 246, 255); // Açık mavi
    doc.rect(140, yPos, 50, 25, 'F');
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text('BAKİYE', 165, yPos + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(formatCurrencyPDF(stats.balance), 165, yPos + 18, { align: 'center' });

    yPos += 35;

    // İşlemler Tablosu Başlık
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text('İşlem Detayları', 20, yPos);
    yPos += 8;

    // Tablo Başlıkları
    doc.setFillColor(102, 126, 234);
    doc.rect(20, yPos, 170, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255);
    doc.text('Tarih', 22, yPos + 5.5);
    doc.text('Başlık', 45, yPos + 5.5);
    doc.text('Kategori', 100, yPos + 5.5);
    doc.text('Tür', 130, yPos + 5.5);
    doc.text('Tutar', 160, yPos + 5.5);
    yPos += 10;

    // İşlemler (En fazla 20 işlem)
    const maxTransactions = Math.min(transactions.length, 20);
    doc.setTextColor(0);
    doc.setFontSize(8);

    for (let i = 0; i < maxTransactions; i++) {
        const t = transactions[i];
        
        // Sayfa sonu kontrolü
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }

        // Satır arka plan (zebra)
        if (i % 2 === 0) {
            doc.setFillColor(249, 250, 251);
            doc.rect(20, yPos - 3, 170, 7, 'F');
        }

        // Veri
        doc.text(formatDatePDF(t.transaction_date), 22, yPos);
        doc.text(truncateText(t.title, 25), 45, yPos);
        doc.text(getCategoryTextPDF(t.category), 100, yPos);
        
        // Tür (Renkli)
        if (t.type === 'income') {
            doc.setTextColor(22, 163, 74);
            doc.text('Gelir', 130, yPos);
        } else {
            doc.setTextColor(220, 38, 38);
            doc.text('Gider', 130, yPos);
        }
        
        // Tutar
        doc.setTextColor(0);
        const amountText = (t.type === 'income' ? '+' : '-') + formatCurrencyPDF(Math.abs(t.amount));
        doc.text(amountText, 160, yPos);

        yPos += 7;
    }

    // Toplam gösterimi
    yPos += 5;
    doc.setDrawColor(200);
    doc.line(20, yPos, 190, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Gelir İşlem Sayısı:', 22, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(stats.incomeCount.toString(), 70, yPos);

    yPos += 6;
    doc.setFont(undefined, 'bold');
    doc.text('Gider İşlem Sayısı:', 22, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(stats.expenseCount.toString(), 70, yPos);

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`NGO Management System - Sayfa ${i} / ${pageCount}`, 105, 290, { align: 'center' });
    }

    // PDF'i indir
    const fileName = `finansal-rapor-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return true;
}

// Yardımcı fonksiyonlar
function formatCurrencyPDF(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0
    }).format(amount || 0);
}

function formatDatePDF(dateString) {
    return new Date(dateString).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getCategoryTextPDF(category) {
    const texts = {
        'donation': 'Bağış',
        'bağış': 'Bağış',
        'sacrifice': 'Kurban',
        'kurban': 'Kurban',
        'project': 'Proje',
        'proje': 'Proje',
        'facility': 'Tesis',
        'tesis': 'Tesis',
        'salary': 'Maaş',
        'personel': 'Personel',
        'other': 'Diğer'
    };
    return texts[category.toLowerCase()] || category;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Global export
window.PDFModule = {
    generatePDFReport
};