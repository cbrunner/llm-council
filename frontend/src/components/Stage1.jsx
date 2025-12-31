import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './Stage1.css';

function getModelDisplayName(model) {
  if (!model) return 'Unknown';
  const parts = model.split('/');
  return parts.length > 1 ? parts[1] : model;
}

export default function Stage1({ responses, hasError }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!responses) {
    return null;
  }

  const validResponses = responses.filter(resp => resp && resp.model);
  
  if (validResponses.length === 0) {
    if (!hasError && responses.length === 0) {
      return null;
    }
    return (
      <div className="stage stage1 error-state">
        <h3 className="stage-title">Stage 1: Individual Responses</h3>
        <div className="stage-error">
          No model responses available. All models may have failed to respond.
        </div>
      </div>
    );
  }

  const safeActiveTab = Math.min(activeTab, validResponses.length - 1);

  return (
    <div className="stage stage1">
      <h3 className="stage-title">Stage 1: Individual Responses</h3>

      <div className="tabs">
        {validResponses.map((resp, index) => (
          <button
            key={index}
            className={`tab ${safeActiveTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {getModelDisplayName(resp.model)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        <div className="model-name">{validResponses[safeActiveTab]?.model || 'Unknown'}</div>
        <div className="response-text markdown-content">
          <ReactMarkdown>{validResponses[safeActiveTab]?.response || 'No response available'}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
