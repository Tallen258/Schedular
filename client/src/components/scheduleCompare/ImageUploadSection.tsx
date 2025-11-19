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
              className="text-red-600 hover:text-red-800 text-sm"
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
        className="btn-primary w-full"
      >
        {isAnalyzing ? 'Analyzing Schedule...' : 'Extract Events from Image'}
      </button>
    </div>
  );
};

export default ImageUploadSection;
