export default function Login() {
  const handleLogin = () => {
    window.location.href = '/api/auth/github';
  };

  return (
    <div className="grain min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-muted mb-4">A quiet place</p>
          <h1 className="font-display text-6xl md:text-7xl font-medium leading-[0.95] tracking-tight">
            Keep<span className="text-accent italic">sake</span>.
          </h1>
          <p className="mt-6 text-muted max-w-sm mx-auto leading-relaxed">
            For the thoughts you don't want to lose, and the ones you might.
          </p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full group relative overflow-hidden rounded-xl bg-ink text-paper py-4 px-6 font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            Continue with GitHub
          </span>
        </button>

        <p className="mt-8 text-xs text-center text-muted">
          By continuing, you agree to keep your notes intentional.
        </p>
      </div>
    </div>
  );
}
