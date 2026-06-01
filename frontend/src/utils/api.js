const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:4000";
/**
 * Get owner token from localStorage or null
 */
function getOwnerToken() {
    return localStorage.getItem("owner_token");
}
/**
 * Set owner token in localStorage
 */
function setOwnerToken(token) {
    localStorage.setItem("owner_token", token);
}
/**
 * Create a short link
 */
export async function createShortLink(targetUrl) {
    const ownerToken = getOwnerToken();
    const response = await fetch(`${API_BASE_URL}/api/shorten`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(ownerToken ? { "X-Owner-Token": ownerToken } : {}),
        },
        body: JSON.stringify({ target_url: targetUrl }),
    });
    // Check if a new owner token was issued
    const newToken = response.headers.get("X-Owner-Token");
    if (newToken && !ownerToken) {
        setOwnerToken(newToken);
    }
    if (!response.ok) {
        const error = (await response.json());
        throw error;
    }
    return (await response.json());
}
/**
 * Fetch all short links for the current user
 */
export async function fetchLinks() {
    const ownerToken = getOwnerToken();
    if (!ownerToken) {
        throw { code: "NO_TOKEN", message: "No owner token found" };
    }
    const response = await fetch(`${API_BASE_URL}/api/links`, {
        method: "GET",
        headers: {
            "X-Owner-Token": ownerToken,
        },
    });
    if (!response.ok) {
        const error = (await response.json());
        throw error;
    }
    return (await response.json());
}
/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
    }
    else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
    }
}
/**
 * Delete a short link
 */
export async function deleteShortLink(linkId) {
    const ownerToken = getOwnerToken();
    if (!ownerToken) {
        throw { code: "NO_TOKEN", message: "No owner token found" };
    }
    const response = await fetch(`${API_BASE_URL}/api/links/${linkId}`, {
        method: "DELETE",
        headers: {
            "X-Owner-Token": ownerToken,
        },
    });
    if (!response.ok) {
        const error = (await response.json());
        throw error;
    }
}
