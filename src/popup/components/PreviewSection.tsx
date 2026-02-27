interface Props {
  imageUrl: string;
  onParse: () => void;
  onBack: () => void;
}

export function PreviewSection({ imageUrl, onParse, onBack }: Props) {
  return (
    <section className="section">
      <h2>Screenshot Preview</h2>

      <img
        className="preview-image"
        src={imageUrl}
        alt="Screenshot preview"
      />

      <div className="btn-row">
        <button className="btn btn-primary" onClick={onParse}>
          Analyze with AI
        </button>
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
      </div>
    </section>
  );
}
