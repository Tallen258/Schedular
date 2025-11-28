// src/components/ChatSidebar.tsx
import { useState } from 'react';
import type { Conversation } from '../../api/chat';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: number | null;
  onNew: () => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ChatSidebar({ conversations, activeId, onNew, onSelect, onDelete }: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  return (
    <aside className={`bg-custom-white border-r border-itin-sand-200 flex flex-col h-full transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className={`p-4 border-b border-itin-sand-200 flex items-center flex-shrink-0 ${
        isCollapsed ? 'justify-center' : 'justify-between'
      }`}>
        {!isCollapsed && (
          <button
            onClick={onNew}
            className="btn-primary flex-1 mr-2"
          >
            + New Chat
          </button>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-itin-sand-100 rounded transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg 
            className={`w-5 h-5 text-itin-sand-600 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* New chat button when collapsed */}
      {isCollapsed && (
        <div className="p-2 border-b border-itin-sand-200 flex-shrink-0">
          <button
            onClick={onNew}
            className="w-full p-2 hover:bg-itin-sand-100 rounded transition-colors flex items-center justify-center"
            title="New chat"
          >
            <svg className="w-6 h-6 text-itin-sand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0">
        {conversations.length === 0 ? (
          !isCollapsed && (
            <div className="p-4 text-sm text-itin-sand-500 text-center">
              No conversations yet
            </div>
          )
        ) : (
          <ul className="p-2">
            {conversations.map((convo) => (
              <li key={convo.id} className="relative group">
                <button
                  onClick={() => onSelect(convo.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                    activeId === convo.id
                      ? 'bg-itin-sand-200 text-itin-sand-900'
                      : 'hover:bg-itin-sand-50 text-itin-sand-700'
                  }`}
                  title={isCollapsed ? convo.title : undefined}
                >
                  {isCollapsed ? (
                    <div className="flex justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium text-sm truncate pr-8">{convo.title}</div>
                      <div className="text-xs text-itin-sand-500 mt-1">
                        {new Date(convo.updatedAt).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </button>
                {!isCollapsed && (
                  <>
                    {deletingId === convo.id ? (
                      <div className="absolute right-2 top-2 flex gap-1 z-10">
                        <button
                          onClick={() => {
                            onDelete(convo.id);
                            setDeletingId(null);
                          }}
                          className="p-1 bg-custom-red-700 text-white rounded hover:bg-custom-red-900 transition-colors shadow-md"
                          title="Confirm delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="p-1 bg-itin-sand-400 text-white rounded hover:bg-itin-sand-500 transition-colors shadow-md"
                          title="Cancel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(convo.id);
                        }}
                        className="absolute right-2 top-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-custom-red-100 rounded transition-all z-10"
                        title="Delete chat"
                      >
                        <svg className="w-4 h-4 text-custom-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
