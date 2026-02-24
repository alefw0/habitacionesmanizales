import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = "s5g2sX7Qr3COci2ovxedpQ";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Contraseña requerida" },
        { status: 400 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // Crear respuesta con cookie de sesión
    const response = NextResponse.json(
      { success: true, message: "Sesión iniciada" },
      { status: 200 }
    );

    // Set cookie: admin_session=authenticated (válida por 24 horas)
    response.cookies.set({
      name: "admin_session",
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 horas
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
