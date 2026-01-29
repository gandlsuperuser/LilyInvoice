import { useRef, useState, useCallback } from 'react';

export default function ImageUploader({ onImageSelect }) {
    const fileInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFileSelect = useCallback((file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onImageSelect(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }, [onImageSelect]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        handleFileSelect(file);
    };

    return (
        <div
            className={`upload-zone ${dragOver ? 'dragover' : ''}`}
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <div className="upload-zone-icon">📁</div>
            <div className="upload-zone-title">点击或拖拽上传图片</div>
            <div className="upload-zone-subtitle">
                支持 JPG、PNG 格式的手写发票图片
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleChange}
                style={{ display: 'none' }}
            />
        </div>
    );
}
