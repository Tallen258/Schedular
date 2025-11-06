import React from 'react';

const ImageReview = () => {
  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-3xl card p-6">
        <header>
          <div className="itin-header">Image Review</div>
          <div className="accent-bar mt-2" />
        </header>

        <div className="mt-6 grid gap-4">
          <div className="uploaded-image border border-itin-sand-100 rounded p-4">
            <div className="text-itin-sand-700">No image uploaded</div>
          </div>

          <div className="ai-interpretation">
            <h2>AI Interpretation</h2>
            <div className="text-itin-sand-700">Parsed text will appear here for verification.</div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ImageReview;