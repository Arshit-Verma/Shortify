import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { copyToClipboard } from '../utils/api';
import './LinkCard.css';
export const LinkCard = ({ link }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        try {
            await copyToClipboard(link.short_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch (error) {
            console.error('Failed to copy:', error);
        }
    };
    const handleOpenLink = () => {
        window.open(link.short_url, '_blank');
    };
    const truncateUrl = (url, maxLength = 50) => {
        if (url.length <= maxLength)
            return url;
        return url.substring(0, maxLength) + '...';
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    return (_jsxs("div", { className: "link-card card", children: [_jsxs("div", { className: "link-card-header", children: [_jsxs("div", { className: "link-info", children: [_jsx("div", { className: "short-code-display", children: _jsx("span", { className: "short-code", children: link.short_code }) }), _jsxs("div", { className: "url-info", children: [_jsx("a", { href: link.short_url, target: "_blank", rel: "noopener noreferrer", className: "short-url", children: truncateUrl(link.short_url, 40) }), _jsxs("p", { className: "target-url", title: link.target_url, children: ["\u2192 ", truncateUrl(link.target_url, 60)] })] })] }), _jsxs("div", { className: "click-count", children: [_jsx("div", { className: "count-number", children: link.click_count }), _jsx("div", { className: "count-label", children: "clicks" })] })] }), _jsxs("div", { className: "link-card-footer", children: [_jsxs("div", { className: "date-info", children: [_jsxs("small", { className: "created-date", children: ["Created: ", formatDate(link.created_at)] }), link.last_click_at && (_jsxs("small", { className: "last-click-date", children: ["Last click: ", formatDate(link.last_click_at)] }))] }), _jsxs("div", { className: "link-actions", children: [_jsx("button", { className: "btn-copy", onClick: handleCopy, title: copied ? 'Copied!' : 'Copy to clipboard', children: copied ? '✓ Copied' : 'Copy' }), _jsx("button", { className: "btn-open", onClick: handleOpenLink, title: "Open link", children: "Open" })] })] })] }));
};
