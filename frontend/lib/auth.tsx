const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface User {
  id_user: number;
  name: string;
  email: string;
  role: "admin" | "staff";
}

export async function getCurrentUser(token: string): Promise<User> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi");
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data pengguna");
  }

  return result.data as User;
}
