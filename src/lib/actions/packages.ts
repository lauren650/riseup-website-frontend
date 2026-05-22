"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PackageRow = {
  id: string;
  name: string;
  cost: number;
  total_slots: number;
  available_slots: number;
  closing_date: string | null;
  description: string | null;
};

export type UpdatePackageInput = {
  cost?: number;
  total_slots?: number;
  available_slots?: number;
};

/**
 * Fetches all packages with slot info for the Partner Dashboard.
 */
export async function getPackagesForDashboard(): Promise<{
  packages: PackageRow[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sponsorship_packages")
    .select("id, name, cost, total_slots, available_slots, closing_date, description")
    .order("cost", { ascending: true });

  if (error) {
    console.error("Failed to fetch packages:", error);
    return { packages: [], error: error.message };
  }
  return { packages: (data ?? []) as PackageRow[], error: null };
}

/**
 * Updates a package's cost and/or slot counts. Validates available_slots <= total_slots.
 */
export async function updatePackage(
  packageId: string,
  input: UpdatePackageInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be signed in to update packages." };
  }

  const updates: Record<string, number> = {};

  if (input.cost !== undefined) {
    if (typeof input.cost !== "number" || input.cost < 1) {
      return { success: false, error: "Cost must be at least 1." };
    }
    updates.cost = Math.round(input.cost);
  }

  if (input.total_slots !== undefined) {
    if (typeof input.total_slots !== "number" || input.total_slots < 0) {
      return { success: false, error: "Total slots cannot be negative." };
    }
    updates.total_slots = input.total_slots;
  }

  if (input.available_slots !== undefined) {
    if (typeof input.available_slots !== "number" || input.available_slots < 0) {
      return { success: false, error: "Available slots cannot be negative." };
    }
    updates.available_slots = input.available_slots;
  }

  if (Object.keys(updates).length === 0) {
    return { success: true };
  }

  if (updates.total_slots !== undefined && updates.available_slots === undefined) {
    const { data: current } = await supabase
      .from("sponsorship_packages")
      .select("available_slots")
      .eq("id", packageId)
      .single();
    if (current && current.available_slots > updates.total_slots) {
      updates.available_slots = updates.total_slots;
    }
  }

  if (updates.available_slots !== undefined && updates.total_slots === undefined) {
    const { data: current } = await supabase
      .from("sponsorship_packages")
      .select("total_slots")
      .eq("id", packageId)
      .single();
    if (current && updates.available_slots > current.total_slots) {
      updates.total_slots = updates.available_slots;
    }
  }

  if (updates.available_slots !== undefined && updates.total_slots !== undefined) {
    if (updates.available_slots > updates.total_slots) {
      return { success: false, error: "Available slots cannot exceed total slots." };
    }
  }

  const { error } = await supabase
    .from("sponsorship_packages")
    .update(updates)
    .eq("id", packageId);

  if (error) {
    console.error("updatePackage error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/partners");
  revalidatePath("/admin/dashboard/invoices");
  return { success: true };
}
