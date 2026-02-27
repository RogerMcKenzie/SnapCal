interface Props {
  message: string;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onRetry: () => void;
}

export function StatusSection({
  message,
  loading,
  error,
  onBack,
  onRetry,
}: Props) {
  return (
    <section className="section">
      {loading && (
        <>
          <div className="spinner" />
          <p className="status-msg">{message}</p>
        </>
      )}

      {error && (
        <div className="error-box">
          <p className="error-msg">{error}</p>
          <div className="btn-row">
            <button className="btn btn-secondary btn-sm" onClick={onRetry}>
              Retry
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onBack}>
              Back
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
