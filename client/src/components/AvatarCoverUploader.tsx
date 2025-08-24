import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Upload, RotateCcw, Camera } from 'lucide-react';

type Kind = "avatar" | "cover";

interface AvatarCoverUploaderProps {
  kind: Kind;
  userId: string;
  onDone: (url: string) => void;
  buttonText?: string;
  buttonClassName?: string;
}

export function AvatarCoverUploader({ 
  kind, 
  userId, 
  onDone, 
  buttonText,
  buttonClassName 
}: AvatarCoverUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspect = kind === "cover" ? 3 / 1 : 1;   // cover = wide, avatar = square
  const label = kind === "cover" ? "Crop your cover image" : "Crop your profile picture";
  const defaultButtonText = kind === "cover" ? "Upload Cover" : "Upload Photo";

  // Handle file selection
  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setShowModal(true);
  }, []);

  // Load image when modal opens
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Auto-center crop to proper aspect ratio
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(newCrop);
  }, [aspect]);

  // One-click auto-crop
  const handleAutoCrop = useCallback(() => {
    if (!imgRef.current) return;
    
    const { width, height } = imgRef.current;
    let cropWidth, cropHeight;
    
    if (kind === "cover") {
      // For cover: prioritize width, make it wide
      cropWidth = width * 0.9;
      cropHeight = cropWidth / 3; // 3:1 aspect ratio
      if (cropHeight > height) {
        cropHeight = height * 0.9;
        cropWidth = cropHeight * 3;
      }
    } else {
      // For avatar: square crop
      const size = Math.min(width, height) * 0.9;
      cropWidth = size;
      cropHeight = size;
    }
    
    const newCrop: Crop = {
      unit: 'px',
      width: cropWidth,
      height: cropHeight,
      x: (width - cropWidth) / 2,
      y: (height - cropHeight) / 2,
    };
    
    setCrop(newCrop);
  }, [kind]);

  // Get cropped blob using canvas
  const getCroppedBlob = useCallback(async (): Promise<Blob> => {
    if (!imgRef.current || !crop?.width || !crop?.height) {
      throw new Error('No crop area defined');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas to desired output size
    if (kind === "cover") {
      canvas.width = 1200;  // Wide format for cover
      canvas.height = 400;
    } else {
      canvas.width = 400;   // Square for avatar
      canvas.height = 400;
    }

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
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Failed to create blob');
        resolve(blob);
      }, 'image/webp', 0.9);
    });
  }, [crop, kind]);

  // Save the cropped image
  const onSave = useCallback(async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    try {
      const blob = await getCroppedBlob();
      const fd = new FormData();
      fd.append("file", blob, kind === "cover" ? "cover.webp" : "avatar.webp");
      fd.append("userId", userId);

      const endpoint = kind === "cover" ? "/api/profile/cover" : "/api/profile/photo";
      const res = await fetch(endpoint, { method: "POST", body: fd });
      
      if (!res.ok) { 
        console.error('Upload failed:', res.status, res.statusText);
        alert("Upload failed"); 
        return; 
      }
      
      const { url } = await res.json();
      onDone(url);
      setShowModal(false);
      setSelectedFile(null);
      setImageSrc('');
    } catch (error) {
      console.error('Upload error:', error);
      alert("Upload failed");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, getCroppedBlob, userId, kind, onDone]);

  // Cleanup image URL when modal closes
  const handleClose = useCallback(() => {
    setShowModal(false);
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
      setImageSrc('');
    }
    setSelectedFile(null);
  }, [imageSrc]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="hidden"
        data-testid={`input-${kind}-upload`}
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        className={buttonClassName}
        data-testid={`button-${kind}-upload`}
      >
        {buttonText ? (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {buttonText}
          </>
        ) : buttonText === '' ? (
          <Camera className="h-5 w-5 text-gray-600" />
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {defaultButtonText}
          </>
        )}
      </Button>

      <Dialog open={showModal} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {label}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {imageSrc && (
              <div className="flex flex-col items-center space-y-4">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  aspect={aspect}
                  className="max-w-full"
                  circularCrop={false}
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    className="max-w-full max-h-96 object-contain"
                  />
                </ReactCrop>
                
                <div className="text-sm text-gray-600 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div 
                      className={`border-2 border-dashed border-spiritual-blue ${
                        kind === "cover" ? "w-12 h-4" : "w-6 h-6 rounded-full"
                      }`}
                    ></div>
                    <span>Drag to position your {kind === "cover" ? "cover image" : "profile picture"}</span>
                  </div>
                  Your image will be automatically resized to {kind === "cover" ? "1200×400" : "400×400"} pixels for optimal quality.
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleAutoCrop}
                className="flex items-center gap-2"
                data-testid={`button-auto-center-${kind}`}
              >
                <RotateCcw className="h-4 w-4" />
                Auto Center
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  data-testid={`button-cancel-${kind}`}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={onSave} 
                  disabled={isProcessing}
                  className="bg-spiritual-blue hover:bg-spiritual-blue/90"
                  data-testid={`button-save-${kind}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Save ${kind === "cover" ? "Cover" : "Profile Photo"}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}