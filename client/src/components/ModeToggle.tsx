interface ModeToggleProps {
  mode: 'manual' | 'ai';
  onModeChange: (mode: 'manual' | 'ai') => void;
  manualLabel?: string;
  aiLabel?: string;
}

const ModeToggle = ({ 
  mode, 
  onModeChange, 
  manualLabel = 'Manual Entry', 
  aiLabel = 'AI Help' 
}: ModeToggleProps) => {
  return (
    <div className="flex gap-2 p-1 bg-itin-sand-100 rounded-lg w-fit">
      <button
        onClick={() => onModeChange('manual')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'manual'
            ? 'bg-white text-itin-sand-800 shadow-sm'
            : 'text-itin-sand-600 hover:text-itin-sand-800'
        }`}
      >
        {manualLabel}
      </button>
      <button
        onClick={() => onModeChange('ai')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'ai'
            ? 'bg-white text-itin-sand-800 shadow-sm'
            : 'text-itin-sand-600 hover:text-itin-sand-800'
        }`}
      >
        {aiLabel}
      </button>
    </div>
  );
};

export default ModeToggle;
