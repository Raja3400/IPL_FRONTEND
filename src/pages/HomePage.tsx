import { Link } from "react-router-dom";
import React, { useRef, useState } from "react";

function TiltWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setRx(rotateX);
    setRy(rotateY);
  };

  const handleMouseLeave = () => {
    setRx(0);
    setRy(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
        transition: "transform 0.1s ease-out"
      }}
      className={className}
    >
      <div
        style={{
          transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
          transition: rx === 0 ? "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)" : "none",
          height: "100%"
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <section className="stack">
      <div className="hero">
        <TiltWrapper>
          <article className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                top: "-50%",
                right: "-30%",
                width: "100%",
                height: "150%",
                background: "radial-gradient(circle, rgba(0, 229, 255, 0.1) 0%, transparent 60%)",
                zIndex: 0,
                pointerEvents: "none"
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <p className="pill">IPL 2026 Predictions</p>
              <h1 className="hero__headline">
                Predict the <span className="hero__accent">Future of IPL</span> and Conquer the Leaderboard.
              </h1>
              <p className="muted" style={{ margin: "1.5rem 0" }}>
                Join the ultimate predictive tournament. Use your cricket intuition to predict
                match outcomes, highest scorers, and milestones. Compete in real-time.
              </p>

              <div className="grid">
                <div className="stat">
                  <div className="stat__label">Live Teams</div>
                  <div className="stat__value">10</div>
                </div>
                <div className="stat">
                  <div className="stat__label">Star Players</div>
                  <div className="stat__value">173+</div>
                </div>
                <div className="stat">
                  <div className="stat__label">Epic Matches</div>
                  <div className="stat__value">70</div>
                </div>
              </div>

              <div className="cta-row">
                <Link to="/matches" className="button-link button-link--primary" style={{ padding: "1.2rem 2.5rem", fontSize: "1.1rem" }}>
                  Enter Arena
                </Link>
                <Link to="/leaderboard/tournament" className="button-link button-link--ghost">
                  Tournament Rankings
                </Link>
              </div>
            </div>
          </article>
        </TiltWrapper>

        <aside className="status-card">
          <div className="status-card__label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "var(--brand-accent)",
                boxShadow: "0 0 10px var(--brand-accent)",
                display: "inline-block",
                animation: "pulse-neon 2s infinite"
              }}
            ></span>
            Platform Status
          </div>
          <p className="status-card__value">Season 2026 predictions are officially open.</p>
          <ul className="list">
            <li>Make strategic match predictions before the toss.</li>
            <li>Earn points based on match accuracy and milestones.</li>
            <li>Climb the global tournament leaderboard.</li>
            <li>All squads and fixtures correctly seeded.</li>
          </ul>

          <div style={{ marginTop: "2rem", padding: "1.5rem", background: "rgba(0,0,0,0.3)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem", fontWeight: 700 }}>
              Next Battle
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>You <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0.5rem" }}>VS</span> World</div>
              <Link to="/matches" style={{ fontSize: "0.85rem", color: "var(--brand-primary)", textDecoration: "underline" }}>Predict Now</Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

