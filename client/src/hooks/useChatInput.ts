import { useState, useRef } from "react";

export const useChatInput = () => {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetInput = () => {
    setInput("");
    clearImage();
  };

  const restoreInput = (text: string, imageFile?: File) => {
    setInput(text);
    if (imageFile) {
      setSelectedImage(imageFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  };

  return {
    input,
    setInput,
    selectedImage,
    imagePreview,
    fileInputRef,
    handleImageSelect,
    clearImage,
    resetInput,
    restoreInput,
  };
};
