import { useState, useCallback } from 'react';

export const ImageUpload = ({ label, onUpload, value, className = '' }) => {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragging(true);
        } else if (e.type === 'dragleave') {
            setDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    }, []);

    const handleFile = async (file) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size too large. Max 5MB.');
            return;
        }

        setUploading(true);
        setError(null);
        try {
            await onUpload(file);
        } catch (err) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const getFullUrl = (path) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `http://localhost:3001${path}`;
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex min-h-[160px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all ${dragging
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-300 bg-slate-50 hover:border-orange-400 hover:bg-slate-100'
                    } ${value ? 'p-2' : 'p-6'}`}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {uploading ? (
                    <div className="text-center">
                        <div className="mb-2 inline-block h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
                        <p className="text-xs text-slate-600">Uploading...</p>
                    </div>
                ) : value ? (
                    <div className="relative h-full w-full overflow-hidden rounded-lg group">
                        <img
                            src={getFullUrl(value)}
                            alt="Preview"
                            className="h-full w-full object-cover max-h-[144px]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <p className="text-xs font-bold text-white">Click or Drop to Replace</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                            <span className="text-orange-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
    );
};
