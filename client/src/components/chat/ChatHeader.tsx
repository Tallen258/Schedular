interface ChatHeaderProps {
  title: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const ChatHeader = ({ title, isSidebarOpen, onToggleSidebar }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b border-itin-sand-200 bg-custom-white flex items-center justify-between flex-shrink-0">
      <button
        className="mobile-menu-btn p-2 hover:bg-itin-sand-100 rounded transition-colors"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6 text-itin-sand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <span className="text-lg font-semibold text-itin-sand-800">
        {title}
      </span>
      
      <div className="mobile-menu-btn w-10"></div>
    </div>
  );
};

export default ChatHeader;
