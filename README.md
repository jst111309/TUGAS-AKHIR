# Sistem Monitoring dan Analisis Log Keamanan (SIEM)

## Deskripsi Proyek
Proyek ini adalah sistem *web monitoring* untuk mendukung monitoring keamanan dan analisis log terpusat berbasis SIEM. Sistem menggunakan Wazuh dan Elasticsearch/OpenSearch untuk pengolahan dan penyimpanan log, serta *dashboard web* untuk menampilkan hasil monitoring kepada administrator. *Web monitoring* ini bukan pengganti Wazuh atau Elasticsearch, melainkan *visualization layer* untuk menampilkan data log, *alert*, statistik, dan detail *event*.

## Institusi
Fakultas Teknik Elektro, Universitas Telkom.

## Status Pengembangan
Proyek masih tahap pengembangan awal (*first commit*). Implementasi akan dikembangkan secara bertahap mulai dari struktur *frontend*, *backend*/API, integrasi Elasticsearch/OpenSearch, *dashboard monitoring*, filter log, *alert*, dan pengujian performa.

## Tumpukan Teknologi

| Lapisan | Teknologi/Rancangan | Fungsi dan Kesesuaian Spesifikasi |
|---|---|---|
| **Frontend** | React.js / Next.js | Menampilkan *dashboard* visualisasi yang responsif, tabel log, statistik, dan *alert* keamanan. |
| **Backend/API** | Node.js / Express.js | Mengambil data dari Elasticsearch, melakukan pencarian dan filter log dengan respons ≤ 5 detik. |
| **Data Source** | Elasticsearch / OpenSearch | *Centralized log management*, penyimpanan log, indexing, dan retensi data. |
| **SIEM** | Wazuh Manager | Analisis log, *rule matching*, korelasi *event*, deteksi anomali, dan *alerting*. |
| **Visualisasi** | Chart.js / Recharts | Menampilkan grafik aktivitas, distribusi *severity*, dan statistik pemantauan. |
| **Styling/UI** | Tailwind CSS | Membuat antarmuka pengguna yang bersih dan terstruktur secara efisien. |

## Alur Data Sistem

```text
Log Source → Wazuh Manager → Elasticsearch/OpenSearch → Backend/API → Web Monitoring Dashboard → Administrator
```

Wazuh Manager melakukan analisis log, *rule matching*, *event correlation*, deteksi anomali, dan *alerting*. Elasticsearch/OpenSearch menyimpan dan mengindeks data log serta *alert*. Backend/API mengambil data dari penyimpanan untuk divisualisasikan dan ditampilkan pada *dashboard* administrator.

## Struktur Proyek

```text
TUGAS-AKHIR/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                 # Dashboard utama
│   │   │   ├── login/page.tsx           # Halaman login
│   │   │   ├── logs/page.tsx            # Monitoring log
│   │   │   ├── alerts/page.tsx          # Monitoring alert
│   │   │   ├── events/[id]/page.tsx     # Detail event
│   │   │   └── layout.tsx               # Root layout
│   │   ├── components/
│   │   │   ├── ui/                      # Komponen UI dasar (Card, Button, dll)
│   │   │   ├── dashboard/               # Komponen khusus dashboard (Chart, Stat)
│   │   │   ├── logs/                    # Komponen tabel dan filter log
│   │   │   ├── alerts/                  # Komponen list alert
│   │   │   ├── layout/                  # Header, Sidebar, Footer
│   │   │   └── shared/                  # AutoRefresh, LoadingSpinner
│   │   ├── lib/                         # Konfigurasi axios (api.ts) & utils
│   │   ├── hooks/                       # Custom hooks (useLogs, useAlerts, dll)
│   │   ├── types/                       # Definisi TypeScript interface
│   │   └── styles/                      # Tailwind globals.css
│   ├── .env.local
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/                      # Config Elasticsearch & Wazuh
│   │   ├── controllers/                 # Logika bisnis (auth, logs, alerts)
│   │   ├── routes/                      # Definisi endpoint REST API
│   │   ├── middleware/                  # Autentikasi session & validator
│   │   ├── services/                    # Fetch data ke ELK & Wazuh API
│   │   ├── utils/                       # Response formatter & logger
│   │   └── app.ts                       # Entry point Express.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## Memulai

### Prasyarat
- Node.js
- Elasticsearch / OpenSearch
- Wazuh Manager

### Kloning Repository
```bash
git clone https://github.com/Username/TUGAS-AKHIR.git
cd TUGAS-AKHIR
```

### Menjalankan Frontend
```bash
cd frontend
npm install
npm run dev
```

### Menjalankan Backend
```bash
cd backend
npm install
npm run dev
```

## Konfigurasi Environment

```env
PORT=5000
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=
WAZUH_API_URL=
WAZUH_API_USERNAME=
WAZUH_API_PASSWORD=
```

## Kesesuaian dengan Spesifikasi Sistem
- Pengumpulan log dari beberapa *host*.
- Normalisasi log ke format terstruktur.
- Penyimpanan log terpusat dengan retensi minimal 30 hari.
- Pembaruan *dashboard* dalam interval maksimal 5–10 detik.
- Pencarian dan filter log dengan respons ≤ 5 detik.
- Latensi sistem maksimal ≤ 15 detik (dari log masuk sampai hasil analisis tampil).
- Visualisasi hasil analisis log dalam *dashboard* berbasis web.
- Penggunaan solusi *open-source*.

## Fitur Utama
- *Dashboard monitoring* log dan *alert* keamanan.
- Visualisasi statistik log dan distribusi *severity*.
- Pencarian dan *filtering* log berdasarkan waktu, *source*, *severity*, dan jenis *event*.
- Tampilan detail *event*.
- *Monitoring alert* keamanan dari Wazuh.
- Retensi data log minimal 30 hari.
- Pembaruan *dashboard* secara berkala untuk mendukung *monitoring* mendekati *real-time*.

## Peran Pengguna

| Peran | Akses dan Fitur |
|---|---|
| **Administrator/Tim IT** | Mengakses *dashboard monitoring*, melihat data log, filter log, detail *event*, *alert* keamanan, dan statistik monitoring. |
| **Auditor/Manajemen** | Melihat ringkasan *monitoring* dan laporan *security audit*. |

## Batasan Sistem
- *Web monitoring* tidak menggantikan Wazuh atau Elasticsearch/OpenSearch.
- *Web monitoring* hanya menjadi antarmuka visualisasi.
- Penyimpanan utama log tetap berada pada Elasticsearch/OpenSearch.
- Sistem tidak membahas manajemen *user* kompleks, SOAR, *AI detection*, atau konfigurasi *rule* tingkat lanjut.

## Lisensi
Proyek ini dikembangkan untuk tujuan akademik sebagai bagian dari Tugas Akhir di Universitas Telkom.
