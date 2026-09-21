"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/auth";
import { FormMessage } from "./form-message";
import { SocialAuthButtons } from "./social-auth-buttons";

function getLoginErrorMessage(code: string | undefined, status: number | undefined) {
  if (code === "email_not_confirmed") {
    return "Seu e-mail ainda não foi confirmado. Confira sua caixa de entrada e a pasta de spam. Se não encontrar a mensagem, use “Esqueci minha senha” abaixo para receber novas instruções.";
  }
  if (status === 429 || code === "over_request_rate_limit") {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }
  if (status && status >= 500) {
    return "O Guido está temporariamente indisponível. Tente novamente em alguns instantes.";
  }
  return "Não foi possível entrar. Confira o e-mail e a senha e tente novamente.";
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

  const handleRetry = () => {
    setCanRetry(false);
    formRef.current?.requestSubmit();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

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

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("supabase_not_configured");
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      const wasRateLimited = error?.status === 429 || error?.code === "over_request_rate_limit";
      setRateLimited(wasRateLimited);
      setSuccess(!error);

      if (!error) {
        setMessage("✓ Entrada realizada com sucesso!");
        router.push("/conta");
        router.refresh();
        return;
      }

      setCanRetry(!wasRateLimited && Boolean(error.status && error.status >= 500));
      setFocusGlobalError(true);
      setMessage(wasRateLimited ? "" : getLoginErrorMessage(error.code, error.status));
    } catch (error) {
      setSuccess(false);
      setRateLimited(false);
      setCanRetry(true);
      setFocusGlobalError(true);
      setMessage(error instanceof Error && error.message === "supabase_not_configured"
        ? "O login ainda não está configurado neste ambiente."
        : "Não foi possível conectar ao Guido. Verifique sua conexão e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      className="login-form mt-7"
      noValidate
      onSubmit={handleSubmit}
      aria-busy={submitting}
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
          className="glass-control min-h-14 w-full px-4 py-3 pr-16 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="button"
          className="login-password-toggle absolute right-2 top-1/2 -translate-y-1/2"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={showPassword}
          onClick={() => setShowPassword((current) => !current)}
        >
          {showPassword ? (
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.3A10.8 10.8 0 0 1 12 4c5.2 0 9 4.4 10 8a13.8 13.8 0 0 1-2.3 4.3M6.6 6.6A13.4 13.4 0 0 0 2 12c1 3.6 4.8 8 10 8 1.5 0 2.8-.3 4-.8" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {fieldErrors.password && (
        <p id="login-password-error" className="login-field-error mt-1" role="alert">{fieldErrors.password}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="primary-action mt-7 min-h-14 w-full px-5 py-3 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98] transition-all"
      >
        {submitting ? "Entrando…" : "Entrar"}
      </button>

      <div className="login-method-divider" role="separator" aria-label="ou">
        <span>ou</span>
      </div>

      <SocialAuthButtons disabled={submitting} />

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
