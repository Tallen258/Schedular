import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useAgenticAction } from '../context/AgenticActionContext';
import { useState } from 'react';
import './NavBar.css';

const NavBar: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { notifications } = useAgenticAction();
  const unreadCount = notifications.length;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/home">Schedular</Link>
      </div>
      
      {/* Hamburger Menu Button */}
      <button 
        className="hamburger-menu" 
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
      >
        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
      </button>

      <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
        {auth.isAuthenticated ? (
          <>
            <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
            <Link to="/calendar" onClick={closeMenu}>Calendar</Link>
            <Link to="/create-event" onClick={closeMenu}>Create Event</Link>
            <Link to="/compare" onClick={closeMenu}>Compare</Link>
            <Link to="/settings" onClick={closeMenu}>Settings</Link>
            <Link to="/help" onClick={closeMenu}>Help</Link>
            <Link to="/chat" onClick={closeMenu}>AI Chat</Link>
          </>
        ) : (
          <>
            <Link to="/calendar" onClick={closeMenu}>Calendar</Link>
            <Link to="/create-event" onClick={closeMenu}>Create Event</Link>
            <Link to="/help" onClick={closeMenu}>Help</Link>
          </>
        )}
      </div>
      <div className="nav-auth">
        {auth.isAuthenticated && (
          <button 
            onClick={() => navigate('/notifications')}
            className="auth-button mr-2 relative"
            title="View notifications"
          >
            <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-custom-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}
        {auth.isAuthenticated ? (
          <button onClick={() => void auth.removeUser()} className="auth-button">
            Log out
          </button>
        ) : (
          <button 
            onClick={() => {
              console.log("Login button clicked");
              console.log("Auth state:", { 
                isLoading: auth.isLoading, 
                isAuthenticated: auth.isAuthenticated,
                error: auth.error 
              });
              auth.signinRedirect().catch((err) => {
                console.error("Sign in error:", err);
              });
            }} 
            className="auth-button"
          >
            Log in
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;