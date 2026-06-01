import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './Hamburger.css';
export const Hamburger = ({ onClick, isOpen = false }) => {
    return (_jsx("button", { className: `hamburger-btn ${isOpen ? 'open' : ''}`, onClick: onClick, "aria-label": "Toggle menu", title: "Menu", children: _jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }), _jsx("line", { x1: "3", y1: "12", x2: "21", y2: "12" }), _jsx("line", { x1: "3", y1: "18", x2: "21", y2: "18" })] }) }));
};
