import React, {
    useState,
    useCallback,
    useRef,
    useEffect
} from "react";

import { useOutletContext } from "react-router";

import {
    CheckCircle2,
    ImageIcon,
    UploadIcon
} from "lucide-react";

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

    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);

    const { isSignedIn } =
        useOutletContext<AuthContext>();

    const cleanupTimers = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        return () => {
            cleanupTimers();
        };
    }, []);

    const processFile = useCallback(
        (selectedFile: File) => {
            if (!isSignedIn) return;

            cleanupTimers();

            setFile(selectedFile);
            setProgress(0);

            const reader = new FileReader();

            reader.onerror = () => {
                setFile(null);
                setProgress(0);
            };

            reader.onloadend = () => {
                const base64Data =
                    reader.result as string;

                intervalRef.current =
                    window.setInterval(() => {
                        setProgress((prev) => {
                            const next =
                                prev +
                                PROGRESS_INCREMENT;

                            if (next >= 100) {
                                cleanupTimers();

                                timeoutRef.current =
                                    window.setTimeout(
                                        () => {
                                            onComplete?.(
                                                base64Data
                                            );
                                        },
                                        REDIRECT_DELAY_MS
                                    );

                                return 100;
                            }

                            return next;
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
        const selectedFile =
            event.target.files?.[0];

        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const handleDragOver = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            if (!isSignedIn) return;

            setIsDragging(true);
        },
        [isSignedIn]
    );

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            if (!isSignedIn) return;

            setIsDragging(false);

            const droppedFile =
                event.dataTransfer.files?.[0];

            if (
                droppedFile &&
                droppedFile.type.startsWith("image/")
            ) {
                processFile(droppedFile);
            }
        },
        [isSignedIn, processFile]
    );

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${
                        isDragging ? "is-dragging" : ""
                    }`}
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
                                style={{
                                    width: `${progress}%`
                                }}
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