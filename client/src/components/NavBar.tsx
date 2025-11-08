import { Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import './NavBar.css';

const NavBar: React.FC = () => {
  const auth = useAuth();

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