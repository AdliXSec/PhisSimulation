saya sedang membuat sebuah project Platform Simulasi Phishing (Internal Security Awareness)
Sebuah tool bagi perusahaan untuk menguji kewaspadaan karyawan dengan mengirimkan email phishing simulasi yang aman.

Alur Kerja: Administrator membuat template email tiruan (misal: "Reset Password HRD") dan mengirimkannya ke ratusan karyawan. Website akan melacak siapa saja yang membuka email, mengeklik tautan berbahaya, hingga mencoba memasukkan password palsu.

Peran PostgreSQL:

Menggunakan trigger dan stored procedures (PL/pgSQL) untuk secara otomatis menghitung click-rate dan mengubah status risiko seorang karyawan segera setelah data simulasi masuk ke database.

Integritas transaksional Postgres (ACID compliance) memastikan tidak ada data event karyawan yang hilang atau tumpang tindih meskipun ratusan orang mengeklik tautan secara bersamaan.

dengan integrasi AI dan beberapa fitur tambahan serta sedikit perubahan

1. Dynamic Spear-Phishing Generation (Berbasis LLM & OSINT)
   Alih-alih administrator mengetik template email manual yang kaku, AI akan bertugas meracik email yang sangat personal untuk setiap target karyawan.

Cara Kerja: AI (seperti model Llama 3 atau GPT yang di-hosting lokal) akan menerima konteks departemen karyawan. Misalnya, untuk tim Keuangan, AI otomatis membuat email "Revisi Invoice Vendor Q3". Untuk tim IT, AI membuat email "Peringatan Rotasi Kredensial AWS".

Peran AI: Menggunakan Natural Language Generation (NLG) untuk menciptakan gaya bahasa, tingkat urgensi, dan manipulasi psikologis yang berbeda-beda agar target tidak curiga.

Peran PostgreSQL: Anda bisa menggunakan ekstensi pgvector untuk menyimpan embedding dari template yang paling sering menjebak target. AI akan belajar dari sejarah ini dan terus memodifikasi prompt untuk menghasilkan variasi email baru yang lebih mematikan.

2. Predictive Delivery Timing (Optimalisasi Waktu Kirim)
   Seorang peretas (Red Teamer) tahu persis kapan waktu terbaik untuk menyerang: saat target sedang lelah, sibuk, atau lengah.

Cara Kerja: Sistem tidak mengirimkan ribuan email sekaligus pada pukul 08.00 pagi. Algoritma Machine Learning menganalisis pola klik karyawan dari kampanye sebelumnya.

Peran AI: Memprediksi probabilitas tertinggi kapan seorang karyawan akan mengeklik tautan tanpa berpikir panjang (misalnya: Hari Jumat pukul 16:30 saat ingin pulang, atau Senin pukul 09:00 saat kotak masuk menumpuk). AI menjadwalkan pengiriman secara individual berdasarkan prediksi tersebut.

3. Automated Risk Clustering & Behavioral Profiling
   Setelah kampanye berjalan, tim HR dan Keamanan butuh laporan siapa saja yang merupakan "mata rantai terlemah" di perusahaan.

Cara Kerja: AI akan memproses semua event logs (mulai dari sekadar membuka email, mengeklik tautan, hingga memasukkan kredensial).

Peran AI: Menggunakan algoritma Unsupervised Learning (seperti K-Means Clustering) untuk secara otomatis mengelompokkan karyawan ke dalam beberapa tingkatan risiko (Low, Medium, High Risk). Jika ada karyawan yang konsisten berada di kategori High Risk, sistem otomatis merekomendasikan atau mendaftarkan mereka ke modul pelatihan keamanan tambahan.

Peran PostgreSQL: Menggunakan JSONB untuk menyimpan event metadata (seperti User-Agent, pergerakan mouse, atau waktu tunggu sebelum mengeklik) dari ribuan karyawan. Data kompleks ini ditelan dan diproses dengan sangat cepat tanpa harus membuat kolom database yang kaku.

4. Dynamic Decoy Landing Pages (Halaman Tiruan Adaptif)
   Ketika target mengeklik tautan, mereka akan diarahkan ke halaman login palsu.

Cara Kerja: AI membaca header request atau email target, lalu merender tampilan halaman login secara dinamis. Jika email bertema Microsoft 365, halaman yang muncul adalah tiruan Office. Jika temanya internal perusahaan, halaman yang muncul mengambil logo dan warna dominan dari website asli perusahaan tersebut.

Peran AI: Melakukan scraping ringan secara real-time dan merakit komponen UI (Frontend) agar tingkat kemiripannya sangat identik (seperti teknik AitM / Adversary-in-the-Middle).

dibuat dengan teknologi

reactjs
flask/fast api
postgresql

dan dengan memisahkan folder

frontend
backend

dengan alur aplikasi kurang lebih seperti ini

