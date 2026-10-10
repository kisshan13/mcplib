import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { BrandMark, Surface } from "@/components/ui";
import { authClient } from "@/lib/auth";

type AuthMode = "login" | "signup";

type AuthFormValues = {
  name?: string;
  email: string;
  password: string;
};

type AuthError = {
  code?: string;
  message?: string;
};

function getAuthErrorMessage(error: unknown, fallback: string): string {
  const authError = error as AuthError | null;

  switch (authError?.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "The email or password is incorrect.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists.";
    case "EMAIL_NOT_VERIFIED":
      return "Please verify your email address before signing in.";
    default:
      return fallback;
  }
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-2 text-xs text-red-300" role="alert">
      {message}
    </p>
  );
}

export function AuthPage() {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const [successMessage, setSuccessMessage] = useState<string>();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<AuthFormValues>({
    shouldUnregister: true,
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  useEffect(() => {
    if (!session.isPending && session.data) {
      void navigate({ to: "/app", replace: true });
    }
  }, [navigate, session.data, session.isPending]);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setSuccessMessage(undefined);
    reset({ name: "", email: "", password: "" });
  }

  const onSubmit = handleSubmit(async (values) => {
    setSuccessMessage(undefined);

    try {
      if (mode === "login") {
        const result = await authClient.signIn.email({
          email: values.email,
          password: values.password,
          callbackURL: "/app"
        });

        if (result.error) {
          setError("root.serverError", {
            message: getAuthErrorMessage(result.error, "Unable to sign in. Please try again.")
          });
          return;
        }

        await navigate({ to: "/app", replace: true });
        return;
      }

      const result = await authClient.signUp.email({
        name: values.name?.trim() ?? "",
        email: values.email,
        password: values.password,
        callbackURL: "/app"
      });

      if (result.error) {
        setError("root.serverError", {
          message: getAuthErrorMessage(result.error, "Unable to create your account.")
        });
        return;
      }

      const currentSession = await authClient.getSession();
      if (currentSession.data) {
        await navigate({ to: "/app", replace: true });
        return;
      }

      setMode("login");
      reset({ name: "", email: values.email, password: "" });
      setSuccessMessage("Your account was created. Sign in to continue.");
    } catch {
      setError("root.serverError", {
        message:
          mode === "login"
            ? "Unable to sign in right now. Check your connection and try again."
            : "Unable to create your account right now. Check your connection and try again."
      });
    }
  });

  if (session.isPending || session.data) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-950 px-6 py-12 text-zinc-100">
        <p className="font-mono text-xs text-zinc-400" role="status">
          {session.data ? "Redirecting..." : "Checking your session..."}
        </p>
      </main>
    );
  }

  const isLogin = mode === "login";

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark size={48} className="mb-4 size-16" />
          <a
            className="font-mono text-sm font-semibold tracking-tight text-white no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            href="/"
          >
            mcplib<span className="text-zinc-500">/</span>
          </a>
          <p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-zinc-500">
            {isLogin ? "Welcome back" : "Create your account"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {isLogin ? "Sign in to MCPLib" : "Start building with MCPLib"}
          </h1>
        </div>

        <Surface className="p-6 sm:p-8">
          <form className="space-y-5" noValidate onSubmit={onSubmit}>
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-zinc-200" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  autoComplete="name"
                  aria-describedby={errors.name ? "name-error" : undefined}
                  aria-invalid={Boolean(errors.name)}
                  className="mt-2 block w-full rounded-md bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none ring-1 ring-inset ring-zinc-700 transition placeholder:text-zinc-500 focus:ring-2 focus:ring-white"
                  placeholder="Your name"
                  {...register("name", {
                    required: "Name is required."
                  })}
                />
                <FieldError id="name-error" message={errors.name?.message} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-200" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={Boolean(errors.email)}
                className="mt-2 block w-full rounded-md bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none ring-1 ring-inset ring-zinc-700 transition placeholder:text-zinc-500 focus:ring-2 focus:ring-white"
                placeholder="you@example.com"
                {...register("email", {
                  required: "Email address is required.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address."
                  }
                })}
              />
              <FieldError id="email-error" message={errors.email?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                aria-describedby={errors.password ? "password-error" : undefined}
                aria-invalid={Boolean(errors.password)}
                className="mt-2 block w-full rounded-md bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none ring-1 ring-inset ring-zinc-700 transition placeholder:text-zinc-500 focus:ring-2 focus:ring-white"
                placeholder="At least 8 characters"
                {...register("password", {
                  required: "Password is required.",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters."
                  }
                })}
              />
              <FieldError id="password-error" message={errors.password?.message} />
            </div>

            {errors.root?.serverError?.message && (
              <p className="rounded-md bg-red-950/60 px-3 py-2.5 text-sm text-red-200" role="alert">
                {errors.root.serverError.message}
              </p>
            )}

            {successMessage && (
              <p className="rounded-md bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200" role="status">
                {successMessage}
              </p>
            )}

            <button
              className="inline-flex w-full items-center justify-center rounded-md bg-white px-4 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : isLogin
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            <span>{isLogin ? "Need an account?" : "Already have an account?"}</span>{" "}
            <button
              className="font-medium text-white underline decoration-zinc-600 underline-offset-4 transition hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              type="button"
              onClick={() => switchMode(isLogin ? "signup" : "login")}
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </div>
        </Surface>
      </div>
    </main>
  );
}
