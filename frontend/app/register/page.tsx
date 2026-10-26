"use client";

import Link from "next/link";
import { useState } from "react";

type RegisterResponse = {
  success: boolean;
  message?: string;
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi");
      }

      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const result = (await response.json()) as RegisterResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Registrasi gagal");
      }

      setRegistered(true);
      setPassword("");
      setMessage(result.message || "Registrasi berhasil. Silakan masuk.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10 text-gray-900">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            Warehouse Receiving System
          </p>
          <h1 className="text-3xl font-bold">Buat akun baru</h1>
          <p className="mt-2 text-sm text-gray-600">
            Daftar untuk mulai menggunakan sistem gudang.
          </p>
        </div>

        {registered ? (
          <div>
            <p
              role="status"
              className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-800"
            >
              {message}
            </p>
            <Link
              href="/"
              className="block rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
            >
              Masuk ke akun
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nama
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Nama lengkap"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={255}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Minimal 8 karakter"
              />
              <p className="mt-2 text-xs text-gray-500">
                Gunakan minimal 8 karakter.
              </p>
            </div>

            {message && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Membuat akun..." : "Daftar"}
            </button>
          </form>
        )}

        {!registered && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link
              href="/"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Masuk
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
