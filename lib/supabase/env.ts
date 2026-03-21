export function hasPublicSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getEventSlug() {
  return process.env.NEXT_PUBLIC_EVENT_SLUG || "demo-event";
}
