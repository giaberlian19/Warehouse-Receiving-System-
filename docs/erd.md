# Entity Relationship Diagram (ERD)

## Warehouse Receiving System

Diagram ini menggambarkan hubungan antara pengguna, produk,
dokumen penerimaan, rincian penerimaan, inventaris, dan transaksi stok.

```mermaid
erDiagram
    USERS ||--o{ RECEIVING_DOCUMENTS : creates
    USERS ||--o{ INVENTORY_TRANSACTIONS : performs

    RECEIVING_DOCUMENTS ||--|{ RECEIVING_DOCUMENT_ITEMS : contains

    PRODUCTS ||--o{ RECEIVING_DOCUMENT_ITEMS : references
    PRODUCTS ||--o| INVENTORIES : has
    PRODUCTS ||--o{ INVENTORY_TRANSACTIONS : records

    RECEIVING_DOCUMENT_ITEMS ||--o{ INVENTORY_TRANSACTIONS : generates

    USERS {
        bigint id_user PK
        varchar name
        varchar email UK
        varchar password
        varchar role
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        bigint id PK
        varchar sku UK
        varchar name
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    RECEIVING_DOCUMENTS {
        bigint id PK
        varchar document_number UK
        varchar status
        bigint created_by FK
        timestamp created_at
        timestamp updated_at
    }

    RECEIVING_DOCUMENT_ITEMS {
        bigint id PK
        bigint receiving_document_id FK
        bigint product_id FK
        integer expected_quantity
        integer received_quantity
        timestamp created_at
        timestamp updated_at
    }

    INVENTORIES {
        bigint id PK
        bigint product_id FK, UK
        integer quantity
        timestamp created_at
        timestamp updated_at
    }

    INVENTORY_TRANSACTIONS {
        bigint id PK
        bigint product_id FK
        bigint receiving_document_item_id FK
        bigint performed_by FK
        varchar transaction_type
        integer quantity
        timestamp created_at
    }
```

## Business Rules

1. Setiap produk memiliki SKU yang unik.
2. Setiap dokumen penerimaan memiliki nomor dokumen yang unik.
3. Satu dokumen penerimaan memiliki satu atau lebih rincian produk.
4. Jumlah yang diterima tidak boleh melebihi jumlah yang diharapkan.
5. Satu produk hanya memiliki maksimal satu baris inventaris.
6. Setiap penerimaan yang berhasil harus memperbarui jumlah diterima, stok inventaris, dan riwayat transaksi secara atomik.
7. Dokumen hanya berstatus `completed` jika seluruh barang telah diterima sesuai jumlah yang diharapkan.
8. Satu rincian penerimaan dapat menghasilkan beberapa transaksi stok karena penerimaan parsial.
