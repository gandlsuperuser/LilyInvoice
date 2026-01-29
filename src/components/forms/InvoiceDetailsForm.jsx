import {
    formatCurrency,
    calculateLineTotal,
    createEmptyLineItem,
    CURRENCIES
} from '../../utils/invoiceGenerator';

export default function InvoiceDetailsForm({ data, onChange }) {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ ...data, items: newItems });
    };

    const addLineItem = () => {
        onChange({
            ...data,
            items: [...data.items, createEmptyLineItem()]
        });
    };

    const removeLineItem = (index) => {
        if (data.items.length <= 1) return;
        const newItems = data.items.filter((_, i) => i !== index);
        onChange({ ...data, items: newItems });
    };

    return (
        <div className="card fade-in">
            <div className="card-header">
                <h3 className="card-title">📋 发票明细</h3>
                <p className="card-subtitle">发票编号、日期和项目明细</p>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label required">发票编号</label>
                    <input
                        type="text"
                        className="form-input"
                        value={data.invoiceNumber}
                        onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                    />
                    <p className="form-helper">自动生成，可自行修改</p>
                </div>

                <div className="form-group">
                    <label className="form-label">货币</label>
                    <select
                        className="form-select"
                        value={data.currency}
                        onChange={(e) => handleChange('currency', e.target.value)}
                    >
                        {CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.code} - {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label required">发票日期</label>
                    <input
                        type="date"
                        className="form-input"
                        value={data.invoiceDate}
                        onChange={(e) => handleChange('invoiceDate', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">到期日期</label>
                    <input
                        type="date"
                        className="form-input"
                        value={data.dueDate}
                        onChange={(e) => handleChange('dueDate', e.target.value)}
                    />
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '24px' }}>
                <label className="form-label">项目明细</label>

                <table className="line-items-table">
                    <thead>
                        <tr>
                            <th className="col-description">描述</th>
                            <th className="col-quantity">数量</th>
                            <th className="col-price">单价</th>
                            <th className="col-total">小计</th>
                            <th className="col-actions"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, index) => (
                            <tr key={item.id}>
                                <td data-label="描述">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="产品或服务描述"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                    />
                                </td>
                                <td data-label="数量">
                                    <input
                                        type="number"
                                        className="form-input"
                                        min="0"
                                        step="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    />
                                </td>
                                <td data-label="单价">
                                    <input
                                        type="number"
                                        className="form-input"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={item.unitPrice}
                                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                    />
                                </td>
                                <td data-label="小计">
                                    <span className="line-item-total">
                                        {formatCurrency(calculateLineTotal(item), data.currency)}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-icon btn-danger btn-sm"
                                        onClick={() => removeLineItem(index)}
                                        disabled={data.items.length <= 1}
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addLineItem}
                    style={{ marginTop: '12px' }}
                >
                    + 添加项目
                </button>
            </div>

            <div className="form-row" style={{ marginTop: '24px' }}>
                <div className="form-group">
                    <label className="form-label">税率 (%)</label>
                    <input
                        type="number"
                        className="form-input"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0"
                        value={data.taxRate}
                        onChange={(e) => handleChange('taxRate', e.target.value)}
                    />
                    <p className="form-helper">如不适用，留空或填写 0</p>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">备注</label>
                <textarea
                    className="form-textarea"
                    placeholder="付款方式、特殊说明等..."
                    value={data.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                />
            </div>
        </div>
    );
}
