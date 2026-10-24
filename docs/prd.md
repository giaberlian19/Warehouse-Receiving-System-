# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# WAREHOUSE RECEIVING SYSTEM

| Informasi      | Keterangan                                                 |
| -------------- | ---------------------------------------------------------- |
| Nama Produk    | Warehouse Receiving System                                 |
| Status         | Draft                                                      |
| Jenis Aplikasi | Aplikasi Web                                               |
| Pengguna Utama | Operator Gudang dan Supervisor Gudang                      |
| Tujuan         | Mengelola penerimaan barang dan memantau persediaan gudang |

---

## 1. Problem Statement and Business Objectives

### 1.1 Problem Statement

Saat ini, proses pencatatan barang masuk di gudang masih menggunakan spreadsheet. Proses tersebut berpotensi menimbulkan kesalahan pencatatan, menyulitkan pemantauan jumlah barang yang diterima, serta menghambat penelusuran riwayat transaksi persediaan.

Petugas gudang membutuhkan sistem terpusat untuk mencatat pengiriman barang yang masuk, membandingkan jumlah barang yang diharapkan dengan jumlah yang benar-benar diterima, dan memantau persediaan terkini.

Tanpa sistem dengan validasi yang memadai, terdapat risiko penerimaan barang melebihi jumlah yang diharapkan, ketidaksesuaian data persediaan, serta penyelesaian dokumen sebelum seluruh barang diterima.

Oleh karena itu, Warehouse Receiving System dikembangkan sebagai aplikasi web untuk mengelola produk, dokumen penerimaan, jumlah barang yang diterima, persediaan, dan riwayat transaksi secara terstruktur.

### 1.2 Business Objectives

Tujuan bisnis yang ingin dicapai adalah:

1. Memusatkan pencatatan produk dan penerimaan barang dalam satu aplikasi.
2. Mempermudah pembuatan dan pemantauan dokumen penerimaan barang.
3. Memungkinkan pencatatan penerimaan barang secara parsial maupun penuh.
4. Memastikan stok diperbarui secara otomatis berdasarkan penerimaan yang berhasil.
5. Mencegah penerimaan barang melebihi jumlah yang diharapkan.
6. Menjaga konsistensi data penerimaan, persediaan, dan riwayat transaksi.
7. Mempermudah pemantauan status dokumen penerimaan.
8. Menyediakan riwayat transaksi untuk membantu pemeriksaan perubahan persediaan.
9. Menyediakan akses yang sesuai bagi operator dan supervisor gudang.

---

## 2. User Roles and Responsibilities

Sistem memiliki dua peran utama, yaitu operator gudang dan supervisor gudang.

### 2.1 Warehouse Operator (Operator Gudang)

Operator gudang bertanggung jawab menjalankan proses operasional penerimaan barang.

Tanggung jawab:

- Melihat daftar produk yang tersedia.
- Membuat dokumen penerimaan barang.
- Menambahkan produk beserta jumlah yang diharapkan ke dalam dokumen.
- Mencatat jumlah barang yang benar-benar diterima.
- Melakukan penerimaan barang secara parsial maupun penuh.
- Melihat detail dan status dokumen penerimaan.
- Melihat jumlah persediaan terkini.
- Melihat riwayat transaksi penerimaan barang.

### 2.2 Warehouse Supervisor (Supervisor Gudang)

Supervisor gudang bertanggung jawab memantau aktivitas penerimaan dan kondisi persediaan.

Tanggung jawab:

- Melihat daftar produk.
- Memantau dokumen penerimaan dan statusnya.
- Memeriksa jumlah barang yang diharapkan dan jumlah yang telah diterima.
- Memantau persediaan terkini.
- Memeriksa riwayat transaksi persediaan.
- Memantau kesalahan atau operasi penerimaan yang tidak valid.

**Asumsi:** Supervisor dapat mengakses fitur pemantauan yang tersedia bagi operator. Hak untuk membatalkan dokumen atau memberikan persetujuan tambahan belum ditentukan dalam assessment.

---

## 3. Functional Requirements

### FR-01 — Product Management

Sistem harus menyediakan fitur untuk melihat dan menambahkan data produk.

Persyaratan:

