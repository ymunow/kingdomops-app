import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import { ImageCropModal } from "./ImageCropModal";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uppy] = useState(() => {
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: ['image/*'],
      },
      autoProceed: false,
      allowMultipleUploadBatches: false,
    });

    uppyInstance.use(AwsS3, {
      shouldUseMultipart: false,
      getUploadParameters: onGetUploadParameters,
    });

    // Handle file selection to show crop modal first
    uppyInstance.on("file-added", (file) => {
      console.log('File selected for cropping:', file.name);
      
      // Remove the file from uppy temporarily
      if (file.id) {
        uppyInstance.removeFile(file.id);
      }
      
      // Create a File object from the uppy file
      const fileObj = new File([file.data as Blob], file.name, { type: file.type });
      setSelectedFile(fileObj);
      setShowModal(false);
      setShowCropModal(true);
    });

    uppyInstance.on("complete", (result) => {
      setShowModal(false);
      onComplete?.(result);
    });

    return uppyInstance;
  });

  const handleButtonClick = useCallback(() => {
    console.log('Upload button clicked'); // Debug log
    console.log('Setting showModal to true');
    setShowModal(true);
  }, []);

  // Handle cropped image upload
  const handleCropComplete = useCallback(async (croppedFile: File) => {
    console.log('Crop complete, uploading:', croppedFile.name, croppedFile.size);
    
    try {
      // Get upload parameters
      const uploadParams = await onGetUploadParameters();
      
      // Upload cropped file directly
      const response = await fetch(uploadParams.url, {
        method: uploadParams.method,
        body: croppedFile,
        headers: {
          'Content-Type': croppedFile.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      console.log('Cropped image uploaded successfully');
      
      // Create mock result object that matches Uppy's format
      const mockResult: UploadResult<Record<string, unknown>, Record<string, unknown>> = {
        successful: [{
          source: 'ImageCropModal',
          id: `cropped-${Date.now()}`,
          name: croppedFile.name,
          extension: croppedFile.name.split('.').pop() || '',
          meta: {
            name: croppedFile.name,
            type: croppedFile.type,
          },
          type: croppedFile.type,
          data: {},
          progress: {
            uploadStarted: Date.now(),
            uploadComplete: true,
            bytesUploaded: croppedFile.size,
            bytesTotal: croppedFile.size,
            percentage: 100,
          },
          size: croppedFile.size,
          isGhost: false,
          isRemote: false,
          preview: URL.createObjectURL(croppedFile),
          uploadURL: uploadParams.url.split('?')[0], // Remove query params
          response: {
            status: 200,
            body: {},
          },
        }],
        failed: [],
        uploadID: `crop-upload-${Date.now()}`,
      };

      onComplete?.(mockResult);
    } catch (error) {
      console.error('Error uploading cropped image:', error);
    }
  }, [onGetUploadParameters, onComplete]);

  useEffect(() => {
    return () => {
      uppy.destroy();
    };
  }, [uppy]);

  return (
    <div>
      <Button 
        onClick={handleButtonClick}
        className={buttonClassName}
        variant="ghost"
        type="button"
      >
        {children}
      </Button>

      {showModal && createPortal(
        <DashboardModal
          uppy={uppy}
          open={showModal}
          onRequestClose={() => {
            console.log('Closing modal');
            setShowModal(false);
          }}
          proudlyDisplayPoweredByUppy={false}
          note="Select an image to crop and upload for your profile picture!"
          showProgressDetails={true}
          hideUploadButton={false}
          hideRetryButton={false}
          hidePauseResumeButton={false}
          hideCancelButton={false}
          showRemoveButtonAfterComplete={true}
          disableLocalFiles={false}
        />,
        document.body
      )}

      {selectedFile && (
        <ImageCropModal
          imageFile={selectedFile}
          isOpen={showCropModal}
          onClose={() => {
            setShowCropModal(false);
            setSelectedFile(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
