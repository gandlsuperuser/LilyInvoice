import { useState, useRef } from 'react';
import SenderForm from '../components/forms/SenderForm';
import RecipientForm from '../components/forms/RecipientForm';
import InvoiceDetailsForm from '../components/forms/InvoiceDetailsForm';
import InvoicePreview, { getCalculatedAmounts } from '../components/invoice/InvoicePreview';
import { createEmptyInvoice, validateInvoice } from '../utils/invoiceGenerator';
import { exportToPDF, openEmailClient } from '../utils/pdfGenerator';

export default function CreatePage() {
    const [invoice, setInvoice] = useState(createEmptyInvoice());
    const [currentStep, setCurrentStep] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const [toast, setToast] = useState(null);
    const previewRef = useRef(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSenderChange = (sender) => {
        setInvoice({ ...invoice, sender });
    };

    const handleRecipientChange = (recipient) => {
        setInvoice({ ...invoice, recipient });
    };

    const handleDetailsChange = (details) => {
        setInvoice({ ...invoice, ...details });
    };

    const handleNextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

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

            if (result.success) {
                showToast('PDF 导出成功！', 'success');
            } else {
                showToast('PDF 导出失败: ' + result.error, 'error');
            }
        } catch (error) {
            showToast('PDF 导出失败', 'error');
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

    const handleReset = () => {
        if (window.confirm('确定要清空所有数据吗？')) {
            setInvoice(createEmptyInvoice());
            setCurrentStep(1);
            showToast('已重置', 'success');
        }
    };

    const steps = [
        { num: 1, label: '发送方' },
        { num: 2, label: '收件方' },
        { num: 3, label: '发票明细' }
    ];

    return (
        <div>
            <h1 style={{
                textAlign: 'center',
                marginBottom: '32px',
                background: 'var(--primary-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                ✏️ 手动创建发票
            </h1>

            {/* 步骤指示器 */}
            <div className="steps-container">
                <div className="steps">
                    {steps.map((step, index) => (
                        <div key={step.num}>
                            <div
                                className={`step ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setCurrentStep(step.num)}
                            >
                                <div className="step-circle">
                                    {currentStep > step.num ? '✓' : step.num}
                                </div>
                                <span className="step-label">{step.label}</span>
                            </div>
                            {index < steps.length - 1 && <div className="step-line"></div>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="workflow-container">
                {/* 左侧表单 */}
                <div className="workflow-form">
                    {currentStep === 1 && (
                        <SenderForm data={invoice.sender} onChange={handleSenderChange} />
                    )}
                    {currentStep === 2 && (
                        <RecipientForm data={invoice.recipient} onChange={handleRecipientChange} />
                    )}
                    {currentStep === 3 && (
                        <InvoiceDetailsForm data={invoice} onChange={handleDetailsChange} />
                    )}

                    {/* 导航按钮 */}
                    <div className="btn-group" style={{ marginTop: '24px', justifyContent: 'space-between' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={handlePrevStep}
                            disabled={currentStep === 1}
                        >
                            ← 上一步
                        </button>

                        {currentStep < 3 ? (
                            <button className="btn btn-primary" onClick={handleNextStep}>
                                下一步 →
                            </button>
                        ) : (
                            <button className="btn btn-outline" onClick={handleReset}>
                                🔄 重置
                            </button>
                        )}
                    </div>
                </div>

                {/* 右侧预览 */}
                <div className="workflow-preview">
                    <InvoicePreview invoice={invoice} previewRef={previewRef} />

                    {/* 导出面板 */}
                    <div className="export-panel">
                        <h3 className="export-title">📤 导出发票</h3>
                        <div className="export-buttons">
                            <button
                                className="btn btn-primary"
                                onClick={handleExportPDF}
                                disabled={isExporting}
                            >
                                {isExporting ? '导出中...' : '📄 导出 PDF'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleSendEmail}
                            >
                                📧 发送邮件
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast 通知 */}
            {toast && (
                <div className={`toast ${toast.type}`}>
                    <span>{toast.type === 'success' ? '✅' : '❌'}</span>
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}