- FR-01.1: Sistem harus menampilkan daftar produk.
- FR-01.2: Sistem harus memungkinkan pengguna yang berwenang menambahkan produk.
- FR-01.3: Setiap produk harus memiliki SKU yang unik.
- FR-01.4: Setiap produk harus memiliki nama produk.
- FR-01.5: Setiap produk harus memiliki status aktif atau tidak aktif.
- FR-01.6: Sistem harus menolak SKU yang sudah digunakan.
- FR-01.7: Sistem harus memvalidasi data wajib sebelum menyimpan produk.

### FR-02 — Receiving Document Management

Sistem harus menyediakan fitur pembuatan dan pemantauan dokumen penerimaan barang.

Persyaratan:

- FR-02.1: Sistem harus menampilkan daftar dokumen penerimaan.
- FR-02.2: Sistem harus memungkinkan pengguna membuat dokumen penerimaan baru.
- FR-02.3: Setiap dokumen harus memiliki nomor dokumen yang unik.
- FR-02.4: Dokumen harus memiliki satu atau lebih item penerimaan.
- FR-02.5: Setiap item harus mengacu pada produk yang terdaftar.
- FR-02.6: Setiap item harus memiliki jumlah barang yang diharapkan.
- FR-02.7: Jumlah yang diharapkan harus lebih besar dari nol.
- FR-02.8: Sistem harus menampilkan jumlah yang diharapkan, jumlah yang diterima, dan sisa jumlah barang.
- FR-02.9: Sistem harus menampilkan status dokumen penerimaan.

### FR-03 — Receiving Operations

Sistem harus memungkinkan pengguna mencatat jumlah barang yang benar-benar diterima.

Persyaratan:

- FR-03.1: Sistem harus mendukung penerimaan barang secara parsial.
- FR-03.2: Sistem harus mendukung penerimaan barang secara penuh.
- FR-03.3: Sistem harus menghitung sisa jumlah barang secara otomatis.
- FR-03.4: Sistem harus menolak penerimaan yang melebihi sisa jumlah yang diharapkan.
- FR-03.5: Sistem harus memperbarui persediaan setelah penerimaan berhasil.
- FR-03.6: Sistem harus mencatat setiap penerimaan yang berhasil dalam riwayat transaksi.
- FR-03.7: Sistem harus mencegah kegagalan operasi menyebabkan perubahan data secara parsial.
- FR-03.8: Sistem harus mencegah permintaan berulang atau bersamaan menyebabkan pencatatan penerimaan ganda.

### FR-04 — Receiving Document Status

Sistem harus memantau status setiap dokumen penerimaan.

Persyaratan:

- FR-04.1: Sistem harus membedakan dokumen yang masih dalam proses dan dokumen yang selesai.
- FR-04.2: Dokumen harus tetap dalam proses jika masih terdapat item yang belum diterima sepenuhnya.
- FR-04.3: Dokumen hanya dapat berstatus selesai jika seluruh item telah diterima sesuai jumlah yang diharapkan.
- FR-04.4: Sistem harus memperbarui status dokumen secara otomatis ketika seluruh item terpenuhi.
- FR-04.5: Dokumen yang sudah selesai tidak dapat menerima tambahan barang.

### FR-05 — Inventory Management

Sistem harus menyediakan informasi persediaan terkini.

Persyaratan:

- FR-05.1: Sistem harus menampilkan daftar produk beserta jumlah stoknya.
- FR-05.2: Setiap produk harus memiliki catatan persediaan.
- FR-05.3: Stok harus bertambah sesuai jumlah penerimaan yang berhasil.
- FR-05.4: Stok tidak boleh berubah akibat penerimaan yang gagal.
- FR-05.5: Data stok harus konsisten dengan transaksi persediaan yang berhasil dicatat.

### FR-06 — Inventory Transaction History

Sistem harus menyediakan riwayat transaksi perubahan persediaan.

Persyaratan:

