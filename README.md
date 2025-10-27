# 🏥 NGO Management System

[![Vercel Deploy](https://img.shields.io/badge/vercel-deployed-success)](https://ngo-management-system-omega.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)

> Hayırsever kuruluşlar için tam entegre, modern web tabanlı yönetim platformu.

**🌐 Canlı Demo:** [https://ngo-management-system-omega.vercel.app](https://ngo-management-system-omega.vercel.app)

---

## ✨ Özellikler

### 🎯 Ana Modüller

| Modül | Açıklama | Durum |
|-------|----------|-------|
| 💰 **Finans** | Gelir/Gider yönetimi, onay akışı, raporlama | ✅ |
| 🏢 **Tesisler** | Çoklu lokasyon, bütçe takibi | ✅ |
| 📊 **Projeler** | İlerleme takibi, milestone sistemi, görev yönetimi | ✅ |
| 🐑 **Kurban** | Bağışçı kaydı, kesim takibi, ödeme durumu | ✅ |
| 👥 **Personel** | Maaş yönetimi, pozisyon takibi | ✅ |

### 🚀 Gelişmiş Özellikler

- 🔍 **Global Arama** - Tüm modüllerde anında arama (`Ctrl+K`)
- 🔔 **Gerçek Zamanlı Bildirimler** - Anlık bildirim sistemi
- ⌨️ **Klavye Kısayolları** - 6+ hızlı komut
- 📈 **Animasyonlu İstatistikler** - Dinamik sayı animasyonları
- 📊 **Excel Export** - CSV formatında rapor indirme
- 🎯 **Filtreleme Sistemi** - Tarih, durum, kategori
- 🎨 **Modern UI/UX** - TailwindCSS, gradient'lar
- 📱 **Fully Responsive** - Mobil uyumlu
- 🔐 **Row Level Security** - Supabase RLS politikaları
- ⚡ **Loading States** - Kullanıcı dostu animasyonlar
- ✅ **Approval Workflow** - Onay akışı sistemi (NEW!)
- 🔍 **Audit Logging** - Tüm işlemler kayıt altında (NEW!)
- 🧪 **Sample Data Generator** - Test verileri oluşturma (NEW!)
- 🛡️ **Comprehensive Error Handling** - Gelişmiş hata yönetimi (NEW!)

---

## 🚀 Kurulum

### Gereksinimler

- Modern web tarayıcı (Chrome, Firefox, Safari, Edge)
- Python 3.x veya Node.js (yerel sunucu için)

### Hızlı Başlangıç

```bash
# 1. Projeyi klonla
git clone https://github.com/ongassamaniger-blip/ngo-management-system.git
cd ngo-management-system

# 2. Yerel sunucu başlat (Python)
python -m http.server 8000

# VEYA (Node.js)
npx http-server -p 8000

# 3. Tarayıcıda aç
http://localhost:8000
```

---

## 🧪 Test & Development Tools

### Sample Data Manager
Sistem testi için örnek veriler oluşturmak için:

1. `sample-data-manager.html` sayfasını aç
2. "Tüm Verileri Oluştur" butonuna tıkla
3. Otomatik olarak 29 örnek kayıt oluşturulur:
   - 4 Kullanıcı (farklı roller)
   - 5 Tesis (farklı kategoriler)
   - 4 Proje (farklı durumlar)
   - 8 Finans işlemi (gelir/gider)
   - 3 Kurban kaydı
   - 5 Personel kaydı

### API Test Console
Tarayıcı konsolundan modülleri test edebilirsiniz:

```javascript
// Bekleyen onayları listele
const pending = await ApprovalWorkflow.getPendingApprovals();
console.log('Pending:', pending);

// İşlemi onayla
await ApprovalWorkflow.approveTransaction(transactionId, 'Onaylandı');

// Hata loglarını görüntüle
const errors = window.ErrorHandler.getErrors();
console.log('Errors:', errors);
```

For detailed documentation: [System Check Documentation](SYSTEM_CHECK_DOCUMENTATION.md)

---

## 🔐 Demo Hesaplar

| Kullanıcı | Email | Şifre | Rol |
|-----------|-------|-------|-----|
| Admin | `admin@ngo.org` | `admin123` | Yönetici |
| Mali Müdür | `mali@ngo.org` | `mali123` | Finans Yöneticisi |

---

## ⌨️ Klavye Kısayolları

| Kısayol | Açıklama |
|---------|----------|
| `Ctrl + K` | Global arama |
| `Ctrl + N` | Yeni gelir kaydı |
| `Ctrl + E` | Yeni gider kaydı |
| `Ctrl + B` | Bildirimleri aç/kapat |
| `Alt + 1-6` | Sayfa geçişi (Dashboard, Finans, vb.) |
| `Esc` | Modal'ları kapat |

---

## 🛠️ Teknolojiler

### Frontend
- **HTML5** - Semantik yapı
- **TailwindCSS 3.x** - Utility-first CSS framework
- **Vanilla JavaScript (ES6+)** - Modern JavaScript
- **Font Awesome 6** - İkon seti

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL veritabanı
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication

### Deployment
- **Vercel** - Serverless deployment
- **GitHub** - Version control
- **Auto-deploy** - Git push ile otomatik deployment

---

## 📊 Veritabanı Şeması

```
users              ─┐
facilities         ─┼─→ Foreign Keys
transactions       ─┤
projects          ─┤
personnel         ─┤
sacrifices        ─┤
tasks             ─┤
milestones        ─┤
notifications     ─┤
approval_flows    ─┘
```

**10 Tablo** | **156+ Kayıt** | **RLS Korumalı**

---

## 📱 Ekran Görüntüleri

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### Finans Modülü
![Finans](https://via.placeholder.com/800x400?text=Finance+Module)

### Tesisler
![Tesisler](https://via.placeholder.com/800x400?text=Facilities+Module)

---

## 🎯 Kullanım Örnekleri

### Yeni Gelir Kaydı

1. `Ctrl + N` tuşuna bas veya "Yeni Gelir" butonuna tıkla
2. Başlık, tutar ve kategori gir
3. "Kaydet" butonuna tıkla
4. Toast bildirimi ile onay al

### Excel Raporu İndirme

1. Finans sayfasına git (`Alt + 2`)
2. Filtreleri ayarla (tarih, durum, vb.)
3. "Excel İndir" butonuna tıkla
4. CSV dosyası otomatik indirilir

### Proje Oluşturma

1. Dashboard'da "Yeni Proje" butonuna tıkla
2. Proje adı, bütçe ve başlangıç tarihi gir
3. "Oluştur" butonuna tıkla
4. Projeler sayfasında görüntüle

---

## 🔧 Yapılandırma

### Supabase Ayarları

`js/config.js` dosyasını düzenle:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### Environment Variables (Production)

Vercel dashboard'da şu değişkenleri ayarla:

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 📈 Performans

| Metrik | Değer |
|--------|-------|
| **First Contentful Paint** | < 1.5s |
| **Time to Interactive** | < 3.0s |
| **Lighthouse Score** | 90+ |
| **Bundle Size** | < 50KB (compressed) |

---

## 🔒 Güvenlik

- ✅ Row Level Security (RLS) aktif
- ✅ SQL injection koruması
- ✅ XSS koruması
- ✅ CSRF token'ları
- ✅ HTTPS zorunlu (production)
- ✅ API key'leri environment variable'da

---

## 🚧 Roadmap

### v1.1 (Yakında)
- [ ] Email bildirimleri (SendGrid)
- [ ] SMS entegrasyonu (Twilio)
- [ ] PDF rapor oluşturma
- [ ] Chart.js grafikleri
- [ ] Dark mode

### v1.2
- [ ] Rol bazlı yetkilendirme
- [ ] İki faktörlü kimlik doğrulama (2FA)
- [ ] Dosya yükleme (S3/Cloudinary)
- [ ] Multi-language (TR/EN/AR)

### v2.0
- [ ] Mobile app (React Native)
- [ ] PWA (Offline çalışma)
- [ ] Real-time chat
- [ ] AI rapor analizi

---

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

---

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👨‍💻 Geliştirici

**Ethem** - [@ongassamaniger-blip](https://github.com/ongassamaniger-blip)

---

## 🙏 Teşekkürler

- [Supabase](https://supabase.com) - Backend infrastructure
- [Vercel](https://vercel.com) - Hosting
- [TailwindCSS](https://tailwindcss.com) - CSS framework
- [Font Awesome](https://fontawesome.com) - Icons

---

## 📞 İletişim

- **GitHub Issues:** [Project Issues](https://github.com/ongassamaniger-blip/ngo-management-system/issues)
- **Email:** support@ngo-system.com
- **Website:** https://ngo-management-system-omega.vercel.app

---

<div align="center">

**⭐ Beğendiyseniz yıldız vermeyi unutmayın!**

Made with ❤️ for NGOs worldwide

</div>