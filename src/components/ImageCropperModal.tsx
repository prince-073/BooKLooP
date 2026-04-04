import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import { getCroppedImg } from '../lib/cropImage';
import { cn } from '../lib/utils';

interface ImageCropperModalProps {
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedFile: File) => Promise<void>;
  aspectRatio?: number;
  shape?: 'rect' | 'round';
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ 
  imageSrc, 
  onClose, 
  onSave, 
  aspectRatio = 1,
  shape = 'round'
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        await onSave(croppedImage);
      }
      setIsSaving(false);
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface relative w-full max-w-md rounded-lg shadow-2xl overflow-hidden flex flex-col paper-grain border border-outline-variant">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/30">
          <h2 className="font-headline font-bold text-lg text-on-surface tracking-wide">Adjust Portrait</h2>
          <button 
            onClick={onClose} 
            className="text-on-surface-variant hover:text-error transition-colors p-1"
            disabled={isSaving}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-80 bg-surface-container-lowest">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape={shape}
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/30">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                Zoom
              </label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-outline-variant/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 text-sm font-bold uppercase tracking-wider text-on-primary bg-primary rounded-sm transition-all shadow-md hover:bg-primary/90",
                  isSaving && "opacity-70 cursor-not-allowed"
                )}
              >
                {isSaving ? "Saving..." : "Save Portrait"}
                {!isSaving && <Check size={16} />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImageCropperModal;
