import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Route accessibili solo da utenti autenticati: redirect a /login se assenti.
const PROTECTED_PATHS = ["/dashboard", "/lessons", "/workbench", "/profile"];

// Route di auth: redirect a /dashboard se l'utente ha già una sessione.
// /reset-password NON è incluso: vi si accede con una sessione di recovery
// (creata da /auth/callback) e la sua protezione resta gestita dalla pagina stessa.
const AUTH_ONLY_PATHS = ["/login", "/register"];

function matchesPath(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Necessario per aggiornare il token di sessione se è scaduto.
  // Non rimuovere: senza questa chiamata gli utenti possono essere
  // sloggati in modo casuale lato server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => matchesPath(pathname, path));
  const isAuthOnly = AUTH_ONLY_PATHS.some((path) => matchesPath(pathname, path));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && isAuthOnly) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
