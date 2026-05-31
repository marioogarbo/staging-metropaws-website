import { cookies } from "next/headers";
import { signOutAction } from "./actions";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  // Decode email from JWT payload (no verification needed — middleware already guards this route)
  let adminEmail: string | null = null;
  if (token) {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString(),
      );
      adminEmail = payload.sub ?? null;
    } catch {
      // non-critical — just won't show the email
    }
  }

  return (
    <div className="min-h-svh bg-[oklch(0.97_0.01_80)]">
      {/* Top bar */}
      <header className="bg-[oklch(0.24_0.055_258)] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[oklch(0.72_0.115_82)]" />
            <span
              className="text-white font-semibold tracking-wide"
              style={{ fontSize: "14px" }}
            >
              MetroPaws
            </span>
            <span className="text-white/20 text-sm">·</span>
            <span className="text-white/40 text-xs font-medium tracking-wide uppercase">
              Admin Portal
            </span>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-xs font-medium transition-colors duration-150 px-3 py-1.5 rounded-md hover:bg-white/5"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-[oklch(0.72_0.115_82)] text-xs font-semibold tracking-widest uppercase mb-2">
            Dashboard
          </p>
          <h1
            className="text-[oklch(0.24_0.055_258)] font-semibold tracking-tight"
            style={{ fontSize: "24px" }}
          >
            Welcome back
            {adminEmail ? (
              <span className="text-[oklch(0.48_0.02_258)] font-normal">
                {" "}
                · {adminEmail}
              </span>
            ) : null}
          </h1>
        </div>

        {/* Placeholder content area */}
        <div className="rounded-xl border border-[oklch(0.72_0.01_258)] bg-white/60 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-[oklch(0.94_0.015_75)] flex items-center justify-center mb-4">
            <div className="w-4 h-4 rounded-full bg-[oklch(0.72_0.01_258)]" />
          </div>
          <p
            className="text-[oklch(0.48_0.02_258)] font-medium mb-1"
            style={{ fontSize: "14px" }}
          >
            Nothing here yet
          </p>
          <p className="text-[oklch(0.72_0.01_258)] text-xs">
            Admin features will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}
