import { useState } from 'react';

const Help = () => {
  const [openSection, setOpenSection] = useState<string | null>('getting-started');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => {
    const isOpen = openSection === id;
    return (
      <div className="border-b border-itin-sand-200 last:border-b-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-itin-sand-100 transition-colors"
        >
          <h2 className="text-xl font-semibold text-itin-sand-800">{title}</h2>
          <svg className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && <div className="p-4 pt-0 space-y-3 text-itin-sand-700">{children}</div>}
      </div>
    );
  };

  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-4xl">
        <div className="card p-8 mb-6 bg-gradient-to-br from-custom-purple-50 to-custom-blue-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-itin-sand-800 mb-3">Schedular Help Center</h1>
            <p className="text-lg text-itin-sand-600">Your AI-powered calendar assistant for smart scheduling and time management</p>
          </div>
        </div>

        <div className="card p-6 mb-6 bg-custom-blue-50 border-l-4 border-custom-blue-500">
          <h3 className="text-lg font-semibold text-custom-blue-800 mb-2">Quick Start</h3>
          <ol className="list-decimal list-inside space-y-1 text-custom-blue-700">
            <li>Click "Log in" to sign in with Google</li>
            <li>Authorize calendar access when prompted</li>
            <li>Visit the Dashboard to see your schedule</li>
            <li>Start creating events or chat with the AI assistant</li>
          </ol>
        </div>

        <div className="card overflow-hidden">
          <Section id="getting-started" title="Getting Started">
            <p>Schedular uses Google OAuth for secure authentication. After logging in, visit <strong>Settings</strong> to configure work hours, sync your Google Calendar, and explore the <strong>AI Chat</strong> to create events conversationally.</p>
          </Section>

          <Section id="features" title="Key Features">
            <div className="space-y-2">
              <p><strong>Dashboard:</strong> Overview of upcoming events and available time slots with smart suggestions.</p>
              <p><strong>Calendar:</strong> Interactive view with multiple modes. Click events to edit/delete or empty slots to create.</p>
              <p><strong>AI Chat:</strong> Natural language scheduling assistant for creating events, finding free time, and managing conflicts.</p>
              <p><strong>Schedule Comparison:</strong> Upload images of schedules to find optimal meeting times across participants.</p>
              <p><strong>Notifications:</strong> Review and approve AI suggestions before changes are applied to your calendar.</p>
              <p><strong>Settings:</strong> Configure default work hours and preferences for smarter AI scheduling.</p>
            </div>
          </Section>

          <Section id="ai-chat" title="Using the AI Chat">
            <h3 className="font-semibold text-itin-sand-800 mb-1">Example Commands</h3>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>"Schedule a team meeting for next Tuesday at 2pm"</li>
              <li>"Find me free time slots this week"</li>
              <li>"When am I available on Friday afternoon?"</li>
            </ul>
            <p>Upload schedule images in chat for analysis. All AI suggestions require your approval via notifications.</p>
          </Section>

          <Section id="schedule-compare" title="Schedule Comparison">
            <p className="mb-2">Upload calendar screenshots to find optimal meeting times. The AI extracts events and suggests available slots.</p>
            <h3 className="font-semibold text-itin-sand-800 mb-1">Tips</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use clear, well-lit images with visible times and dates</li>
              <li>Screenshots work better than angled photos</li>
              <li>AI handles various calendar formats</li>
            </ul>
          </Section>

          <Section id="google-calendar" title="Google Calendar Sync">
            <p className="mb-2">Click "Sync Google Calendar" on the Calendar page to import events. Changes sync in real-time. Your data is encrypted and tokens refresh automatically.</p>
          </Section>

          <Section id="faqs" title="FAQs">
            <div className="space-y-2">
              <div>
                <p className="font-semibold">Q: Is my calendar data private?</p>
                <p>A: Yes, encrypted and only accessible to you. Google OAuth ensures secure authentication.</p>
              </div>
              <div>
                <p className="font-semibold">Q: Can the AI modify my calendar without permission?</p>
                <p>A: No, all suggestions require your approval via notifications.</p>
              </div>
              <div>
                <p className="font-semibold">Q: What image formats are supported?</p>
                <p>A: JPG, PNG, WEBP under 10MB with visible calendar information.</p>
              </div>
            </div>
          </Section>

          <Section id="troubleshooting" title="Troubleshooting">
            <div className="space-y-2">
              <p><strong>Calendar not syncing:</strong> Check login status, click "Sync Google Calendar" manually, or re-authenticate.</p>
              <p><strong>AI Chat not responding:</strong> Check internet connection, refresh page, ensure you're logged in.</p>
              <p><strong>Image upload failed:</strong> Verify file size under 10MB and use common formats (JPG, PNG, WEBP).</p>
              <p><strong>Events not appearing:</strong> Sync Google Calendar, check date range/view mode, or refresh page.</p>
            </div>
          </Section>

          <Section id="tips" title="Pro Tips">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use natural language with the AI for best results</li>
              <li>Configure work hours in Settings for smarter suggestions</li>
              <li>Check notifications regularly for AI recommendations</li>
              <li>Click empty calendar slots for quick event creation</li>
              <li>Upload schedule screenshots to coordinate meetings</li>
            </ul>
          </Section>
        </div>
      </section>
    </main>
  );
};

export default Help;