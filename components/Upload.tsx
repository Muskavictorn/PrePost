import React, { useState, useCallback } from "react";
import { useOutletContext } from "react-router";
import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import {
    PROGRESS_INCREMENT,
    REDIRECT_DELAY_MS,
    PROGRESS_INTERVAL_MS
} from "../lib/constants";

interface UploadProps {
    onComplete?: (base64Data: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const { isSignedIn } = useOutletContext<AuthContext>();

    const processFile = useCallback(
        (selectedFile: File) => {
            if (!isSignedIn) return;

            setFile(selectedFile);
            setProgress(0);

            const reader = new FileReader();

            reader.onloadend = () => {
                const base64Data = reader.result as string;

                const interval = setInterval(() => {
                    setProgress((prev) => {
                        const nextProgress = prev + PROGRESS_INCREMENT;

                        if (nextProgress >= 100) {
                            clearInterval(interval);

                            setTimeout(() => {
                                onComplete?.(base64Data);
                            }, REDIRECT_DELAY_MS);

                            return 100;
                        }

                        return nextProgress;
                    });
                }, PROGRESS_INTERVAL_MS);
            };

            reader.readAsDataURL(selectedFile);
        },
        [isSignedIn, onComplete]
    );

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile = event.target.files?.[0];

        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (!isSignedIn) return;

        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (!isSignedIn) return;

        setIsDragging(false);

        const droppedFile = event.dataTransfer.files?.[0];

        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? "is-dragging" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.jpeg,.png"
                        disabled={!isSignedIn}
                        onChange={handleFileChange}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>

                        <p>
                            {isSignedIn
                                ? "Click to upload or just Drag and Drop"
                                : "Sign in or sign up with Puter to upload"}
                        </p>

                        <p className="help">
                            Maximum file size 50 MB.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle2 className="check" />
                            ) : (
                                <ImageIcon className="image" />
                            )}
                        </div>

                        <h3>{file.name}</h3>

                        <div className="progress">
                            <div
                                className="bar"
                                style={{ width: `${progress}%` }}
                            />

                            <p className="status-text">
                                {progress < 100
                                    ? "Analyzing Floor Plan..."
                                    : "Redirecting..."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;