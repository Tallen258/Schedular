import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useAgenticAction } from '../contexts/AgenticActionContext';
import './NavBar.css';

const NavBar: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { notifications } = useAgenticAction();
  const unreadCount = notifications.length;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/home">Schedular</Link>
      </div>
      {auth.isAuthenticated && (
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/create-event">Create Event</Link>
          <Link to="/event/1">Event Details</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/help">Help</Link>
          <Link to="/chat">AI Chat</Link>
        </div>
      )}
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
          <button onClick={() => void auth.signinRedirect()} className="auth-button">
            Log in
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;