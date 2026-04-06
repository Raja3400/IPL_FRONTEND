const scoringRows = [
  ["Match winner", "10 points"],
  ["Toss winner", "5 points"],
  ["Highest run scorer", "15 points"],
  ["Highest wicket taker", "15 points"],
  ["Most sixes", "10 points"],
  ["Most fours", "10 points"],
  ["Most catches", "10 points"],
  ["Man of the match", "10 points"],
  ["Best economical bowler", "5 points"],
  ["Best striker", "10 points"]
];

const teamScoreRules = [
  ["Exact match", "25 points"],
  ["Difference <= 5", "20 points"],
  ["Difference <= 10", "15 points"],
  ["Difference <= 20", "10 points"],
  ["Difference <= 30", "5 points"],
  ["Difference > 30", "0 points"]
];

const tiebreakSections = [
  {
    title: "Highest wicket taker",
    points: [
      "Bowler with more wickets wins",
      "If wickets are equal, the bowler with lower economy wins",
      "If still equal, fewer runs conceded gets priority",
      "If still equal, fewer balls bowled gets priority",
      "If still equal, a deterministic fallback is used"
    ]
  },
  {
    title: "Highest run scorer",
    points: [
      "Batter with more runs wins",
      "If runs are equal, higher strike rate wins",
      "If still equal, fewer balls faced gets priority",
      "If still equal, more sixes gets priority",
      "If still equal, more fours gets priority",
      "If still equal, a deterministic fallback is used"
    ]
  },
  {
    title: "Most fours",
    points: [
      "Player with more fours wins",
      "If fours are equal, the player with higher runs wins",
      "If still equal, higher strike rate gets priority",
      "If still equal, more sixes gets priority",
      "If still equal, a deterministic fallback is used"
    ]
  },
  {
    title: "Most sixes",
    points: [
      "Player with more sixes wins",
      "If sixes are equal, the player with higher runs wins",
      "If still equal, higher strike rate gets priority",
      "If still equal, more fours gets priority",
      "If still equal, a deterministic fallback is used"
    ]
  },
  {
    title: "Most catches",
    points: [
      "Player with more catches wins",
      "If catches are equal, the most impactful catch takes priority",
      "The final stored match result is treated as the source of truth"
    ]
  },
  {
    title: "Best economical bowler",
    points: [
      "Bowler with lower economy wins",
      "If economy is equal, more wickets gets priority",
      "If still equal, fewer runs conceded gets priority",
      "If still equal, more balls bowled gets priority",
      "If still equal, a deterministic fallback is used"
    ]
  }
];

export function RulesPage() {
  return (
    <div className="stack">
      <section className="card rules-hero">
        <div className="pill">Scoring Guide</div>
        <h1 className="page-title">Prediction Rules &amp; Scoring</h1>
        <p className="muted rules-hero__copy">
          This page explains how match predictions are evaluated and how points are awarded. After a match result is
          finalized, the system compares the actual stored outcome with your submitted prediction and calculates your
          score from those final values.
        </p>
      </section>

      <section className="rules-layout">
        <article className="card rules-card">
          <div className="rules-card__header">
            <h2 className="section-title">Points Table</h2>
            <p className="muted">
              Each prediction category awards fixed points. Team score predictions use a difference-based scale.
            </p>
          </div>

          <div className="rules-table">
            <div className="rules-table__header">
              <span>Prediction item</span>
              <span>Points</span>
            </div>
            {scoringRows.map(([label, value]) => (
              <div key={label} className="rules-table__row">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="rules-score-grid">
            <div className="rules-score-card">
              <h3 className="rules-score-card__title">Team 1 score</h3>
              <div className="rules-mini-table">
                {teamScoreRules.map(([label, value]) => (
                  <div key={`team1-${label}`} className="rules-mini-table__row">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="rules-score-card">
              <h3 className="rules-score-card__title">Team 2 score</h3>
              <div className="rules-mini-table">
                {teamScoreRules.map(([label, value]) => (
                  <div key={`team2-${label}`} className="rules-mini-table__row">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="inline-summary inline-summary--success">
            <span className="admin-result-card__eyebrow">Combined score rule</span>
            <strong>Total team score prediction points = Team 1 score points + Team 2 score points</strong>
          </div>
        </article>

        <article className="card rules-card">
          <div className="rules-card__header">
            <h2 className="section-title">Tie-Break Rules For Actual Match Outcomes</h2>
            <p className="muted">
              These rules explain how the final stored result is resolved when multiple players are tied in a category.
            </p>
          </div>

          <div className="rules-accordion-list">
            {tiebreakSections.map((section) => (
              <details key={section.title} className="rules-accordion" open>
                <summary className="rules-accordion__summary">{section.title}</summary>
                <ul className="list rules-accordion__list">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </article>
      </section>

      <section className="card rules-note">
        <span className="pill">Final Result Note</span>
        <p className="muted">
          Final result values stored by the system are treated as the source of truth for scoring. Once the official
          match result is finalized, user predictions are compared against those final values.
        </p>
      </section>
    </div>
  );
}
