export function AmbientBackground({ variant = 'app' }: { variant?: 'app' | 'auth' }) {
  return (
    <div className={`ambient-background ambient-background--${variant}`} aria-hidden="true">
      {variant === 'auth' && (
        <div className="auth-color-bends">
          <div className="auth-color-bends__ribbon auth-color-bends__ribbon--violet" />
          <div className="auth-color-bends__ribbon auth-color-bends__ribbon--fuchsia" />
          <div className="auth-color-bends__ribbon auth-color-bends__ribbon--blue" />
        </div>
      )}
      <div className="ambient-grid" />
      <div className="ambient-orb ambient-orb--violet" />
      <div className="ambient-orb ambient-orb--fuchsia" />
      <div className="ambient-orb ambient-orb--blue" />
      <div className="ambient-shine" />
    </div>
  );
}
