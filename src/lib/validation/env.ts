export function getRuntimeConfig() {
  return {
    databaseConfigured: Boolean(process.env.DATABASE_URL?.trim()),
    googleConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI),
  };
}
