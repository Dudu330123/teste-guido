export function FormMessage({ message, type }: { message: string; type: "error" | "success" }) {
  if (!message) return null;
  return (
    <p
      role={type === "error" ? "alert" : "status"}
      className={`mt-5 rounded-xl border-2 p-4 font-semibold ${type === "error" ? "border-[var(--danger)] bg-[#fff0f0] text-[#721b1b]" : "border-[var(--primary)] bg-[#e8f5ed]"}`}
    >
      {message}
    </p>
  );
}