- FR-06.1: Sistem harus mencatat setiap penerimaan barang yang berhasil.
- FR-06.2: Setiap transaksi harus mengidentifikasi produk yang diterima.
- FR-06.3: Setiap transaksi harus mencatat jumlah barang yang diterima.
- FR-06.4: Setiap transaksi harus memiliki jenis transaksi dan waktu pencatatan.
- FR-06.5: Setiap transaksi penerimaan harus memiliki referensi ke item penerimaan terkait.
- FR-06.6: Sistem harus mencatat pengguna yang melakukan transaksi.
- FR-06.7: Pengguna harus dapat melihat riwayat transaksi.
- FR-06.8: Operasi yang gagal tidak boleh tercatat sebagai penerimaan yang berhasil.

### FR-07 — Authentication and Authorization

Sistem harus menyediakan autentikasi dasar atau mekanisme akses berbasis peran yang terdokumentasi.

Persyaratan:

- FR-07.1: Sistem harus membedakan peran operator dan supervisor.
- FR-07.2: Sistem harus membatasi tindakan pengguna berdasarkan hak aksesnya.
- FR-07.3: Backend harus memvalidasi hak akses secara mandiri.
- FR-07.4: Pembatasan tampilan pada frontend tidak boleh menjadi satu-satunya mekanisme otorisasi.

---

## 4. Non-Functional Requirements

### NFR-01 — Data Integrity

Sistem harus menjaga konsistensi data antara jumlah barang yang diterima, jumlah stok, status dokumen, dan riwayat transaksi.

Pembaruan data yang saling berkaitan harus dilakukan dalam satu transaksi database agar kegagalan tidak meninggalkan data parsial.

### NFR-02 — Security

Sistem harus memvalidasi autentikasi, otorisasi, dan input pengguna pada backend. Kredensial dan rahasia aplikasi tidak boleh disimpan langsung dalam repository Git.

### NFR-03 — Reliability

Sistem harus menolak operasi yang tidak valid tanpa mengubah stok atau jumlah penerimaan. Operasi penerimaan yang berhasil harus menghasilkan perubahan data yang konsisten.

### NFR-04 — Maintainability

Kode aplikasi harus terstruktur dan mudah dipelihara. Sistem harus menyediakan dokumentasi teknis, kontrak REST API, dan migrasi database.

### NFR-05 — Testability

Sistem harus memiliki automated tests untuk aturan bisnis kritis, validasi API, penanganan kesalahan, dan konsistensi stok.

### NFR-06 — Deployability

Sistem harus menyediakan Dockerfile, konfigurasi Docker Compose, environment variables, migrasi database, endpoint health check atau readiness, dan petunjuk menjalankan aplikasi dari lingkungan bersih.

### NFR-07 — Usability

Antarmuka harus menampilkan informasi produk, jumlah yang diharapkan, jumlah yang diterima, sisa barang, status dokumen, dan stok terkini dengan jelas.

### NFR-08 — Traceability

Setiap transaksi penerimaan yang berhasil harus dapat ditelusuri melalui riwayat transaksi dan dikaitkan dengan item penerimaan terkait.

---

## 5. User Stories and Acceptance Criteria

### US-01 — Menambahkan Produk

**User Story**

Sebagai operator gudang, saya ingin menambahkan produk dengan SKU unik agar produk dapat digunakan dalam dokumen penerimaan.

**Acceptance Criteria**

- AC-01.1: Produk dengan nama dan SKU valid dapat disimpan.
- AC-01.2: Produk dengan SKU duplikat harus ditolak.
- AC-01.3: Data produk yang berhasil disimpan muncul pada daftar produk.
- AC-01.4: Data wajib yang kosong atau tidak valid harus menghasilkan kesalahan validasi.

### US-02 — Membuat Dokumen Penerimaan

**User Story**

Sebagai operator gudang, saya ingin membuat dokumen penerimaan yang berisi produk dan jumlah yang diharapkan agar kedatangan barang dapat dipantau.

**Acceptance Criteria**

- AC-02.1: Dokumen memiliki nomor yang unik.
- AC-02.2: Dokumen harus berisi minimal satu item.
- AC-02.3: Setiap item mengacu pada produk yang valid.
- AC-02.4: Jumlah yang diharapkan harus lebih besar dari nol.
- AC-02.5: Jumlah yang diterima pada item baru dimulai dari nol.

### US-03 — Mencatat Penerimaan Parsial

