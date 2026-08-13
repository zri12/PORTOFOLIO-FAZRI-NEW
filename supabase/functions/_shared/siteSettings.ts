export async function requirePublicFeature(
  supabase: { from: (table: string) => { select: (columns: string) => { eq: (column: string, value: string) => { maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: unknown }> } } } },
  feature: "contact_enabled" | "comments_enabled",
) {
  const { data, error } = await supabase.from("site_settings").select(feature).eq("singleton_key", "default").maybeSingle();
  if (error) throw error;
  if (!data || data[feature] !== true) throw new Error("This feature is currently disabled.");
}
