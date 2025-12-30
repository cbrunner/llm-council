import { useState, useEffect } from 'react';
import { api } from '../api';
import './Settings.css';

function Settings({ onClose }) {
  const [settings, setSettings] = useState({ web_search_enabled: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWebSearch = async () => {
    setSaving(true);
    try {
      const newSettings = {
        ...settings,
        web_search_enabled: !settings.web_search_enabled
      };
      await api.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close-btn" onClick={onClose}>Back</button>
        </div>
        <div className="settings-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <button className="settings-close-btn" onClick={onClose}>Back</button>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>Web Search</h3>
          <div className="settings-item">
            <div className="settings-item-info">
              <label htmlFor="web-search-toggle">Enable Web Search</label>
              <p className="settings-description">
                When enabled, the council models can search the web for up-to-date information 
                when answering your questions. This uses OpenRouter's web search feature.
              </p>
              <p className="settings-note">
                Note: Web search incurs additional costs beyond normal API usage.
              </p>
            </div>
            <div className="settings-item-control">
              <button
                id="web-search-toggle"
                className={`toggle-btn ${settings.web_search_enabled ? 'active' : ''}`}
                onClick={handleToggleWebSearch}
                disabled={saving}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
