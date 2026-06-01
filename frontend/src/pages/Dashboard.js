import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { fetchLinks } from "../utils/api";
import { CreateForm } from "../components/CreateForm";
import { LinkCard } from "../components/LinkCard";
import "./Dashboard.css";
export const Dashboard = () => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    useEffect(() => {
        loadLinks();
    }, []);
    const loadLinks = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchLinks();
            setLinks(data);
        }
        catch (error) {
            // If no token, start fresh
            if (error.code !== "NO_TOKEN") {
                setError(error.message || "Failed to load links");
            }
        }
        finally {
            setLoading(false);
        }
    };
    const handleLinkCreated = (newLink) => {
        setSuccessMessage(`Short link created: ${newLink.short_code}`);
        setTimeout(() => setSuccessMessage(null), 3000);
        loadLinks();
    };
    const handleLinkDeleted = (deletedId) => {
        setLinks(links.filter((link) => link.id !== deletedId));
        setSuccessMessage("Link deleted successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
    };
    const handleError = (errorMessage) => {
        setError(errorMessage);
        setTimeout(() => setError(null), 5000);
    };
    return (_jsx("div", { className: "dashboard", children: _jsxs("div", { className: "container", children: [_jsx("h1", { className: "dashboard-title", children: "Shortify" }), error && _jsx("div", { className: "error-banner", children: error }), successMessage && (_jsx("div", { className: "success-banner", children: successMessage })), _jsx(CreateForm, { onLinkCreated: handleLinkCreated, onError: handleError }), _jsxs("div", { className: "links-section", children: [_jsx("h2", { className: "section-title", children: "Your Links" }), loading ? (_jsx("div", { className: "loading-state", children: _jsx("p", { children: "Loading your links..." }) })) : links.length === 0 ? (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "No short links yet. Create one above to get started!" }) })) : (_jsx("div", { className: "links-list", children: links.map((link) => (_jsx(LinkCard, { link: link, onDelete: handleLinkDeleted }, link.id))) }))] })] }) }));
};
