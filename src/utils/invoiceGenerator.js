import { v4 as uuidv4 } from 'uuid';

/**
 * 生成发票编号
 * 格式: INV-YYYYMMDD-XXXX
 */
export function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    return `INV-${year}${month}${day}-${random}`;
}

/**
 * 获取今天的日期字符串
 * 格式: YYYY-MM-DD
 */
export function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * 获取30天后的日期字符串（默认到期日）
 * 格式: YYYY-MM-DD
 */
export function getDefaultDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
}

/**
 * 格式化日期为美式格式
 * @param {string} dateString - YYYY-MM-DD 格式
 * @returns {string} - Month DD, YYYY 格式
 */
export function formatDateUS(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * 格式化货币
 * @param {number} amount - 金额
 * @param {string} currency - 货币代码 (默认 USD)
 * @returns {string} - 格式化后的货币字符串
 */
export function formatCurrency(amount, currency = 'USD') {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return formatter.format(amount || 0);
}

/**
 * 计算行项目小计
 * @param {Object} item - 行项目 { quantity, unitPrice }
 * @returns {number} - 小计金额
 */
export function calculateLineTotal(item) {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    return quantity * unitPrice;
}

/**
 * 计算发票小计
 * @param {Array} items - 行项目数组
 * @returns {number} - 小计金额
 */
export function calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
}

/**
 * 计算税额
 * @param {number} subtotal - 小计
 * @param {number} taxRate - 税率 (百分比)
 * @returns {number} - 税额
 */
export function calculateTax(subtotal, taxRate) {
    return subtotal * (parseFloat(taxRate) || 0) / 100;
}

/**
 * 计算总计
 * @param {number} subtotal - 小计
 * @param {number} tax - 税额
 * @returns {number} - 总计
 */
export function calculateTotal(subtotal, tax) {
    return subtotal + tax;
}

/**
 * 创建空白发票数据
 */
export function createEmptyInvoice() {
    return {
        // 发送方信息
        sender: {
            companyName: '',
            address: '',
            phone: '',
            email: ''
        },
        // 收件方信息
        recipient: {
            companyName: '',
            address: '',
            phone: '',
            email: ''
        },
        // 发票详情
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: getTodayDate(),
        dueDate: getDefaultDueDate(),
        currency: 'USD',
        // 行项目
        items: [
            {
                id: uuidv4(),
                description: '',
                quantity: 1,
                unitPrice: 0
            }
        ],
        // 税率
        taxRate: 0,
        // 备注
        notes: ''
    };
}

/**
 * 创建空白行项目
 */
export function createEmptyLineItem() {
    return {
        id: uuidv4(),
        description: '',
        quantity: 1,
        unitPrice: 0
    };
}

/**
 * 验证发票数据
 * @param {Object} invoice - 发票数据
 * @returns {Object} - { isValid, errors }
 */
export function validateInvoice(invoice) {
    const errors = [];

    // 验证发送方
    if (!invoice.sender.companyName?.trim()) {
        errors.push('请填写发送方公司名称');
    }

    // 验证收件方
    if (!invoice.recipient.companyName?.trim()) {
        errors.push('请填写收件方公司名称');
    }

    // 验证发票编号
    if (!invoice.invoiceNumber?.trim()) {
        errors.push('请填写发票编号');
    }

    // 验证日期
    if (!invoice.invoiceDate) {
        errors.push('请选择发票日期');
    }

    // 验证行项目
    const validItems = invoice.items.filter(item =>
        item.description?.trim() &&
        parseFloat(item.quantity) > 0 &&
        parseFloat(item.unitPrice) >= 0
    );

    if (validItems.length === 0) {
        errors.push('请至少添加一个有效的行项目');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * 货币列表
 */
export const CURRENCIES = [
    { code: 'USD', name: '美元', symbol: '$' },
    { code: 'CNY', name: '人民币', symbol: '¥' },
    { code: 'EUR', name: '欧元', symbol: '€' },
    { code: 'GBP', name: '英镑', symbol: '£' },
    { code: 'JPY', name: '日元', symbol: '¥' },
    { code: 'CAD', name: '加元', symbol: '$' },
    { code: 'AUD', name: '澳元', symbol: '$' }
];
