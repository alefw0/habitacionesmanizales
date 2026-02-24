"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Contraseña incorrecta");
      }

      // Login successful - redirect to admin panel
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (\n    <div className="min-h-screen flex items-center justify-center bg-gray-50">\n      <div className="w-full max-w-md">\n        <div className="bg-white rounded-lg shadow-md p-8">\n          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">\n            Panel de Administración\n          </h1>\n          <p className="text-sm text-gray-500 text-center mb-6">\n            Estudia&Vive Manizales\n          </p>\n\n          <form onSubmit={handleLogin} className="space-y-4">\n            <div>\n              <label htmlFor="password" className="block text-sm font-medium text-gray-700">\n                Contraseña de administrador\n              </label>\n              <input\n                id="password"\n                type="password"\n                value={password}\n                onChange={(e) => setPassword(e.target.value)}\n                disabled={loading}\n                placeholder="Ingresa la contraseña\"\n                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100\"\n              />\n            </div>\n\n            {error && (\n              <div className=\"bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700\">\n                {error}\n              </div>\n            )}\n\n            <button\n              type=\"submit\"\n              disabled={loading}\n              className=\"w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50\"\n            >\n              {loading ? \"Verificando...\" : \"Ingresar\"}\n            </button>\n          </form>\n        </div>\n      </div>\n    </div>\n  );\n}\n