import ReactMarkdown from 'react-markdown';
import './Stage3.css';

function getModelDisplayName(model) {
  if (!model) return 'Unknown';
  if (model === 'error') return 'Error';
  const parts = model.split('/');
  return parts.length > 1 ? parts[1] : model;
}

export default function Stage3({ finalResponse }) {
  if (!finalResponse) {
    return null;
  }

  const isError = finalResponse.model === 'error';

  return (
    <div className={`stage stage3 ${isError ? 'error-state' : ''}`}>
      <h3 className="stage-title">
        {isError ? 'Council Error' : 'Stage 3: Final Council Answer'}
      </h3>
      <div className={`final-response ${isError ? 'error-response' : ''}`}>
        {!isError && (
          <div className="chairman-label">
            Chairman: {getModelDisplayName(finalResponse.model)}
          </div>
        )}
        <div className="final-text markdown-content">
          <ReactMarkdown>{finalResponse.response || 'No response available'}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
