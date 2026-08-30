import { useState, useRef } from 'react';
import { wardrobeApi } from '../../api/wardrobe';

interface ImageUploaderProps {
  itemId: string;
  currentImageUrl?: string;
  onUpload: (updatedItem: any) => void;
}

export function ImageUploader({ itemId, currentImageUrl, onUpload }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const updated = await wardrobeApi.uploadImage(itemId, file);
      onUpload(updated);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (preview) {
    return (
      <div className="image-uploader-preview">
        <img src={preview} alt="Clothing item" />
        <div className="image-uploader-overlay">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : '📷 Change Photo'}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />
      </div>
    );
  }

  return (
    <div
      className={`image-uploader${dragging ? ' dragging' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
    >
      <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>📷</span>
      <div style={{ fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
        {uploading ? 'Uploading…' : 'Upload photo'}
      </div>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
        Click or drag & drop · JPG, PNG, WebP · Max 10MB
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
    </div>
  );
}
