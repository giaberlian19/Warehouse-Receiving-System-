"use client";

import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";

type Product = {
  id_product: number;
  sku: string;
  name: string;
  is_active: boolean;
};

type User = {
  id_user: number;
  name: string;
  email: string;
  role: string;
};

type ReceivingItem = {
  id_document_receiving: number;
  product_id: number;
  sku: string;
  product_name: string;
  expected_quantity: number;
  received_quantity: number;
};

type ReceivingDocument = {
  id_document: number;
  document_number: string;
  status: string;
  created_at: string;
  total_items?: number;
  items?: ReceivingItem[];
};

type InventoryRow = {
  product_id: number;
  sku: string;
  product_name: string;
  quantity: number;
  is_active: boolean;
};

type InventoryTransaction = {
  id_inventory_transactions: number;
  document_number: string;
  sku: string;
  product_name: string;
  quantity: number;
  performed_by_name: string;
  created_at: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type DraftItem = {
  product_id: string;
  expected_quantity: string;
};

const tabs = ["Penerimaan", "Produk", "Inventaris", "Riwayat"] as const;
type Tab = (typeof tabs)[number];

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Penerimaan");
  const [products, setProducts] = useState<Product[]>([]);
  const [documents, setDocuments] = useState<ReceivingDocument[]>([]);
  const [selectedDocument, setSelectedDocument] =
    useState<ReceivingDocument | null>(null);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [documentNumber, setDocumentNumber] = useState("");
  const [draftItems, setDraftItems] = useState<DraftItem[]>([
    { product_id: "", expected_quantity: "" },
  ]);
  const [productSku, setProductSku] = useState("");
  const [productName, setProductName] = useState("");
  const [receiveQuantities, setReceiveQuantities] = useState<
    Record<number, string>
  >({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const request = useCallback(
    async <T,>(
      path: string,
      authToken: string,
      init: RequestInit = {},
    ): Promise<T> => {
      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi");
      }

      const headers = new Headers(init.headers);
      if (init.body) headers.set("Content-Type", "application/json");
      headers.set("Authorization", `Bearer ${authToken}`);

      const response = await fetch(`${apiUrl}${path}`, {
        ...init,
        headers,
      });
      const result = (await response.json()) as ApiResponse<T>;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Permintaan ke server gagal");
      }

      return result.data;
    },
    [apiUrl],
  );

  const refreshData = useCallback(
    async (authToken: string) => {
      const [productData, documentData, inventoryData, transactionData] =
        await Promise.all([
          request<Product[]>("/products", authToken),
          request<ReceivingDocument[]>("/receiving-documents", authToken),
          request<InventoryRow[]>("/inventory", authToken),
          request<InventoryTransaction[]>("/inventory/transactions", authToken),
        ]);
      setProducts(productData);
      setDocuments(documentData);
      setInventory(inventoryData);
      setTransactions(transactionData);
    },
    [request],
  );

  const openDocument = async (id: number, authToken = token) => {
    try {
      const document = await request<ReceivingDocument>(
        `/receiving-documents/${id}`,
        authToken,
      );
      setSelectedDocument(document);
      setReceiveQuantities({});
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat dokumen");
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi");
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as ApiResponse<{
        token: string;
        user: User;
      }>;
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login gagal");
      }
      setToken(result.data.token);
      setUser(result.data.user);
      setPassword("");
      await refreshData(result.data.token);
      setMessage("Berhasil masuk.");
    } catch (error) {
      setToken("");
      setUser(null);
      setMessage(error instanceof Error ? error.message : "Login gagal");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    setProducts([]);
    setDocuments([]);
    setSelectedDocument(null);
    setInventory([]);
    setTransactions([]);
    setMessage("");
  };

  const createDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const items = draftItems.map((item) => ({
        product_id: Number(item.product_id),
        expected_quantity: Number(item.expected_quantity),
      }));
      const created = await request<ReceivingDocument>(
        "/receiving-documents",
        token,
        {
          method: "POST",
          body: JSON.stringify({ document_number: documentNumber, items }),
        },
      );
      setDocumentNumber("");
      setDraftItems([{ product_id: "", expected_quantity: "" }]);
      await refreshData(token);
      await openDocument(created.id_document);
      setMessage("Dokumen penerimaan berhasil dibuat.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal membuat dokumen",
      );
    } finally {
      setBusy(false);
    }
  };

  const recordReceipt = async (item: ReceivingItem) => {
    const quantity = Number(receiveQuantities[item.id_document_receiving]);
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      setMessage("Masukkan jumlah penerimaan berupa bilangan bulat positif.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      await request(
        `/receiving-documents/${selectedDocument?.id_document}/items/${item.id_document_receiving}/receive`,
        token,
        {
          method: "POST",
          headers: { "Idempotency-Key": crypto.randomUUID() },
          body: JSON.stringify({ quantity }),
        },
      );
      await refreshData(token);
      if (selectedDocument) await openDocument(selectedDocument.id_document);
      setMessage("Penerimaan barang berhasil dicatat.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal mencatat penerimaan",
      );
    } finally {
      setBusy(false);
    }
  };

  const createProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await request("/products", token, {
        method: "POST",
        body: JSON.stringify({ sku: productSku, name: productName }),
      });
      setProductSku("");
      setProductName("");
      await refreshData(token);
      setMessage("Produk berhasil ditambahkan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menambahkan produk");
    } finally {
      setBusy(false);
    }
  };

  const completeDocument = async () => {
    if (!selectedDocument) return;
    setBusy(true);
    setMessage("");
    try {
      await request(
        `/receiving-documents/${selectedDocument.id_document}/complete`,
        token,
        { method: "PATCH" },
      );
      await refreshData(token);
      await openDocument(selectedDocument.id_document);
      setMessage("Dokumen berhasil diselesaikan.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal menyelesaikan dokumen",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              Warehouse operations
            </p>
            <h1 className="mt-1 text-3xl font-bold">Warehouse Receiving</h1>
            <p className="mt-1 text-slate-600">
              Kelola penerimaan barang, produk, dan persediaan gudang.
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm capitalize text-slate-500">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Keluar
              </button>
            </div>
          )}
        </header>

        {message && (
          <p
            role="status"
            className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900"
          >
            {message}
          </p>
        )}

        {!user ? (
          <section className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold">Masuk ke akun</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block text-sm font-medium">
                Email
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 p-3"
                />
              </label>
              <label className="block text-sm font-medium">
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 p-3"
                />
              </label>
              <button
                disabled={busy}
                className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {busy ? "Memproses..." : "Masuk"}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-600">
              Belum punya akun?{" "}
              <Link href="/register" className="font-semibold text-blue-700">
                Daftar
              </Link>
            </p>
          </section>
        ) : (
          <>
            <nav className="mb-6 flex flex-wrap gap-2" aria-label="Menu utama">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2 font-semibold ${
                    activeTab === tab
                      ? "bg-blue-700 text-white"
                      : "bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <button
                onClick={() =>
                  refreshData(token).catch((error: unknown) =>
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : "Gagal memuat ulang data",
                    ),
                  )
                }
                className="ml-auto rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold"
              >
                Muat ulang
              </button>
            </nav>

            {activeTab === "Penerimaan" && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-xl font-bold">Buat dokumen</h2>
                  <form onSubmit={createDocument} className="space-y-4">
                    <label className="block text-sm font-medium">
                      Nomor dokumen
                      <input
                        value={documentNumber}
                        onChange={(event) => setDocumentNumber(event.target.value)}
                        maxLength={100}
                        required
                        className="mt-1 w-full rounded-lg border border-slate-300 p-3"
                        placeholder="RCV-2026-001"
                      />
                    </label>
                    {draftItems.map((item, index) => (
                      <div
                        key={index}
                        className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_130px_auto]"
                      >
                        <label className="text-sm font-medium">
                          Produk
                          <select
                            value={item.product_id}
                            onChange={(event) =>
                              setDraftItems((current) =>
                                current.map((entry, itemIndex) =>
                                  itemIndex === index
                                    ? { ...entry, product_id: event.target.value }
                                    : entry,
                                ),
                              )
                            }
                            required
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3"
                          >
                            <option value="">Pilih produk</option>
                            {products
                              .filter((product) => product.is_active)
                              .map((product) => (
                                <option
                                  key={product.id_product}
                                  value={product.id_product}
                                >
                                  {product.sku} — {product.name}
                                </option>
                              ))}
                          </select>
                        </label>
                        <label className="text-sm font-medium">
                          Jumlah
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.expected_quantity}
                            onChange={(event) =>
                              setDraftItems((current) =>
                                current.map((entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        expected_quantity: event.target.value,
                                      }
                                    : entry,
                                ),
                              )
                            }
                            required
                            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
                          />
                        </label>
                        {draftItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraftItems((current) =>
                                current.filter((_, itemIndex) => itemIndex !== index),
                              )
                            }
                            className="self-end rounded-lg border px-3 py-3 text-sm"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setDraftItems((current) => [
                            ...current,
                            { product_id: "", expected_quantity: "" },
                          ])
                        }
                        className="rounded-lg border border-slate-300 px-4 py-2 font-semibold"
                      >
                        + Tambah item
                      </button>
                      <button
                        disabled={busy}
                        className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
                      >
                        Simpan dokumen
                      </button>
                    </div>
                  </form>

                  <h2 className="mb-3 mt-8 text-xl font-bold">
                    Daftar dokumen
                  </h2>
                  <div className="space-y-2">
                    {documents.map((document) => (
                      <button
                        key={document.id_document}
                        onClick={() => openDocument(document.id_document)}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left ${
                          selectedDocument?.id_document === document.id_document
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span>
                          <span className="block font-semibold">
                            {document.document_number}
                          </span>
                          <span className="text-sm text-slate-500">
                            {document.total_items ?? 0} item
                          </span>
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize">
                          {document.status}
                        </span>
                      </button>
                    ))}
                    {documents.length === 0 && (
                      <p className="text-sm text-slate-500">
                        Belum ada dokumen penerimaan.
                      </p>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-xl font-bold">Detail penerimaan</h2>
                  {!selectedDocument ? (
                    <p className="text-slate-500">
                      Pilih dokumen untuk melihat item dan mencatat barang masuk.
                    </p>
                  ) : (
                    <>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {selectedDocument.document_number}
                          </p>
                          <p className="text-sm capitalize text-slate-500">
                            Status: {selectedDocument.status}
                          </p>
                        </div>
                        {user.role === "admin" &&
                          selectedDocument.status !== "completed" && (
                            <button
                              onClick={completeDocument}
                              disabled={busy}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-60"
                            >
                              Selesaikan
                            </button>
                          )}
                      </div>
                      <div className="space-y-4">
                        {(selectedDocument.items ?? []).map((item) => {
                          const remaining =
                            item.expected_quantity - item.received_quantity;
                          return (
                            <div
                              key={item.id_document_receiving}
                              className="rounded-xl border border-slate-200 p-4"
                            >
                              <div className="flex flex-wrap justify-between gap-2">
                                <div>
                                  <p className="font-semibold">
                                    {item.sku} — {item.product_name}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-600">
                                    Diharapkan {item.expected_quantity} · Diterima{" "}
                                    {item.received_quantity} · Sisa {remaining}
                                  </p>
                                </div>
                              </div>
                              {remaining > 0 &&
                                selectedDocument.status !== "completed" && (
                                  <div className="mt-3 flex gap-2">
                                    <input
                                      aria-label={`Jumlah diterima ${item.product_name}`}
                                      type="number"
                                      min="1"
                                      max={remaining}
                                      step="1"
                                      value={
                                        receiveQuantities[
                                          item.id_document_receiving
                                        ] ?? ""
                                      }
                                      onChange={(event) =>
                                        setReceiveQuantities((current) => ({
                                          ...current,
                                          [item.id_document_receiving]:
                                            event.target.value,
                                        }))
                                      }
                                      className="min-w-0 flex-1 rounded-lg border border-slate-300 p-2"
                                      placeholder="Jumlah diterima"
                                    />
                                    <button
                                      onClick={() => recordReceipt(item)}
                                      disabled={busy}
                                      className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
                                    >
                                      Catat
                                    </button>
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </section>
              </div>
            )}

            {activeTab === "Produk" && (
              <section className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-bold">Produk</h2>
                <form
                  onSubmit={createProduct}
                  className="mb-6 grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-[1fr_2fr_auto]"
                >
                  <input
                    value={productSku}
                    onChange={(event) => setProductSku(event.target.value)}
                    maxLength={100}
                    required
                    placeholder="SKU"
                    aria-label="SKU produk"
                    className="rounded-lg border border-slate-300 bg-white p-3"
                  />
                  <input
                    value={productName}
                    onChange={(event) => setProductName(event.target.value)}
                    maxLength={255}
                    required
                    placeholder="Nama produk"
                    aria-label="Nama produk"
                    className="rounded-lg border border-slate-300 bg-white p-3"
                  />
                  <button
                    disabled={busy}
                    className="rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-60"
                  >
                    Tambah produk
                  </button>
                </form>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Nama</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id_product} className="border-t">
                          <td className="p-3">{product.sku}</td>
                          <td className="p-3">{product.name}</td>
                          <td className="p-3">
                            {product.is_active ? "Aktif" : "Nonaktif"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === "Inventaris" && (
              <section className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-bold">Persediaan terkini</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Produk</th>
                        <th className="p-3">Stok</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((row) => (
                        <tr key={row.product_id} className="border-t">
                          <td className="p-3">{row.sku}</td>
                          <td className="p-3">{row.product_name}</td>
                          <td className="p-3 font-semibold">{row.quantity}</td>
                          <td className="p-3">
                            {row.is_active ? "Aktif" : "Nonaktif"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {inventory.length === 0 && (
                    <p className="p-4 text-slate-500">Belum ada data stok.</p>
                  )}
                </div>
              </section>
            )}

            {activeTab === "Riwayat" && (
              <section className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-bold">Riwayat transaksi</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Dokumen</th>
                        <th className="p-3">Produk</th>
                        <th className="p-3">Jumlah</th>
                        <th className="p-3">Petugas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr
                          key={transaction.id_inventory_transactions}
                          className="border-t"
                        >
                          <td className="p-3">
                            {new Date(transaction.created_at).toLocaleString(
                              "id-ID",
                            )}
                          </td>
                          <td className="p-3">{transaction.document_number}</td>
                          <td className="p-3">
                            {transaction.sku} — {transaction.product_name}
                          </td>
                          <td className="p-3">{transaction.quantity}</td>
                          <td className="p-3">{transaction.performed_by_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transactions.length === 0 && (
                    <p className="p-4 text-slate-500">
                      Belum ada transaksi penerimaan.
                    </p>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
