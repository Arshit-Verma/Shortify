import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Hamburger } from './components/Hamburger';
import './App.css';
function App() {
    const [menuOpen, setMenuOpen] = useState(false);
    return (_jsxs("div", { className: "app", children: [_jsx("header", { className: "app-header", children: _jsxs("div", { className: "header-content", children: [_jsx("div", { className: "logo", children: "Shortify" }), _jsx(Hamburger, { onClick: () => setMenuOpen(!menuOpen), isOpen: menuOpen })] }) }), _jsx("main", { children: _jsx(Dashboard, {}) }), _jsx("footer", { className: "app-footer", children: _jsx("p", { children: "\u00A9 2024 Shortify. Built with React & Node.js" }) })] }));
}
export default App;
