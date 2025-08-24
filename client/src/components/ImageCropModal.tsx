import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Crop as CropIcon, RotateCcw } from 'lucide-react';

interface ImageCropModalProps {
  imageFile: File;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

export function ImageCropModal({ imageFile, isOpen, onClose, onCropComplete }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  // Load image when modal opens
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Auto-center crop to square aspect ratio
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1, // 1:1 aspect ratio for square crop
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(newCrop);
  }, []);

  // One-click auto-crop: automatically crop to center square
  const handleAutoCrop = useCallback(() => {
    if (!imgRef.current) return;
    
    const { width, height } = imgRef.current;
    const size = Math.min(width, height) * 0.9; // 90% of the smaller dimension
    
    const newCrop: Crop = {
      unit: 'px',
      width: size,
      height: size,
      x: (width - size) / 2,
      y: (height - size) / 2,
    };
    
    setCrop(newCrop);
  }, []);

  // Process and resize the cropped image
  const handleCropSave = useCallback(async () => {
    if (!imgRef.current || !crop.width || !crop.height) return;
    
    setIsProcessing(true);
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Set canvas to desired output size (400x400px for profile pictures)
      canvas.width = 400;
      canvas.height = 400;

      // Calculate crop dimensions in natural image coordinates
      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;
      const cropWidth = crop.width * scaleX;
      const cropHeight = crop.height * scaleY;

      // Draw the cropped and resized image
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        400,
        400
      );

      // Convert to blob and create file
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          setIsProcessing(false);
          return;
        }

        const fileName = `profile_${Date.now()}.jpg`;
        const croppedFile = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        console.log(`Image cropped and resized: ${croppedFile.size} bytes (400x400px)`);
        onCropComplete(croppedFile);
        setIsProcessing(false);
        onClose();
      }, 'image/jpeg', 0.9); // High quality JPEG
    } catch (error) {
      console.error('Error processing crop:', error);
      setIsProcessing(false);
    }
  }, [crop, onCropComplete, onClose]);

  // Set up image source when file changes
  React.useEffect(() => {
    if (imageFile && isOpen) {
      const url = URL.createObjectURL(imageFile);
      setImageSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile, isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Crop Your Profile Picture
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-y-auto">
          {imageSrc && (
            <div className="flex flex-col items-center space-y-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                aspect={1} // Force square aspect ratio for circular crop
                className="max-w-full circular-crop"
                circularCrop={false} // We handle circular styling with CSS
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-w-full max-h-64 object-contain"
                />
              </ReactCrop>
              
              <div className="text-sm text-gray-600 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full border-2 border-dashed border-spiritual-blue"></div>
                  <span>Drag the circle to position your profile picture</span>
                </div>
                Your image will be automatically resized to 400×400 pixels for optimal quality.
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleAutoCrop}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Auto Center
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleCropSave} 
                disabled={isProcessing}
                className="bg-spiritual-blue hover:bg-spiritual-blue/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Save Cropped Image'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>,
    document.body
  );
}