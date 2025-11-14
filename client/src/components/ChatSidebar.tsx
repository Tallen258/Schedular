// src/components/ChatSidebar.tsx
import type { Conversation } from '../api/chat';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: number | null;
  onNew: () => void;
  onSelect: (id: number) => void;
}

export default function ChatSidebar({ conversations, activeId, onNew, onSelect }: ChatSidebarProps) {
  return (
    <aside className="w-64 bg-custom-white border-r border-itin-sand-200 flex flex-col">
      <div className="p-4 border-b border-itin-sand-200">
        <button
          onClick={onNew}
          className="btn-primary w-full"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-sm text-itin-sand-500 text-center">
            No conversations yet
          </div>
        ) : (
          <ul className="p-2">
            {conversations.map((convo) => (
              <li key={convo.id}>
                <button
                  onClick={() => onSelect(convo.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                    activeId === convo.id
                      ? 'bg-itin-sand-200 text-itin-sand-900'
                      : 'hover:bg-itin-sand-50 text-itin-sand-700'
                  }`}
                >
                  <div className="font-medium text-sm truncate">{convo.title}</div>
                  <div className="text-xs text-itin-sand-500 mt-1">
                    {new Date(convo.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
