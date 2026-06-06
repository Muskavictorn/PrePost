import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router';
import { CheckCircle2, ImageIcon, Upload as UploadIcon } from 'lucide-react';
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from '../lib/constants';

interface UploadProps {
  onComplete?: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const { isSignedIn } = useOutletContext<AuthContext>();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFile(selectedFile);
      setProgress(0);

      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }

      intervalRef.current = window.setInterval(() => {
        setProgress((prevProgress) => {
          const nextProgress = Math.min(100, prevProgress + PROGRESS_STEP);

          if (nextProgress === 100) {
            if (intervalRef.current) {
              window.clearInterval(intervalRef.current);
              intervalRef.current = null;
            }

            timeoutRef.current = window.setTimeout(() => {
              onComplete?.(base64);
            }, REDIRECT_DELAY_MS);
          }

          return nextProgress;
        });
      }, PROGRESS_INTERVAL_MS);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) {
      return;
    }

    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (!isSignedIn) {
      return;
    }

    const droppedFile = event.dataTransfer.files?.[0];
    const allowedType = ['image/jpeg', 'image/png'];
    if (droppedFile && allowedType.includes(droppedFile.type)) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      return;
    }
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg,.jpeg,.png,.webp"
            disabled={!isSignedIn}
            onChange={handleChange}
          />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? 'Drag and drop your floor plan here, or click to select a file'
                : 'Please sign in to upload files'}
            </p>
            <p className="help">Maximum file size: 50MB</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? <CheckCircle2 className="check" /> : <ImageIcon className="image" />}
            </div>
            <h3>{file.name}</h3>
            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100 ? 'Analyzing floor plan...' : 'Redirecting...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
