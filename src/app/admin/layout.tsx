import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatDrawer } from "@/components/admin/chat-drawer";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/dashboard"
              className="text-xl font-bold text-white"
            >
              RiseUp Admin
            </Link>
            {user && (
              <nav className="flex items-center gap-4">
                <Link
                  href="/admin/dashboard"
                  className="text-sm text-muted-foreground transition-colors hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/dashboard/sponsors"
                  className="text-sm text-muted-foreground transition-colors hover:text-white"
                >
                  Sponsors
                </Link>
              </nav>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/5"
                >
                  Log Out
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>

      {/* AI Chat Drawer - only show for logged in users */}
      {user && <ChatDrawer />}
    </div>
  );
}
