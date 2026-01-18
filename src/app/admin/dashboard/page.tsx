import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get pending sponsor count
  const { count: pendingCount } = await supabase
    .from("sponsors")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // Get approved sponsor count
  const { count: approvedCount } = await supabase
    .from("sponsors")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Dashboard</h1>
      <p className="mb-8 text-muted-foreground">
        Welcome back, {user?.email || "Admin"}
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Pending Sponsors Card */}
        <Link
          href="/admin/dashboard/sponsors"
          className="group rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-accent/50 hover:bg-white/10"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Pending Sponsors
            </h2>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-400">
              {pendingCount || 0}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Sponsor submissions awaiting approval
          </p>
          <div className="mt-4 text-sm text-accent group-hover:underline">
            View all &rarr;
          </div>
        </Link>

        {/* Approved Sponsors Card */}
        <Link
          href="/admin/dashboard/sponsors"
          className="group rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-accent/50 hover:bg-white/10"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Approved Sponsors
            </h2>
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
              {approvedCount || 0}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Sponsors displayed on Partners page
          </p>
          <div className="mt-4 text-sm text-accent group-hover:underline">
            View all &rarr;
          </div>
        </Link>

        {/* Quick Links Card */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-accent"
              >
                View Public Site &rarr;
              </a>
            </li>
            <li>
              <a
                href="/partners"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-accent"
              >
                Partners Page &rarr;
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
