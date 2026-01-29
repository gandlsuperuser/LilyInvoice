import { useState, useRef, useEffect } from 'react';
import ImageUploader from '../components/ocr/ImageUploader';
import CameraCapture from '../components/ocr/CameraCapture';
import OCRProcessor from '../components/ocr/OCRProcessor';
import SenderForm from '../components/forms/SenderForm';
import RecipientForm from '../components/forms/RecipientForm';
import InvoiceDetailsForm from '../components/forms/InvoiceDetailsForm';
import InvoicePreview, { getCalculatedAmounts } from '../components/invoice/InvoicePreview';
import { useOCR } from '../hooks/useOCR';
import { createEmptyInvoice, validateInvoice } from '../utils/invoiceGenerator';
import { exportToPDF, sharePDF, openEmailClient } from '../utils/pdfGenerator';

export default function ScanPage() {
    const [step, setStep] = useState('upload');
    const [imageData, setImageData] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [invoice, setInvoice] = useState(createEmptyInvoice());
    const [isExporting, setIsExporting] = useState(false);
    const [toast, setToast] = useState(null);
    const previewRef = useRef(null);

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const { isProcessing, progress, status, result, error, processImage, reset } = useOCR();

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (imageData && step === 'upload') {
            setStep('processing');
            processImage(imageData);
        }
    }, [imageData]);

    useEffect(() => {
        if (result && !isProcessing) {
            setStep('review');
        }
    }, [result, isProcessing]);

    const handleImageSelect = (data) => setImageData(data);
    const handleCameraCapture = (data) => {
        setShowCamera(false);
        setImageData(data);
    };

    const handleRetry = () => {
        reset();
        setImageData(null);
        setStep('upload');
    };

    const handleConfirmOCR = (data) => {
        const newInvoice = { ...invoice };
        if (data.invoiceNumber) newInvoice.invoiceNumber = data.invoiceNumber;
        if (data.invoiceDate) newInvoice.invoiceDate = data.invoiceDate;
        if (data.dueDate) newInvoice.dueDate = data.dueDate;
        if (data.sender.companyName) newInvoice.sender = { ...newInvoice.sender, ...data.sender };
        if (data.recipient.companyName) newInvoice.recipient = { ...newInvoice.recipient, ...data.recipient };
        if (data.items.length > 0) newInvoice.items = data.items;
        setInvoice(newInvoice);
        setStep('edit');
    };

    const handleSenderChange = (sender) => setInvoice({ ...invoice, sender });
    const handleRecipientChange = (recipient) => setInvoice({ ...invoice, recipient });
    const handleDetailsChange = (details) => setInvoice({ ...invoice, ...details });

    const handleExportPDF = async () => {
        const validation = validateInvoice(invoice);
        if (!validation.isValid) {
            showToast(validation.errors[0], 'error');
            return;
        }
        if (!previewRef.current) return;

        setIsExporting(true);
        try {
            const filename = `Invoice_${invoice.invoiceNumber}.pdf`;
            const result = await exportToPDF(previewRef.current, filename);
            if (result.success) showToast(result.shared ? 'PDF 已分享！' : 'PDF 导出成功！', 'success');
            else showToast('PDF 导出失败', 'error');
        } catch (error) {
            showToast('PDF 导出失败', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const handleSharePDF = async () => {
        const validation = validateInvoice(invoice);
        if (!validation.isValid) {
            showToast(validation.errors[0], 'error');
            return;
        }
        if (!previewRef.current) return;

        setIsExporting(true);
        try {
            const filename = `Invoice_${invoice.invoiceNumber}.pdf`;
            const result = await sharePDF(previewRef.current, filename);
            if (result.success) showToast('PDF 分享成功！', 'success');
            else if (!result.cancelled) showToast('分享失败', 'error');
        } catch (error) {
            showToast('分享失败', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const handleSendEmail = () => {
        const validation = validateInvoice(invoice);
        if (!validation.isValid) {
            showToast(validation.errors[0], 'error');
            return;
        }
        const calculated = getCalculatedAmounts(invoice);
        openEmailClient(invoice, calculated);
    };

    return (
        <div>
            <h1 style={{
                textAlign: 'center',
                marginBottom: '32px',
                background: 'var(--primary-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                📷 扫描手写发票
            </h1>

            {/* 上传步骤 */}
            {step === 'upload' && (
                <div className="card fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="card-header" style={{ textAlign: 'center' }}>
                        <h3 className="card-title">上传手写发票图片</h3>
                        <p className="card-subtitle">支持拍照或上传图片文件</p>
                    </div>

                    <ImageUploader onImageSelect={handleImageSelect} />

                    <div className="upload-options">
                        <div className="upload-option" onClick={() => setShowCamera(true)}>
                            <span className="upload-option-icon">📷</span>
                            <span className="upload-option-label">拍照</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 处理中 */}
            {step === 'processing' && (
                <div className="card fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <OCRProcessor
                        imageData={imageData}
                        isProcessing={isProcessing}
                        progress={progress}
                        status={status}
                        result={result}
                        error={error}
                        onRetry={handleRetry}
                        onConfirm={handleConfirmOCR}
                    />
                </div>
            )}

            {/* 审核结果 */}
            {step === 'review' && (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <OCRProcessor
                        imageData={imageData}
                        isProcessing={false}
                        progress={100}
                        status="完成"
                        result={result}
                        error={error}
                        onRetry={handleRetry}
                        onConfirm={handleConfirmOCR}
                    />
                </div>
            )}

            {/* 编辑发票 */}
            {step === 'edit' && (
                <div className="workflow-container">
                    <div className="workflow-form">
                        <div style={{ marginBottom: '24px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={handleRetry}>
                                ← 重新扫描
                            </button>
                        </div>

                        <SenderForm data={invoice.sender} onChange={handleSenderChange} />
                        <RecipientForm data={invoice.recipient} onChange={handleRecipientChange} />
                        <InvoiceDetailsForm data={invoice} onChange={handleDetailsChange} />
                    </div>

                    <div className="workflow-preview">
                        <InvoicePreview invoice={invoice} previewRef={previewRef} />

                        <div className="export-panel">
                            <h3 className="export-title">📤 导出发票</h3>
                            <div className="export-buttons">
                                {isMobile ? (
                                    <button
                                        className="btn btn-primary btn-block"
                                        onClick={handleSharePDF}
                                        disabled={isExporting}
                                    >
                                        {isExporting ? '处理中...' : '📤 分享 PDF'}
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleExportPDF}
                                        disabled={isExporting}
                                    >
                                        {isExporting ? '导出中...' : '📄 下载 PDF'}
                                    </button>
                                )}
                                <button className="btn btn-secondary" onClick={handleSendEmail}>
                                    📧 发送邮件
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 相机模态框 */}
            {showCamera && (
                <CameraCapture
                    onImageCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type}`}>
                    <span>{toast.type === 'success' ? '✅' : '❌'}</span>
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}
