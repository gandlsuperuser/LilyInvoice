import { useState } from 'react';
import { getConfidenceLevel, getConfidenceLabel } from '../../utils/ocrFieldMapper';

export default function OCRProcessor({
    imageData,
    isProcessing,
    progress,
    status,
    result,
    error,
    onRetry,
    onConfirm
}) {
    const [showRawText, setShowRawText] = useState(false);

    if (error) {
        return (
            <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
                <h3 style={{ marginBottom: '8px', color: 'var(--error-color)' }}>识别失败</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
                <button className="btn btn-primary" onClick={onRetry}>
                    重新上传
                </button>
            </div>
        );
    }

    if (isProcessing) {
        return (
            <div className="ocr-processing">
                <div className="ocr-spinner"></div>
                <h3 style={{ marginBottom: '8px' }}>{status}</h3>
                <div className="ocr-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
                        {progress}%
                    </p>
                </div>
                <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    首次使用需下载语言包，请耐心等待...
                </p>
            </div>
        );
    }

    if (result) {
        const { data, text, confidence } = result;

        return (
            <div className="card fade-in">
                <div className="card-header">
                    <h3 className="card-title">✅ 识别结果</h3>
                    <p className="card-subtitle">
                        整体置信度: {Math.round(confidence || 0)}% | 请检查信息是否正确
                    </p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <img
                        src={imageData}
                        alt="Uploaded invoice"
                        className="image-preview"
                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                    />
                </div>

                {/* 显示/隐藏原始文本 */}
                <div style={{ marginBottom: '24px' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowRawText(!showRawText)}
                    >
                        {showRawText ? '隐藏' : '查看'} 原始识别文本
                    </button>

                    {showRawText && (
                        <div style={{
                            marginTop: '12px',
                            padding: '16px',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px',
                            maxHeight: '200px',
                            overflow: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all'
                        }}>
                            {text || '未识别到文字'}
                        </div>
                    )}
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        💡 如果自动提取不准确，可以查看原始文本后手动填写
                    </p>
                </div>

                {/* 提取的字段 */}
                {data.invoiceNumber && (
                    <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            发票编号
                            {data.confidence?.invoiceNumber && (
                                <span className={`field-confidence ${getConfidenceLevel(data.confidence.invoiceNumber)}`}>
                                    {getConfidenceLabel(data.confidence.invoiceNumber)}
                                </span>
                            )}
                        </h4>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                            {data.invoiceNumber}
                        </p>
                    </div>
                )}

                {(data.invoiceDate || data.dueDate) && (
                    <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            日期
                        </h4>
                        <p>
                            {data.invoiceDate && `发票日期: ${data.invoiceDate}`}
                            {data.dueDate && ` | 到期日期: ${data.dueDate}`}
                        </p>
                    </div>
                )}

                {(data.sender.companyName || data.sender.phone || data.sender.email) && (
                    <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            发送方信息
                        </h4>
                        {data.sender.companyName && <p>公司: {data.sender.companyName}</p>}
                        {data.sender.phone && <p>电话: {data.sender.phone}</p>}
                        {data.sender.email && <p>邮箱: {data.sender.email}</p>}
                    </div>
                )}

                {data.items.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            识别到的项目 ({data.items.length} 项)
                        </h4>
                        {data.items.map((item, index) => (
                            <div key={index} style={{
                                padding: '12px',
                                background: 'var(--bg-glass)',
                                borderRadius: '8px',
                                marginBottom: '8px'
                            }}>
                                <div style={{ fontWeight: '500' }}>{item.description}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    数量: {item.quantity} × 单价: ${item.unitPrice.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 无识别结果提示 */}
                {!data.invoiceNumber && !data.invoiceDate && data.items.length === 0 && (
                    <div style={{
                        padding: '24px',
                        background: 'rgba(255, 193, 7, 0.1)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        marginBottom: '24px'
                    }}>
                        <p style={{ color: 'var(--warning-color)', marginBottom: '8px' }}>
                            ⚠️ 未能自动提取发票信息
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            建议查看原始识别文本，然后手动填写发票信息
                        </p>
                    </div>
                )}

                <div className="btn-group" style={{ marginTop: '24px' }}>
                    <button className="btn btn-secondary" onClick={onRetry}>
                        重新上传
                    </button>
                    <button className="btn btn-primary" onClick={() => onConfirm(data)}>
                        使用此信息（可继续编辑）
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
