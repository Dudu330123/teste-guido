export function FormMessage({ message, type }: { message: string; type: "error" | "success" }) {
  if (!message) return null;
  return (
    <p
      role={type === "error" ? "alert" : "status"}
      className={`mt-5 rounded-xl p-4 font-semibold ${type === "error" ? "notice-danger" : "notice-success"}`}
    >
      {message}
    </p>
  );
}