**User Story**

Sebagai operator gudang, saya ingin mencatat sebagian barang yang diterima agar stok mencerminkan kondisi barang yang benar-benar masuk.

**Acceptance Criteria**

- AC-03.1: Item dengan jumlah yang diharapkan 100 unit dapat menerima 40 unit.
- AC-03.2: Jumlah yang diterima berubah menjadi 40 unit.
- AC-03.3: Sisa jumlah berubah menjadi 60 unit.
- AC-03.4: Stok bertambah sebanyak 40 unit.
- AC-03.5: Riwayat transaksi mencatat penerimaan sebanyak 40 unit.
- AC-03.6: Dokumen tetap dalam proses jika masih ada item yang belum terpenuhi.

### US-04 — Menyelesaikan Penerimaan

**User Story**

Sebagai operator gudang, saya ingin mencatat sisa barang yang datang agar dokumen penerimaan dapat diselesaikan.

**Acceptance Criteria**

- AC-04.1: Jika 60 unit masih tersisa, penerimaan sebanyak 60 unit dapat dilakukan.
- AC-04.2: Jumlah yang diterima menjadi 100 unit.
- AC-04.3: Sisa barang menjadi nol.
- AC-04.4: Dokumen berubah menjadi selesai setelah seluruh item terpenuhi.
- AC-04.5: Dokumen yang selesai tidak dapat menerima tambahan barang.

### US-05 — Mencegah Penerimaan Berlebih

**User Story**

Sebagai supervisor gudang, saya ingin sistem menolak penerimaan melebihi jumlah yang diharapkan agar stok tetap akurat.

**Acceptance Criteria**

- AC-05.1: Jika jumlah yang diharapkan 100 unit dan 40 unit telah diterima, permintaan tambahan 61 unit harus ditolak.
- AC-05.2: Jumlah yang diterima tetap 40 unit setelah permintaan ditolak.
- AC-05.3: Stok tidak berubah akibat permintaan yang ditolak.
- AC-05.4: Tidak ada transaksi penerimaan berhasil yang dibuat untuk permintaan yang ditolak.
- AC-05.5: API mengembalikan respons kesalahan validasi yang sesuai.

### US-06 — Melihat Persediaan dan Riwayat Transaksi

**User Story**

Sebagai supervisor gudang, saya ingin melihat persediaan dan riwayat transaksi agar perubahan stok dapat dipantau dan diperiksa.

**Acceptance Criteria**

- AC-06.1: Daftar persediaan menampilkan jumlah stok terkini setiap produk.
- AC-06.2: Penerimaan yang berhasil muncul dalam riwayat transaksi.
- AC-06.3: Jumlah transaksi sesuai dengan jumlah yang benar-benar diterima.
- AC-06.4: Jumlah stok tetap konsisten dengan transaksi penerimaan yang berhasil dicatat.

---

## 6. Business Rules and Validation Requirements

| ID    | Aturan                                                                     | Validasi yang Diperlukan                                                   |
| ----- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| BR-01 | SKU produk harus unik.                                                     | Tolak SKU yang sudah terdaftar.                                            |
| BR-02 | Nomor dokumen harus unik.                                                  | Tolak nomor dokumen duplikat.                                              |
| BR-03 | Jumlah yang diharapkan harus positif.                                      | Tolak nilai nol atau negatif.                                              |
| BR-04 | Jumlah penerimaan harus positif.                                           | Tolak nilai nol atau negatif.                                              |
| BR-05 | Sisa barang = jumlah yang diharapkan dikurangi jumlah yang telah diterima. | Hitung sisa secara konsisten pada backend.                                 |
| BR-06 | Jumlah penerimaan tidak boleh melebihi sisa barang.                        | Tolak penerimaan yang melebihi sisa jumlah.                                |
| BR-07 | Dokumen selesai jika seluruh item telah terpenuhi.                         | Tolak penyelesaian jika masih ada item yang belum terpenuhi.               |
| BR-08 | Dokumen selesai tidak menerima tambahan barang.                            | Tolak penerimaan pada dokumen selesai.                                     |
| BR-09 | Stok bertambah hanya setelah penerimaan berhasil.                          | Jangan memperbarui stok sebelum validasi berhasil.                         |
| BR-10 | Operasi gagal tidak boleh mengubah data penerimaan atau stok.              | Batalkan transaksi database jika terjadi kegagalan.                        |
| BR-11 | Perubahan jumlah penerimaan, stok, dan riwayat transaksi harus konsisten.  | Gunakan transaksi database atomik.                                         |
| BR-12 | Permintaan berulang atau bersamaan tidak boleh menggandakan penerimaan.    | Gunakan kontrol konkurensi dan mekanisme pencegahan duplikasi yang sesuai. |
| BR-13 | Item harus mengacu pada produk dan dokumen yang valid.                     | Validasi referensi dan foreign key.                                        |
| BR-14 | Riwayat transaksi mencatat penerimaan yang berhasil.                       | Jangan membuat transaksi penerimaan berhasil untuk operasi yang ditolak.   |

