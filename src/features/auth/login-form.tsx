"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import { loginSchema } from "@/lib/validation/auth";
import { FormMessage } from "./form-message";

type LoginResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

function getLoginErrorMessage(code: string | undefined, serverMessage: string | undefined, status: number) {
  if (code === "email_not_verified") {
    return "Seu e-mail ainda não foi confirmado. Confira sua caixa de entrada e a pasta de spam. Se não encontrar a mensagem, use “Esqueci minha senha” abaixo para receber novas instruções.";
  }
  if (code === "google_not_configured") {
    return "O login com Google está temporariamente indisponível. Entre com seu e-mail e senha ou tente novamente mais tarde.";
  }
  if (code?.startsWith("google_") || code === "auth_not_configured") {
    return "Não foi possível concluir o login com Google. Tente novamente ou entre com seu e-mail e senha.";
  }
  if (status >= 500) {
    return "O Guido está temporariamente indisponível. Tente novamente em alguns instantes.";
  }
  return serverMessage ?? "Não foi possível entrar. Confira os dados e tente novamente.";
}

function getLoginQueryMessage(errorCode: string | null) {
  switch (errorCode) {
    case "google_not_configured":
      return "O login com Google está temporariamente indisponível. Entre com seu e-mail e senha ou tente novamente mais tarde.";
    case "email_not_verified":
      return "Seu e-mail ainda não foi confirmado. Confira sua caixa de entrada e a pasta de spam. Se não encontrar a mensagem, use “Esqueci minha senha” abaixo para receber novas instruções.";
    case "invalid_oauth_state":
    case "expired_oauth_state":
      return "A tentativa de login com Google expirou. Tente novamente.";
    case "google_exchange_failed":
    case "google_token_missing":
    case "google_identity_invalid":
    case "google":
      return "Não foi possível concluir o login com Google. Tente novamente ou entre com seu e-mail e senha.";
    case "verificacao":
      return "Não foi possível confirmar esse e-mail. O link pode ter expirado ou já ter sido usado.";
    default:
      return errorCode ? "Não foi possível concluir o login. Tente novamente ou entre com seu e-mail e senha." : "";
  }
}

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [focusGlobalError, setFocusGlobalError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const formRef = useRef<HTMLFormElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const globalMessageRef = useRef<HTMLParagraphElement>(null);
  const rateLimitRef = useRef<HTMLDivElement>(null);
  const googleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("erro");
    const verified = params.get("verificado") === "1";
    const queryMessage = getLoginQueryMessage(errorCode);
    const timer = window.setTimeout(() => {
      if (queryMessage) {
        setMessage(queryMessage);
        setSuccess(false);
        setFocusGlobalError(true);
      } else if (verified) {
        setMessage("E-mail confirmado. Agora você já pode entrar no Guido.");
        setSuccess(true);
      }
    }, 0);

    if (errorCode || verified) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!focusGlobalError || (!message && !rateLimited)) return;
    const target = rateLimited ? rateLimitRef.current : globalMessageRef.current;
    target?.focus();
  }, [focusGlobalError, message, rateLimited]);

  useEffect(() => {
    return () => {
      if (googleTimeoutRef.current !== null) window.clearTimeout(googleTimeoutRef.current);
    };
  }, []);

  const validateEmail = (value: string) => {
    const result = loginSchema.shape.email.safeParse(value);
    return result.success ? undefined : result.error.issues[0]?.message ?? "Digite um e-mail válido.";
  };

  const validatePassword = (value: string) => {
    const result = loginSchema.shape.password.safeParse(value);
    return result.success ? undefined : result.error.issues[0]?.message ?? "A senha deve ter pelo menos 8 caracteres.";
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setMessage("");
    setCanRetry(false);
    if (emailTouched) {
      setFieldErrors((current) => ({ ...current, email: validateEmail(value) }));
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setFieldErrors((current) => ({ ...current, email: validateEmail(email) }));
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassword(value);
    setMessage("");
    setCanRetry(false);
    if (passwordTouched) {
      setFieldErrors((current) => ({ ...current, password: validatePassword(value) }));
    } else {
      setFieldErrors((current) => ({ ...current, password: undefined }));
    }
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setFieldErrors((current) => ({ ...current, password: validatePassword(password) }));
  };

  const handleGoogleLogin = (event: MouseEvent<HTMLAnchorElement>) => {
    if (googleLoading || submitting) {
      event.preventDefault();
      return;
    }
    setGoogleLoading(true);
    if (googleTimeoutRef.current !== null) window.clearTimeout(googleTimeoutRef.current);
    googleTimeoutRef.current = window.setTimeout(() => {
      setGoogleLoading(false);
      setMessage("Não foi possível abrir o login com Google. Tente novamente ou entre com seu e-mail e senha.");
      setSuccess(false);
      setFocusGlobalError(true);
    }, 8_000);
  };

  const handleRetry = () => {
    setCanRetry(false);
    formRef.current?.requestSubmit();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || googleLoading) return;

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const nextFieldErrors = {
        email: errors.email?.[0],
        password: errors.password?.[0],
      };
      setEmailTouched(true);
      setFieldErrors(nextFieldErrors);
      setRateLimited(false);
      setSuccess(false);
      setMessage("");
      setCanRetry(false);
      if (nextFieldErrors.email) emailInputRef.current?.focus();
      else if (nextFieldErrors.password) passwordInputRef.current?.focus();
      return;
    }

    setFieldErrors({});
    setRateLimited(false);
    setMessage("");
    setCanRetry(false);
    setSubmitting(true);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: controller.signal,
      });

      let body: LoginResponse = {};
      const contentType = response.headers.get("content-type") ?? "";
      let validJson = false;
      if (contentType.includes("application/json")) {
        try {
          const parsedBody: unknown = await response.json();
          if (parsedBody && typeof parsedBody === "object") {
            body = parsedBody as LoginResponse;
            validJson = true;
          }
        } catch {
          validJson = false;
        }
      }

      const wasRateLimited = response.status === 429;
      setRateLimited(wasRateLimited);
      setSuccess(response.ok);

      if (response.ok) {
        setMessage("✓ Entrada realizada com sucesso!");
        router.push("/conta");
        router.refresh();
        return;
      }

      setCanRetry(!wasRateLimited && (response.status >= 500 || !validJson));
      setFocusGlobalError(true);
      setMessage(wasRateLimited ? "" : getLoginErrorMessage(body.error?.code, body.error?.message, response.status));
    } catch (error) {
      setSuccess(false);
      setRateLimited(false);
      setCanRetry(true);
      setFocusGlobalError(true);
      setMessage(error instanceof DOMException && error.name === "AbortError"
        ? "O login demorou mais que o esperado. Verifique sua conexão e tente novamente."
        : "Não foi possível conectar ao Guido. Verifique sua conexão e tente novamente.");
    } finally {
      window.clearTimeout(timeout);
      setSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      className="login-form mt-7"
      noValidate
      onSubmit={handleSubmit}
      aria-busy={submitting || googleLoading}
      aria-describedby={rateLimited ? "login-rate-limit" : message && !success ? "login-form-message" : undefined}
    >
      <label htmlFor="email" className="block font-bold mb-2">E-mail</label>
      <input
        id="email"
        ref={emailInputRef}
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={handleEmailChange}
        onBlur={handleEmailBlur}
        aria-required="true"
        aria-invalid={Boolean(fieldErrors.email)}
        aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
        placeholder="seu@email.com"
        className="glass-control mt-2 min-h-14 w-full px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      {fieldErrors.email && (
        <p id="login-email-error" className="login-field-error mt-1" role="alert">{fieldErrors.email}</p>
      )}

      <label htmlFor="password" className="mt-5 block font-bold mb-2">Senha</label>
      <div className="login-password-field relative mt-2">
        <input
          id="password"
          ref={passwordInputRef}
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={handlePasswordChange}
          onBlur={handlePasswordBlur}
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
          placeholder="••••••••"
          className="glass-control min-h-14 w-full px-4 py-3 pr-28 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="button"
          className="login-password-toggle absolute right-2 top-1/2 min-h-11 -translate-y-1/2 px-3 text-sm font-bold"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={showPassword}
          onClick={() => setShowPassword((current) => !current)}
        >
          {showPassword ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {fieldErrors.password && (
        <p id="login-password-error" className="login-field-error mt-1" role="alert">{fieldErrors.password}</p>
      )}

      <button
        type="submit"
        disabled={submitting || googleLoading}
        className="primary-action mt-7 min-h-14 w-full px-5 py-3 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98] transition-all"
      >
        {submitting ? "Entrando…" : "Entrar"}
      </button>

      <div className="login-method-divider" role="separator" aria-label="ou">
        <span>ou</span>
      </div>

      <a
        href="/api/auth/google/start?next=%2Fconta"
        aria-busy={googleLoading || submitting}
        aria-disabled={googleLoading || submitting}
        onClick={handleGoogleLogin}
        className={`secondary-action login-google-action flex min-h-14 w-full items-center justify-center gap-3 px-5 py-3 text-lg font-bold ${googleLoading || submitting ? "pointer-events-none cursor-wait opacity-60" : ""}`}
      >
        {googleLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span aria-hidden="true" className="login-spinner h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Abrindo Google…
          </span>
        ) : (
          <>
            <svg aria-hidden="true" className="login-google-icon h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M21.805 12.23c0-.79-.064-1.55-.2-2.28H12v4.31h5.5a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.045-4.4 3.045-7.67Z" fill="#4285F4" />
              <path d="M12 22c2.76 0 5.08-.91 6.76-2.47l-3.3-2.56c-.91.61-2.07.97-3.46.97-2.66 0-4.92-1.8-5.73-4.22H2.86v2.64A10.2 10.2 0 0 0 12 22Z" fill="#34A853" />
              <path d="M6.27 13.72A6.13 6.13 0 0 1 5.95 12c0-.6.11-1.19.32-1.72V7.64H2.86A10 10 0 0 0 1.8 12c0 1.61.39 3.13 1.06 4.36l3.41-2.64Z" fill="#FBBC05" />
              <path d="M12 6.06c1.5 0 2.84.52 3.9 1.54l2.92-2.92C17.08 3.07 14.76 2 12 2a10.2 10.2 0 0 0-9.14 5.64l3.41 2.64C7.08 7.86 9.34 6.06 12 6.06Z" fill="#EA4335" />
            </svg>
            Continuar com Google
          </>
        )}
      </a>

      {rateLimited && (
        <div id="login-rate-limit" ref={rateLimitRef} className="login-rate-limit" role="alert" aria-live="assertive" aria-atomic="true" tabIndex={-1}>
          <strong>Muitas tentativas em pouco tempo.</strong>
          <span>Aguarde alguns minutos antes de tentar novamente. Você também pode tentar entrar com Google, se essa opção estiver disponível.</span>
        </div>
      )}

      <FormMessage ref={globalMessageRef} id="login-form-message" message={message} type={success ? "success" : "error"} />

      {canRetry && (
        <button type="button" className="login-retry-action min-h-12 px-5 py-3 font-bold" onClick={handleRetry}>
          Tentar novamente
        </button>
      )}

      <nav className="login-support-links" aria-label="Ajuda com acesso">
        <Link
          href="/recuperar-senha"
          className="login-support-link login-support-link--recovery inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 font-bold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Esqueci minha senha
        </Link>
        <p className="login-signup-prompt">
          Ainda não tem uma conta? <Link href="/cadastro" className="login-signup-link">Criar conta</Link>
        </p>
      </nav>
    </form>
  );
}
