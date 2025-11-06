import React from 'react';

const AIChat = () => {
  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-3xl card p-6">
        <header>
          <div className="itin-header">AI Assistant</div>
          <div className="accent-bar mt-2" />
        </header>

        <div className="mt-6">
          <div className="chat-container border border-itin-sand-100 rounded p-4">
            <div className="text-itin-sand-700">Ask the assistant about scheduling, events, or suggest an event to create.</div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AIChat;