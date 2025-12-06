interface ImageUploadSectionProps {
  uploadedImage: File | null;
  imagePreview: string | null;
  isAnalyzing: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onAnalyze: () => void;
}

const ImageUploadSection = ({
  uploadedImage,
  imagePreview,
  isAnalyzing,
  onImageUpload,
  onClearImage,
  onAnalyze,
}: ImageUploadSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Upload Calendar Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="form-input w-full"
        />
      </div>

      {imagePreview && (
        <div className="border border-itin-sand-200 rounded p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Preview</span>
            <button
              onClick={onClearImage}
              className="text-custom-red-700 hover:text-custom-red-700 text-sm font-semibold"
            >
              ✕ Clear
            </button>
          </div>
          <img
            src={imagePreview}
            alt="Calendar preview"
            className="w-full max-h-64 object-contain rounded"
          />
        </div>
      )}

      <button
        onClick={onAnalyze}
        disabled={!uploadedImage || isAnalyzing}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing Schedule...
          </>
        ) : (
          'Extract Events from Image'
        )}
      </button>
    </div>
  );
};

export default ImageUploadSection;
