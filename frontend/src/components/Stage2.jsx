import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './Stage2.css';

function getModelDisplayName(model) {
  if (!model) return 'Unknown';
  const parts = model.split('/');
  return parts.length > 1 ? parts[1] : model;
}

function deAnonymizeText(text, labelToModel) {
  if (!labelToModel || !text) return text || '';

  let result = text;
  Object.entries(labelToModel).forEach(([label, model]) => {
    const modelShortName = getModelDisplayName(model);
    result = result.replace(new RegExp(label, 'g'), `**${modelShortName}**`);
  });
  return result;
}

export default function Stage2({ rankings, labelToModel, aggregateRankings, hasError }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!rankings) {
    return null;
  }

  const validRankings = rankings.filter(rank => rank && rank.model);
  
  if (validRankings.length === 0) {
    if (!hasError && rankings.length === 0) {
      return null;
    }
    return (
      <div className="stage stage2 error-state">
        <h3 className="stage-title">Stage 2: Peer Rankings</h3>
        <div className="stage-error">
          No ranking data available. Models may have failed during the ranking phase.
        </div>
      </div>
    );
  }

  const safeActiveTab = Math.min(activeTab, validRankings.length - 1);

  return (
    <div className="stage stage2">
      <h3 className="stage-title">Stage 2: Peer Rankings</h3>

      <h4>Raw Evaluations</h4>
      <p className="stage-description">
        Each model evaluated all responses (anonymized as Response A, B, C, etc.) and provided rankings.
        Below, model names are shown in <strong>bold</strong> for readability, but the original evaluation used anonymous labels.
      </p>

      <div className="tabs">
        {validRankings.map((rank, index) => (
          <button
            key={index}
            className={`tab ${safeActiveTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {getModelDisplayName(rank.model)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        <div className="ranking-model">
          {validRankings[safeActiveTab]?.model || 'Unknown'}
        </div>
        <div className="ranking-content markdown-content">
          <ReactMarkdown>
            {deAnonymizeText(validRankings[safeActiveTab]?.ranking, labelToModel)}
          </ReactMarkdown>
        </div>

        {validRankings[safeActiveTab]?.parsed_ranking &&
         validRankings[safeActiveTab].parsed_ranking.length > 0 && (
          <div className="parsed-ranking">
            <strong>Extracted Ranking:</strong>
            <ol>
              {validRankings[safeActiveTab].parsed_ranking.map((label, i) => (
                <li key={i}>
                  {labelToModel && labelToModel[label]
                    ? getModelDisplayName(labelToModel[label])
                    : label}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {aggregateRankings && aggregateRankings.length > 0 && (
        <div className="aggregate-rankings">
          <h4>Aggregate Rankings (Street Cred)</h4>
          <p className="stage-description">
            Combined results across all peer evaluations (lower score is better):
          </p>
          <div className="aggregate-list">
            {aggregateRankings.map((agg, index) => (
              <div key={index} className="aggregate-item">
                <span className="rank-position">#{index + 1}</span>
                <span className="rank-model">
                  {getModelDisplayName(agg?.model)}
                </span>
                <span className="rank-score">
                  Avg: {agg?.average_rank?.toFixed(2) || 'N/A'}
                </span>
                <span className="rank-count">
                  ({agg?.rankings_count || 0} votes)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