Fase 1: Inisiasi & Konteks Kampanye (Tugas Admin)
Pemilihan Target: Admin masuk ke dashboard, lalu memilih departemen yang akan diuji (misalnya: "Departemen HRD" dan "Departemen Finance").

Penentuan Parameter: Admin menentukan tingkat kesulitan (Rendah/Menengah/Tinggi) dan tema besar (misalnya: "Peringatan Keamanan", "Dokumen Internal", atau "Diskon Karyawan").

Fase 2: Otomatisasi Konten (AI API Call)
Di sinilah Public AI API mengambil alih pembuatan konten (payload).

Prompt Assembly: Backend Anda (misalnya Laravel/FastAPI) secara dinamis merakit sebuah prompt tersembunyi.

Contoh isi prompt ke API AI: "Buat satu template email spear-phishing bahasa Indonesia untuk departemen Finance. Tema: Revisi batas waktu pelaporan pajak. Tingkat manipulasi psikologis: Tinggi (urgensi). Jangan gunakan kata-kata kasar. Output dalam format JSON yang berisi subject, body_html, dan sender_name."

API Execution: Backend mengirim request HTTP ke API OpenAI/Gemini.

Penyimpanan Template: Response dari AI diterima oleh backend. Sistem secara otomatis menyisipkan variabel tautan dinamis (misal: {{tracking_link}}) ke dalam HTML email, lalu menyimpannya ke tabel campaign_templates di PostgreSQL.

Fase 3: Distribusi & Injeksi Tracker (Backend Processing)
Pembuatan Token: Untuk setiap karyawan, backend men-generate UUID acak atau token JWT sebagai pengenal unik (misal: id=abc-123).

Injeksi Piksel & Tautan: \* Sebuah gambar transparan berukuran 1x1 piksel disematkan di dalam HTML email untuk mendeteksi event "Email Dibuka" (Open Rate).

Tautan tujuan diganti menjadi URL server Anda, ditambah token karyawan (misal: https://simulasi.perusahaan.com/login?token=abc-123).

Pengiriman SMTP: Backend mengirimkan email tersebut ke inbox masing-masing karyawan secara background menggunakan message broker (seperti Redis/RabbitMQ) agar tidak timeout.

Fase 4: Interaksi Target (The Trap)
Karyawan menerima email dan mulai berinteraksi. Semua aktivitas direkam secara real-time.

Email Dibuka: Karyawan membuka email. Klien email mereka otomatis memuat gambar piksel transparan. Backend menerima request ini dan mencatat event EMAIL_OPENED.

Klik Tautan: Karyawan mengeklik tautan. Mereka diarahkan ke landing page tiruan di server Anda. Backend mencatat event LINK_CLICKED beserta metadata perangkat target (User-Agent, IP) yang disimpan ke dalam kolom JSONB di Postgres.

Pengisian Data (Data Compromised): Karyawan mencoba login di halaman tiruan. Backend mencegat request POST tersebut, mencatat event DATA_SUBMITTED, lalu membuang password yang dimasukkan untuk menjaga etika dan privasi. Karyawan kemudian diarahkan ke halaman "Edukasi Keamanan".

Fase 5: Pemrosesan Waktu Nyata (Kekuatan PostgreSQL)
Daripada membebani backend untuk menghitung skor setiap kali ada interaksi, kita serahkan logika ini ke level database.

Trigger & PL/pgSQL: Begitu baris log interaksi baru di-insert ke tabel campaign_logs, sebuah Trigger di PostgreSQL otomatis aktif.

Update Skor Risiko: Stored Procedure akan memeriksa jenis event dan memperbarui skor di tabel employee_profiles.

Jika EMAIL_OPENED -> Skor +5

Jika LINK_CLICKED -> Skor +20

Jika DATA_SUBMITTED -> Skor +50

Status Otomatis: Jika total skor target melampaui batas tertentu (misal > 75), status target di-update menjadi HIGH_RISK secara transaksional (ACID).

Fase 6: Laporan Evaluasi Berbasis AI (AI API Call)
Setelah kampanye selesai, admin ingin melihat laporan hasil akhir.

Agregasi Data: Backend menarik ringkasan data dari PostgreSQL (misal: "Dari 50 orang Finance, 10 klik tautan, 2 masukkan data. Dari 20 orang IT, 0 klik tautan").

Analisis Konklusif: Backend mengirimkan statistik mentah tersebut ke Public AI API dengan prompt: "Analisis statistik simulasi phishing ini dan berikan rekomendasi modul pelatihan yang tepat untuk departemen Finance."

Dashboard Display: Admin membaca narasi laporan akhir dan rekomendasi mitigasi (pelatihan awareness) yang ditulis dengan gaya bahasa manusiawi oleh AI, beserta grafik visual di UI.

tolong bantu saya memulai membuat dari gambaran awal
semua terintegrasi dengan ai public (API) tidak ada yang menggunakan local model atau machine learning