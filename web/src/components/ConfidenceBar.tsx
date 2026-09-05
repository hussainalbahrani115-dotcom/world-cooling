export function ConfidenceBar({ confidenceScore }: { confidenceScore: number }) {
  const percent = Math.round(Math.min(1, Math.max(0, confidenceScore)) * 100);
  return (
    <div className="confidence-bar">
      <div className="confidence-bar-label">
        <span>نسبة الثقة في التشخيص</span>
        <strong>{percent}%</strong>
      </div>
      <div className="confidence-bar-track">
        <div className="confidence-bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
