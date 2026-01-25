import React, { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Define the worker source URL.
// IMPORTANT: This version must match the installed pdfjs-dist version.
// We'll use a generic recent version from CDN for simplicity, but ideally it should match package.json
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfThumbnailProps {
    fileUrl: string;
    coverUrl?: string;
    width?: number;
    className?: string;
    onClick?: () => void;
}

const PdfThumbnail: React.FC<PdfThumbnailProps> = ({ fileUrl, coverUrl, width = 400, className, onClick }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadPdf = async () => {
            // If we already have a specific cover URL (that isn't a generic/random seed), prioritize it?
            // The user wants "first page", so we should try generating it if it's a PDF.
            // But if fileUrl is empty, we must fallback.

            if (!fileUrl || !fileUrl.toLowerCase().endsWith('.pdf')) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const loadingTask = pdfjsLib.getDocument(fileUrl);
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(1);

                const viewport = page.getViewport({ scale: 1.5 }); // Good quality scale
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                if (context) {
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    } as any).promise;

                    if (isMounted) {
                        setImageSrc(canvas.toDataURL());
                        setIsLoading(false);
                    }
                }
            } catch (err) {
                console.error('Error rendering PDF thumbnail:', err);
                if (isMounted) {
                    setError(true);
                    setIsLoading(false);
                }
            }
        };

        loadPdf();

        return () => { isMounted = false; };
    }, [fileUrl]);

    if (imageSrc) {
        return (
            <img
                src={imageSrc}
                alt="Book Cover"
                className={className}
                onClick={onClick}
            />
        );
    }

    // Fallback to provided coverUrl or generic placeholder if loading/error
    return (
        <div className={`relative ${className} bg-slate-100 flex items-center justify-center overflow-hidden`}>
            {coverUrl ? (
                <img
                    src={coverUrl}
                    alt="Cover"
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    onClick={onClick}
                />
            ) : (
                <span className="text-slate-300 font-bold text-xs uppercase">No Preview</span>
            )}

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};

export default PdfThumbnail;
