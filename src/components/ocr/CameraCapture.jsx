import { useRef, useState, useCallback, useEffect } from 'react';

export default function CameraCapture({ onImageCapture, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
            setError(null);
        } catch (err) {
            console.error('Camera error:', err);
            setError('无法访问摄像头，请检查权限设置');
        }
    };

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }, [stream]);

    const captureImage = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        stopCamera();
        onImageCapture(imageData);
    }, [stopCamera, onImageCapture]);

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    if (error) {
        return (
            <div className="modal-overlay" onClick={handleClose}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h4 className="modal-title">摄像头错误</h4>
                        <button className="modal-close" onClick={handleClose}>×</button>
                    </div>
                    <div className="modal-body" style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--error-color)', marginBottom: '16px' }}>
                            {error}
                        </p>
                        <button className="btn btn-secondary" onClick={handleClose}>
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h4 className="modal-title">📷 拍摄发票</h4>
                    <button className="modal-close" onClick={handleClose}>×</button>
                </div>
                <div className="modal-body">
                    <div style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#000'
                    }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{
                                width: '100%',
                                display: 'block',
                                borderRadius: '12px'
                            }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                    <p style={{
                        textAlign: 'center',
                        marginTop: '12px',
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem'
                    }}>
                        请将发票放在镜头前，确保光线充足
                    </p>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={handleClose}>
                        取消
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={captureImage}>
                        📸 拍照
                    </button>
                </div>
            </div>
        </div>
    );
}
