import {
    formatCurrency,
    formatDateUS,
    calculateLineTotal,
    calculateSubtotal,
    calculateTax,
    calculateTotal
} from '../../utils/invoiceGenerator';

export default function InvoicePreview({ invoice, previewRef }) {
    const subtotal = calculateSubtotal(invoice.items);
    const tax = calculateTax(subtotal, invoice.taxRate);
    const total = calculateTotal(subtotal, tax);

    const validItems = invoice.items.filter(item =>
        item.description?.trim() ||
        parseFloat(item.quantity) > 0 ||
        parseFloat(item.unitPrice) > 0
    );

    return (
        <div className="invoice-preview-container" ref={previewRef}>
            <div className="invoice-preview">
                {/* 发票头部 */}
                <div className="invoice-header">
                    <div>
                        <h1 className="invoice-title">INVOICE</h1>
                    </div>
                    <div className="invoice-meta">
                        <div className="invoice-number">#{invoice.invoiceNumber}</div>
                        <div className="invoice-dates">
                            <span><strong>Date:</strong> {formatDateUS(invoice.invoiceDate)}</span>
                            {invoice.dueDate && (
                                <span><strong>Due:</strong> {formatDateUS(invoice.dueDate)}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 发送方和收件方信息 */}
                <div className="invoice-parties">
                    <div className="invoice-party">
                        <h3>FROM</h3>
                        <p className="company-name">{invoice.sender.companyName || 'Your Company'}</p>
                        <p style={{ whiteSpace: 'pre-line' }}>{invoice.sender.address}</p>
                        {invoice.sender.phone && <p>{invoice.sender.phone}</p>}
                        {invoice.sender.email && <p>{invoice.sender.email}</p>}
                    </div>

                    <div className="invoice-party">
                        <h3>BILL TO</h3>
                        <p className="company-name">{invoice.recipient.companyName || 'Client Company'}</p>
                        <p style={{ whiteSpace: 'pre-line' }}>{invoice.recipient.address}</p>
                        {invoice.recipient.phone && <p>{invoice.recipient.phone}</p>}
                        {invoice.recipient.email && <p>{invoice.recipient.email}</p>}
                    </div>
                </div>

                {/* 项目明细表格 */}
                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>Qty</th>
                            <th style={{ width: '100px' }}>Unit Price</th>
                            <th style={{ width: '100px' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {validItems.length > 0 ? (
                            validItems.map((item) => (
                                <tr key={item.id}>
                                    <td className="item-description">{item.description || '-'}</td>
                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                    <td>{formatCurrency(item.unitPrice, invoice.currency)}</td>
                                    <td>{formatCurrency(calculateLineTotal(item), invoice.currency)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', color: '#999' }}>
                                    No items added
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* 金额汇总 */}
                <div className="invoice-totals">
                    <div className="invoice-totals-table">
                        <div className="invoice-totals-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal, invoice.currency)}</span>
                        </div>
                        {parseFloat(invoice.taxRate) > 0 && (
                            <div className="invoice-totals-row">
                                <span>Tax ({invoice.taxRate}%)</span>
                                <span>{formatCurrency(tax, invoice.currency)}</span>
                            </div>
                        )}
                        <div className="invoice-totals-row grand-total">
                            <span>Total</span>
                            <span>{formatCurrency(total, invoice.currency)}</span>
                        </div>
                    </div>
                </div>

                {/* 备注 */}
                {invoice.notes && (
                    <div className="invoice-notes">
                        <h4>Notes</h4>
                        <p style={{ whiteSpace: 'pre-line' }}>{invoice.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * 导出计算后的金额（供导出功能使用）
 */
export function getCalculatedAmounts(invoice) {
    const subtotal = calculateSubtotal(invoice.items);
    const tax = calculateTax(subtotal, invoice.taxRate);
    const total = calculateTotal(subtotal, tax);

    return { subtotal, tax, total };
}
