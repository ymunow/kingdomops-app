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
          note="Upload your profile picture to make your feed more personal!"
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
    </div>
  );
}
