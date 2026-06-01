import React, { useState } from 'react';
import { createShortLink, CreateLinkResponse } from '../utils/api';
import './CreateForm.css';

interface CreateFormProps {
  onLinkCreated: (link: CreateLinkResponse) => void;
  onError: (error: string) => void;
}

export const CreateForm: React.FC<CreateFormProps> = ({ onLinkCreated, onError }) => {
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetUrl.trim()) {
      onError('Please enter a URL');
      return;
    }

    // Basic URL validation
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      onError('URL must start with http:// or https://');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const link = await createShortLink(targetUrl);
      onLinkCreated(link);
      setTargetUrl('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      onError(error.message || 'Failed to create short link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-form card" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="target-url">Enter Long URL</label>
        <input
          id="target-url"
          type="url"
          placeholder="https://example.com/very/long/url"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !targetUrl.trim()}
        className={`btn-submit ${loading ? 'loading' : ''}`}
      >
        {loading ? 'Creating...' : 'Shorten URL'}
      </button>

      {success && <div className="success-message">✓ Link created successfully!</div>}
    </form>
  );
};
