import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Silenciar error de refresh token no encontrado
    user = null;
  }

  // Páginas protegidas: redirigen a login si no hay sesión
  const isProtectedPage =
    request.nextUrl.pathname.startsWith("/cargar-tesis") ||
    request.nextUrl.pathname.startsWith("/registros-respuesta") ||
    request.nextUrl.pathname.startsWith("/tesistas") ||
    request.nextUrl.pathname.startsWith("/configuracion") ||
    request.nextUrl.pathname === "/";

  // API routes protegidas: no redirigen, pero requieren sesión para funcionar
  const isProtectedApi =
    request.nextUrl.pathname.startsWith("/api/analyze") ||
    request.nextUrl.pathname.startsWith("/api/settings") ||
    request.nextUrl.pathname.startsWith("/api/tesis/send-email") ||
    request.nextUrl.pathname.startsWith("/api/upload");

  if (!user && isProtectedPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
