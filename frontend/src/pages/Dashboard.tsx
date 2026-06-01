import React, { useState, useEffect } from 'react';
import { fetchLinks, LinkData, CreateLinkResponse } from '../utils/api';
import { CreateForm } from '../components/CreateForm';
import { LinkCard } from '../components/LinkCard';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchLinks();
      setLinks(data);
    } catch (error: any) {
      // If no token, start fresh
      if (error.code !== 'NO_TOKEN') {
        setError(error.message || 'Failed to load links');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLinkCreated = (newLink: CreateLinkResponse) => {
    setSuccessMessage(`Short link created: ${newLink.short_code}`);
    setTimeout(() => setSuccessMessage(null), 3000);
    loadLinks();
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="dashboard">
      <div className="container">
        <h1 className="dashboard-title">Shortify</h1>

        {error && <div className="error-banner">{error}</div>}
        {successMessage && <div className="success-banner">{successMessage}</div>}

        <CreateForm onLinkCreated={handleLinkCreated} onError={handleError} />

        <div className="links-section">
          <h2 className="section-title">Your Links</h2>

          {loading ? (
            <div className="loading-state">
              <p>Loading your links...</p>
            </div>
          ) : links.length === 0 ? (
            <div className="empty-state">
              <p>No short links yet. Create one above to get started!</p>
            </div>
          ) : (
            <div className="links-list">
              {links.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