**Asumsi validasi:** Kuantitas barang pada versi awal menggunakan bilangan bulat positif. Dukungan kuantitas desimal belum ditentukan.

---

## 7. Application Scope and Out-of-Scope Features

### 7.1 In-Scope Features

Fitur yang termasuk dalam ruang lingkup pengembangan:

1. Daftar dan pembuatan produk.
2. Daftar dan pembuatan dokumen penerimaan.
3. Detail dokumen beserta item penerimaan.
4. Pencatatan penerimaan parsial dan penuh.
5. Validasi jumlah penerimaan.
6. Pembaruan stok otomatis.
7. Daftar persediaan.
8. Riwayat transaksi persediaan.
9. Autentikasi dasar atau mekanisme akses berbasis peran yang terdokumentasi.
10. Validasi backend dan penanganan kesalahan.
11. Automated tests untuk aturan bisnis kritis.
12. Dokumentasi teknis, migrasi database, dan konfigurasi Docker.

### 7.2 Out-of-Scope Features

Fitur berikut tidak termasuk dalam versi awal:

1. Pengelolaan pemasok.
2. Integrasi pesanan pembelian.
3. Pemindaian barcode.
4. Pengelolaan barang rusak dan retur.
5. Proses penjualan atau pengeluaran barang.
6. Transfer persediaan antargudang.
7. Pengelolaan banyak gudang.
8. Analitik lanjutan dan laporan kompleks.
9. Notifikasi melalui email atau SMS.
10. Integrasi dengan sistem eksternal.

Fitur di luar ruang lingkup dapat dipertimbangkan pada pengembangan selanjutnya jika dibutuhkan.

---

## 8. Assumptions, Constraints, and Unresolved Questions

### 8.1 Assumptions

Asumsi berikut digunakan karena beberapa detail bisnis belum dijelaskan dalam assessment.

1. Sistem awal digunakan untuk satu gudang.
2. Setiap SKU mengidentifikasi satu produk.
3. Satu dokumen penerimaan dapat berisi beberapa produk.
4. Setiap item memiliki satu jumlah yang diharapkan dan akumulasi jumlah yang diterima.
5. Jumlah barang yang diterima pada item baru dimulai dari nol.
6. Stok awal harus ditentukan melalui mekanisme inisialisasi yang terdokumentasi.
7. Stok pada versi awal hanya berubah melalui penerimaan barang yang berhasil.
8. Supervisor berfokus pada pemantauan, sedangkan operator menjalankan proses penerimaan.
9. Penghapusan permanen produk dan dokumen yang sudah memiliki transaksi tidak menjadi bagian dari alur utama.
10. Aplikasi menggunakan database relasional dan REST API.
11. Pengembangan memanfaatkan AI coding agent berdasarkan PRD dan spesifikasi teknis.
12. Git digunakan untuk pengelolaan kode dan riwayat perubahan.

### 8.2 Constraints

Batasan pengembangan:

