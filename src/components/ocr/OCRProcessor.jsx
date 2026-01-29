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
            </div>
        );
    }

    if (result) {
        const { data } = result;

        return (
            <div className="card fade-in">
                <div className="card-header">
                    <h3 className="card-title">✅ 识别结果</h3>
                    <p className="card-subtitle">
                        请检查以下信息是否正确，可进行修改后确认
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

                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        发票编号
                        {data.confidence?.invoiceNumber && (
                            <span className={`field-confidence ${getConfidenceLevel(data.confidence.invoiceNumber)}`}>
                                置信度: {getConfidenceLabel(data.confidence.invoiceNumber)}
                            </span>
                        )}
                    </h4>
                    <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                        {data.invoiceNumber || '未识别'}
                    </p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        日期
                    </h4>
                    <p>
                        发票日期: {data.invoiceDate || '未识别'}
                        {data.dueDate && ` | 到期日期: ${data.dueDate}`}
                    </p>
                </div>

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
                                    数量: {item.quantity} × 单价: ${item.unitPrice}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="btn-group" style={{ marginTop: '24px' }}>
                    <button className="btn btn-secondary" onClick={onRetry}>
                        重新上传
                    </button>
                    <button className="btn btn-primary" onClick={() => onConfirm(data)}>
                        使用这些信息
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
