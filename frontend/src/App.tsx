import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Hamburger } from './components/Hamburger';
import './App.css';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">Shortify</div>
          <Hamburger onClick={() => setMenuOpen(!menuOpen)} isOpen={menuOpen} />
        </div>
      </header>

      <main>
        <Dashboard />
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Shortify. Built with React & Node.js</p>
      </footer>
    </div>
  );
}

export default App;
