/**
 * OCR 字段映射工具
 * 从 OCR 识别结果中提取发票字段
 */

/**
 * 从 OCR 文本中提取发票数据
 */
export function extractInvoiceData(ocrText) {
    const result = {
        sender: { companyName: '', address: '', phone: '', email: '' },
        recipient: { companyName: '', address: '', phone: '', email: '' },
        invoiceNumber: '',
        invoiceDate: '',
        dueDate: '',
        items: [],
        confidence: {}
    };

    const lines = ocrText.split('\n').map(l => l.trim()).filter(Boolean);

    // 提取发票编号
    const invNumMatch = ocrText.match(/(?:invoice|inv|#|no\.?|number|编号)[:\s]*([A-Z0-9-]+)/i);
    if (invNumMatch) {
        result.invoiceNumber = invNumMatch[1];
        result.confidence.invoiceNumber = 0.8;
    }

    // 提取日期
    const datePatterns = [
        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
        /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g,
        /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})/gi
    ];

    const dates = [];
    for (const pattern of datePatterns) {
        const matches = ocrText.match(pattern);
        if (matches) dates.push(...matches);
    }

    if (dates.length > 0) {
        result.invoiceDate = normalizeDate(dates[0]);
        result.confidence.invoiceDate = 0.7;
        if (dates.length > 1) {
            result.dueDate = normalizeDate(dates[1]);
            result.confidence.dueDate = 0.6;
        }
    }

    // 提取电话号码
    const phonePattern = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
    const phones = ocrText.match(phonePattern) || [];

    // 提取邮箱
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = ocrText.match(emailPattern) || [];

    // 提取金额行项目
    const amountPattern = /(.+?)\s+(\d+)\s*[xX×]?\s*\$?([\d,]+\.?\d*)\s*(?:=|:)?\s*\$?([\d,]+\.?\d*)?/g;
    let match;
    while ((match = amountPattern.exec(ocrText)) !== null) {
        const description = match[1].trim();
        const quantity = parseInt(match[2]) || 1;
        const unitPrice = parseFloat(match[3].replace(',', '')) || 0;

        if (description && !description.match(/^(total|subtotal|tax|小计|总计|税)/i)) {
            result.items.push({
                id: Date.now().toString() + Math.random(),
                description,
                quantity,
                unitPrice,
                confidence: 0.6
            });
        }
    }

    // 分配电话和邮箱
    if (phones.length > 0) result.sender.phone = phones[0];
    if (phones.length > 1) result.recipient.phone = phones[1];
    if (emails.length > 0) result.sender.email = emails[0];
    if (emails.length > 1) result.recipient.email = emails[1];

    // 尝试提取公司名称 (通常在前几行)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        if (line.length > 3 && !line.match(/invoice|date|number|#|\d{4}/i)) {
            if (!result.sender.companyName) {
                result.sender.companyName = line;
                result.confidence.senderName = 0.5;
            }
        }
    }

    return result;
}

/**
 * 标准化日期格式
 */
function normalizeDate(dateStr) {
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) { }
    return dateStr;
}

/**
 * 获取置信度等级
 */
export function getConfidenceLevel(confidence) {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
}

/**
 * 获取置信度标签
 */
export function getConfidenceLabel(confidence) {
    if (confidence >= 0.8) return '高';
    if (confidence >= 0.5) return '中';
    return '低';
}
