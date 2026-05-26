# Redesign Form → Multi-Step Wizard + Instruksi AI

## Latar Belakang

Saat ini form pembuatan Kampanye adalah **satu form besar panjang** yang menggabungkan semua pengaturan (Info Dasar, Email, Landing Page) dalam satu halaman. Hal ini membuat pengguna kewalahan, terutama pengguna non-teknis.

Selain itu, AI saat ini **tidak menerima instruksi spesifik** dari user (nama CEO, konteks perusahaan, alamat, dll), sehingga AI mengarang detail sendiri yang tidak relevan.

## Perubahan yang Diusulkan

### A. Penambahan Field "Instruksi AI" (Backend + Frontend)

#### [MODIFY] [ai_service.py](file:///r:/project/phisimulation/backend/app/services/ai_service.py)
- Tambahkan parameter `ai_instructions: str | None` pada fungsi `generate_phishing_template()`
- Sisipkan instruksi tersebut ke dalam prompt AI, contoh:
  ```
  Instruksi Tambahan dari Admin:
  nama: Adli
  konteks: dia adalah CEO yang membangun perusahaan di alamat ABC
  ```
- Ini membuat AI menghasilkan email yang **menggunakan nama dan konteks nyata** yang diberikan user

#### [MODIFY] [campaigns.py](file:///r:/project/phisimulation/backend/app/api/v1/campaigns.py)
- Tambahkan field `ai_instructions: str | None = None` pada schema `CampaignCreate`
- Simpan instruksi ke model `Campaign` (field baru `ai_instructions` di tabel)
- Teruskan instruksi ke `generate_phishing_template()` saat background task

#### [MODIFY] [campaign.py (model)](file:///r:/project/phisimulation/backend/app/models/campaign.py)
- Tambahkan kolom `ai_instructions = Column(Text, nullable=True)`

---

### B. Redesign Form Kampanye → Multi-Step Wizard (Frontend)

Transformasi form kampanye dari 1 halaman besar menjadi **3 tahap terpisah** dengan navigasi step-by-step:

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  TAHAP 1    │────▶│    TAHAP 2       │────▶│    TAHAP 3       │
│             │     │                  │     │                  │
│ • Nama      │     │ • Tujuan Tautan  │     │ • Desain Landing │
│ • Tema      │     │ • Pengaturan     │     │   Page           │
│ • Departemen│     │   Email          │     │                  │
│ • Kesulitan │     │ • Instruksi AI   │     │                  │
└─────────────┘     └──────────────────┘     └──────────────────┘
```

#### [MODIFY] [Campaigns.jsx](file:///r:/project/phisimulation/frontend/src/features/campaigns/Campaigns.jsx)
- Tambahkan state `step` (1, 2, 3) untuk mengontrol tahap yang ditampilkan
- Setiap tahap menampilkan **hanya field-field yang relevan**
- Navigasi: tombol "Selanjutnya ▶" dan "◀ Sebelumnya" di bawah setiap tahap
- **Stepper visual** di atas form menunjukkan posisi user saat ini (lingkaran + garis):
  ```
  ● ─────── ○ ─────── ○
  Tahap 1   Tahap 2   Tahap 3
  ```
- Tambahkan field `ai_instructions` (textarea) di Tahap 2 saat mode email = AI
- Tombol "Buat Kampanye" hanya muncul di Tahap 3

#### [NEW] [Campaigns.css](file:///r:/project/phisimulation/frontend/src/features/campaigns/Campaigns.css)
- CSS untuk stepper visual (lingkaran, garis penghubung, label)
- Animasi transisi antar tahap (slide kiri-kanan)

---

### C. Penerapan Pola Wizard ke Halaman Lain

Halaman-halaman berikut juga memiliki form yang bisa dipecah menjadi langkah-langkah:

#### [MODIFY] [Employees.jsx](file:///r:/project/phisimulation/frontend/src/features/employees/Employees.jsx)
Form karyawan relatif sederhana (hanya 4-5 field), jadi **tidak perlu multi-step**. Namun akan saya perbaiki tata letaknya agar lebih bersih dan konsisten dengan design system wizard.

#### [MODIFY] [Departments.jsx](file:///r:/project/phisimulation/frontend/src/features/departments/Departments.jsx)
Sama seperti Employees — form terlalu sederhana (2 field) untuk wizard. Tapi akan saya rapikan layoutnya.

> [!IMPORTANT]
> Form yang **benar-benar perlu** multi-step wizard hanya **Kampanye** karena memiliki 10+ field yang kompleks. Halaman lain (Employees, Departments) formnya hanya 2-5 field — memecahnya menjadi multi-step justru akan membuat proses lebih lambat dan tidak efisien. Apakah Anda tetap ingin semua form dipecah, atau cukup Kampanye saja yang diubah menjadi wizard?

## Verification Plan

### Automated Tests
- Restart backend, pastikan tidak ada error impor
- Buat kampanye baru lewat UI dengan instruksi AI → pastikan email yang di-generate mengandung detail yang diminta

### Manual Verification
- Navigasi step 1 → 2 → 3 harus lancar tanpa kehilangan data
- Tombol "Sebelumnya" harus mempertahankan semua input yang sudah diisi
- Responsive: wizard harus tampil baik di mobile dan desktop
