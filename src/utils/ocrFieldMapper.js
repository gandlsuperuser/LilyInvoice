/**
 * OCR 字段映射工具 - 增强版
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

    if (!ocrText || ocrText.trim().length === 0) {
        return result;
    }

    const lines = ocrText.split('\n').map(l => l.trim()).filter(Boolean);
    const fullText = ocrText.toUpperCase();

    // 提取发票编号 - 多种模式
    const invNumPatterns = [
        /(?:INVOICE|INV)[#:\s]*([A-Z0-9\-]+)/i,
        /(?:NO|NUMBER|#)[.:\s]*([A-Z0-9\-]+)/i,
        /([A-Z]{2,3}[\-\s]?\d{4,}[\-\s]?\d*)/i,
        /INV[\-\s]?(\d{6,})/i
    ];

    for (const pattern of invNumPatterns) {
        const match = ocrText.match(pattern);
        if (match && match[1] && match[1].length >= 4) {
            result.invoiceNumber = match[1].replace(/\s+/g, '-');
            result.confidence.invoiceNumber = 0.7;
            break;
        }
    }

    // 提取日期 - 多种格式
    const datePatterns = [
        /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g,
        /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g,
        /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})/gi,
        /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})/gi
    ];

    const dates = [];
    for (const pattern of datePatterns) {
        const matches = ocrText.match(pattern);
        if (matches) {
            matches.forEach(m => {
                const normalized = normalizeDate(m);
                if (normalized && !dates.includes(normalized)) {
                    dates.push(normalized);
                }
            });
        }
    }

    if (dates.length > 0) {
        result.invoiceDate = dates[0];
        result.confidence.invoiceDate = 0.7;
        if (dates.length > 1) {
            result.dueDate = dates[1];
            result.confidence.dueDate = 0.6;
        }
    }

    // 提取金额和项目 - 更灵活的模式
    const amountPatterns = [
        // 格式: 描述 数量 x 单价 = 总价
        /(.{3,40}?)\s+(\d+)\s*[xX×]\s*\$?([\d,]+\.?\d*)/g,
        // 格式: 描述 $金额
        /(.{3,40}?)\s+\$\s*([\d,]+\.?\d{2})/g,
        // 格式: 数字开头的行 (可能是数量)
        /^(\d+)\s+(.{3,30}?)\s+\$?([\d,]+\.?\d*)/gm
    ];

    // 尝试第一种模式
    const pattern1 = /(.+?)\s+(\d+)\s*[xX×]?\s*[@\$]?\s*([\d,]+\.?\d*)\s*(?:[=:])?\s*\$?([\d,]+\.?\d*)?/g;
    let match;

    while ((match = pattern1.exec(ocrText)) !== null) {
        const description = match[1].trim();
        const quantity = parseInt(match[2]) || 1;
        const unitPrice = parseFloat((match[3] || '0').replace(',', '')) || 0;

        // 过滤掉无效或系统词汇
        const invalidWords = ['total', 'subtotal', 'tax', 'amount', 'due', 'date', 'invoice', 'from', 'to', 'bill'];
        const isInvalid = invalidWords.some(w => description.toLowerCase().includes(w));

        if (!isInvalid && description.length >= 3 && description.length <= 50 && unitPrice > 0) {
            result.items.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                description: cleanDescription(description),
                quantity,
                unitPrice,
                confidence: 0.6
            });
        }
    }

    // 提取电话号码
    const phonePattern = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const phones = [];
    while ((match = phonePattern.exec(ocrText)) !== null) {
        phones.push(`(${match[1]}) ${match[2]}-${match[3]}`);
    }

    // 提取邮箱
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = ocrText.match(emailPattern) || [];

    // 分配电话和邮箱
    if (phones.length > 0) result.sender.phone = phones[0];
    if (phones.length > 1) result.recipient.phone = phones[1];
    if (emails.length > 0) result.sender.email = emails[0];
    if (emails.length > 1) result.recipient.email = emails[1];

    // 尝试提取公司名称 - 查找大写开头的行
    const companyPatterns = [
        /^([A-Z][A-Za-z\s&.]+(?:Inc|LLC|Corp|Co|Ltd|Company)?\.?)$/gm,
        /^([A-Z][A-Za-z0-9\s&.,]+)$/gm
    ];

    const potentialCompanies = [];
    for (const pattern of companyPatterns) {
        while ((match = pattern.exec(ocrText)) !== null) {
            const name = match[1].trim();
            if (name.length >= 3 && name.length <= 50 && !name.match(/^(invoice|date|from|to|bill|total)/i)) {
                potentialCompanies.push(name);
            }
        }
    }

    if (potentialCompanies.length > 0) {
        result.sender.companyName = potentialCompanies[0];
        result.confidence.senderName = 0.5;
        if (potentialCompanies.length > 1) {
            result.recipient.companyName = potentialCompanies[1];
            result.confidence.recipientName = 0.5;
        }
    }

    return result;
}

/**
 * 清理描述文本
 */
function cleanDescription(text) {
    return text
        .replace(/^\d+\.\s*/, '') // 移除序号
        .replace(/\s+/g, ' ')     // 规范化空格
        .trim();
}

/**
 * 标准化日期格式
 */
function normalizeDate(dateStr) {
    try {
        // 尝试多种解析方式
        let date;

        // MM/DD/YYYY 或 DD/MM/YYYY
        const slashMatch = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
        if (slashMatch) {
            let [, a, b, year] = slashMatch;
            if (year.length === 2) year = '20' + year;
            // 假设 MM/DD/YYYY 格式 (美式)
            const month = parseInt(a);
            const day = parseInt(b);
            if (month <= 12 && day <= 31) {
                date = new Date(parseInt(year), month - 1, day);
            }
        }

        // YYYY-MM-DD
        const isoMatch = dateStr.match(/(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
        if (isoMatch) {
            const [, year, month, day] = isoMatch;
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }

        // 文字格式日期
        if (!date) {
            date = new Date(dateStr);
        }

        if (date && !isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        console.warn('Date parsing failed:', dateStr);
    }
    return null;
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
