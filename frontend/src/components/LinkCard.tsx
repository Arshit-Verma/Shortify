import React, { useState } from 'react';
import { LinkData, copyToClipboard } from '../utils/api';
import './LinkCard.css';

interface LinkCardProps {
  link: LinkData;
}

export const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(link.short_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleOpenLink = () => {
    window.open(link.short_url, '_blank');
  };

  const truncateUrl = (url: string, maxLength: number = 50): string => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="link-card card">
      <div className="link-card-header">
        <div className="link-info">
          <div className="short-code-display">
            <span className="short-code">{link.short_code}</span>
          </div>
          <div className="url-info">
            <a href={link.short_url} target="_blank" rel="noopener noreferrer" className="short-url">
              {truncateUrl(link.short_url, 40)}
            </a>
            <p className="target-url" title={link.target_url}>
              → {truncateUrl(link.target_url, 60)}
            </p>
          </div>
        </div>
        <div className="click-count">
          <div className="count-number">{link.click_count}</div>
          <div className="count-label">clicks</div>
        </div>
      </div>

      <div className="link-card-footer">
        <div className="date-info">
          <small className="created-date">Created: {formatDate(link.created_at)}</small>
          {link.last_click_at && (
            <small className="last-click-date">
              Last click: {formatDate(link.last_click_at)}
            </small>
          )}
        </div>
        <div className="link-actions">
          <button
            className="btn-copy"
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button className="btn-open" onClick={handleOpenLink} title="Open link">
            Open
          </button>
        </div>
      </div>
    </div>
  );
};
