import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { createShortLink } from '../utils/api';
import './CreateForm.css';
export const CreateForm = ({ onLinkCreated, onError }) => {
    const [targetUrl, setTargetUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const handleSubmit = async (e) => {
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
        }
        catch (error) {
            onError(error.message || 'Failed to create short link');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("form", { className: "create-form card", onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "target-url", children: "Enter Long URL" }), _jsx("input", { id: "target-url", type: "url", placeholder: "https://example.com/very/long/url", value: targetUrl, onChange: (e) => setTargetUrl(e.target.value), disabled: loading })] }), _jsx("button", { type: "submit", disabled: loading || !targetUrl.trim(), className: `btn-submit ${loading ? 'loading' : ''}`, children: loading ? 'Creating...' : 'Shorten URL' }), success && _jsx("div", { className: "success-message", children: "\u2713 Link created successfully!" })] }));
};
