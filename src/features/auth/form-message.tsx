import { forwardRef } from "react";

type FormMessageProps = {
  message: string;
  type: "error" | "success";
  id?: string;
};

export const FormMessage = forwardRef<HTMLParagraphElement, FormMessageProps>(function FormMessage({ message, type, id }, ref) {
  if (!message) return null;
  return (
    <p
      id={id}
      ref={ref}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      tabIndex={type === "error" ? -1 : undefined}
      className={`login-form-message mt-5 rounded-xl p-4 font-semibold ${type === "error" ? "notice-danger" : "notice-success"}`}
    >
      {message}
    </p>
  );
});
