import { useState, useCallback, useRef, useEffect } from 'react';

export const LogoUploader = ({ value, settings, onUpload, onUpdateSettings, onRemove, status }) => {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [isTransparent, setIsTransparent] = useState(null);
    const canvasRef = useRef(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragging(true);
        } else if (e.type === 'dragleave') {
            setDragging(false);
        }
    }, []);

    const handleFile = async (file) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a PNG, JPG, or SVG file.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('Logo file size too large. Max 2MB.');
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

    const detectTransparency = useCallback((url) => {
        if (!url || url.endsWith('.svg')) {
            setIsTransparent(true); // Assume SVGs can have transparency
            return;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url.startsWith('http') ? url : `http://localhost:3001${url}`;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            let hasAlpha = false;
            for (let i = 3; i < imageData.length; i += 4) {
                if (imageData[i] < 255) {
                    hasAlpha = true;
                    break;
                }
            }
            setIsTransparent(hasAlpha);
        };
    }, []);

    useEffect(() => {
        if (value) detectTransparency(value);
    }, [value, detectTransparency]);

    const getFullUrl = (path) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `http://localhost:3001${path}`;
    };

    return (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">Brand Logo</h4>
                <div className="flex items-center gap-2">
                    {status === 'pending' && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase">Pending Approval</span>}
                    {status === 'approved' && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">Approved</span>}
                    {status === 'rejected' && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 uppercase">Rejected</span>}
                </div>
            </div>

            {!value ? (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        const file = e.dataTransfer.files[0];
                        if (file) handleFile(file);
                    }}
                    className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400'
                        }`}
                >
                    <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                    <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p className="mt-2 text-xs font-medium text-slate-900">Drag logo here or click to browse</p>
                        <p className="mt-1 text-[10px] text-slate-500">PNG, JPG, SVG up to 2MB</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-center rounded-lg bg-white p-8 shadow-inner relative group">
                        <div
                            className="relative border border-slate-100 shadow-sm"
                            style={{
                                width: `${settings.width}px`,
                                height: `${settings.height}px`,
                                transform: `translate(${settings.x}px, ${settings.y}px)`
                            }}
                        >
                            <img
                                src={getFullUrl(value)}
                                alt="Logo Preview"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <button
                            onClick={onRemove}
                            className="absolute top-2 right-2 rounded-full bg-rose-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Size ({settings.width}px)</label>
                            <input
                                type="range"
                                min="20"
                                max="120"
                                value={settings.width}
                                onChange={(e) => onUpdateSettings({ ...settings, width: Number(e.target.value), height: Number(e.target.value) })}
                                className="w-full accent-brand-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Position X ({settings.x}px)</label>
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                value={settings.x}
                                onChange={(e) => onUpdateSettings({ ...settings, x: Number(e.target.value) })}
                                className="w-full accent-brand-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Position Y ({settings.y}px)</label>
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                value={settings.y}
                                onChange={(e) => onUpdateSettings({ ...settings, y: Number(e.target.value) })}
                                className="w-full accent-brand-500"
                            />
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Transparency</span>
                            {isTransparent === true ? (
                                <span className="text-[10px] font-bold text-emerald-600">Detected ✅</span>
                            ) : isTransparent === false ? (
                                <span className="text-[10px] font-bold text-amber-600">None ⚠️</span>
                            ) : (
                                <span className="text-[10px] font-bold text-slate-400">Checking...</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
    );
};