1. Aplikasi harus menggunakan database relasional seperti PostgreSQL.
2. Aplikasi harus menyediakan REST API yang terdokumentasi.
3. Git harus digunakan dengan riwayat commit yang bermakna.
4. AI coding agent harus menjadi bagian utama proses implementasi.
5. Pengembang bertanggung jawab meninjau dan memvalidasi kode yang dihasilkan AI.
6. Aplikasi harus menyediakan automated tests untuk aturan bisnis kritis.
7. Aplikasi harus memiliki Dockerfile dan konfigurasi Docker Compose.
8. Aplikasi harus menyediakan petunjuk instalasi, eksekusi, pengujian, dan deployment.
9. Pengembangan diprioritaskan pada kebenaran proses inti daripada fitur tambahan.
10. Target pengerjaan adalah 8–12 jam, dengan batas pengumpulan tiga hari kalender.
11. Deployment publik bersifat opsional kecuali diwajibkan secara khusus oleh tim perekrut.

### 8.3 Unresolved Questions

Pertanyaan berikut belum memiliki jawaban eksplisit dalam assessment dan perlu diklarifikasi atau ditetapkan sebagai asumsi sebelum implementasi.

| ID    | Pertanyaan                                                              | Dampak                                             |
| ----- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| UQ-01 | Apakah hanya supervisor yang boleh menambahkan produk?                  | Menentukan hak akses fitur produk.                 |
| UQ-02 | Apakah dokumen penerimaan dapat diedit atau dibatalkan?                 | Memengaruhi alur dokumen dan integritas stok.      |
| UQ-03 | Apakah dokumen yang sudah menerima sebagian barang dapat dibatalkan?    | Memengaruhi penanganan stok dan riwayat transaksi. |
| UQ-04 | Apakah penyelesaian dokumen memerlukan persetujuan supervisor?          | Memengaruhi status dan otorisasi.                  |
| UQ-05 | Apakah jumlah barang dapat menggunakan nilai desimal?                   | Memengaruhi tipe data dan validasi kuantitas.      |
| UQ-06 | Apakah produk tidak aktif tetap ditampilkan dalam riwayat lama?         | Memengaruhi pengelolaan status produk.             |
| UQ-07 | Apakah sistem harus mencatat identitas pengguna pada setiap penerimaan? | Memengaruhi kebutuhan audit.                       |
| UQ-08 | Apakah tim perekrut mewajibkan aplikasi dipublikasikan secara online?   | Memengaruhi strategi deployment.                   |

Untuk menjaga waktu pengerjaan, pertanyaan yang tidak dapat diklarifikasi akan dijawab melalui asumsi desain yang didokumentasikan.

---

## 9. Definition of Done

Implementasi dinyatakan memenuhi kebutuhan inti jika:

1. Produk dapat dibuat dan ditampilkan.
2. Dokumen penerimaan dapat dibuat dan menampilkan itemnya.
3. Penerimaan parsial dan penuh berfungsi sesuai aturan bisnis.
4. Penerimaan yang melebihi jumlah yang diharapkan ditolak.
5. Dokumen hanya selesai ketika seluruh item telah terpenuhi.
6. Stok diperbarui secara otomatis dan tetap konsisten dengan riwayat transaksi.
7. Operasi gagal tidak meninggalkan perubahan data parsial.
8. Autentikasi atau mekanisme akses berdasarkan peran tersedia dan terdokumentasi.
9. Automated tests mencakup aturan bisnis kritis dan validasi API.
10. Aplikasi dapat dijalankan dari lingkungan bersih mengikuti petunjuk yang disediakan.
11. Repository berisi dokumentasi, source code, migrasi database, pengujian, konfigurasi Docker, dan README.
12. Keterbatasan serta pekerjaan yang belum selesai didokumentasikan.

---

## 10. Referensi Dokumen Teknis

PRD ini menjadi acuan bagi dokumen implementasi berikut:

- `docs/technical-spec.md` — arsitektur sistem, desain database, API contract, alur data, otorisasi, dan strategi pengujian.
- `docs/erd.mmd` — diagram hubungan entitas database.
- `docs/openapi.yaml` — kontrak endpoint REST API.
- `docs/data-flow.mmd` — diagram alur data dan proses penerimaan.
- `docs/ai-workflow.md` — instruksi proyek dan dokumentasi penggunaan AI coding agent.
- `docs/testing.md` — strategi, skenario, dan hasil pengujian.
- `README.md` — petunjuk instalasi, eksekusi, pengujian, dan deployment.

**Akhir Dokumen PRD**
