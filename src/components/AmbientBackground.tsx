export function AmbientBackground({ variant = 'app' }: { variant?: 'app' | 'auth' }) {
  return (
    <div className={`ambient-background ambient-background--${variant}`} aria-hidden="true">
      <div className="ambient-grid" />
      <div className="ambient-orb ambient-orb--violet" />
      <div className="ambient-orb ambient-orb--fuchsia" />
      <div className="ambient-orb ambient-orb--blue" />
      <div className="ambient-shine" />
    </div>
  );
}
