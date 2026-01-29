import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * 生成 PDF Blob
 */
async function generatePDFBlob(element) {
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, 297));

    return pdf.output('blob');
}

/**
 * 检测是否支持 Web Share API
 */
function canShareFiles() {
    if (!navigator.share || !navigator.canShare) return false;
    const testFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    return navigator.canShare({ files: [testFile] });
}

/**
 * 导出并分享 PDF
 */
export async function exportToPDF(element, filename = 'invoice.pdf') {
    try {
        const pdfBlob = await generatePDFBlob(element);

        // 尝试使用 Web Share API (移动端)
        if (canShareFiles()) {
            const file = new File([pdfBlob], filename, { type: 'application/pdf' });

            try {
                await navigator.share({
                    files: [file],
                    title: 'Invoice',
                    text: 'Here is your invoice'
                });
                return { success: true, shared: true };
            } catch (shareError) {
                if (shareError.name !== 'AbortError') {
                    console.log('Share failed, falling back to download');
                } else {
                    return { success: false, cancelled: true };
                }
            }
        }

        // 回退：创建下载链接
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        // 移动端 Safari 需要特殊处理
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            window.open(url, '_blank');
        } else {
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        setTimeout(() => URL.revokeObjectURL(url), 5000);

        return { success: true };
    } catch (error) {
        console.error('PDF export error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 分享 PDF（移动端专用）
 */
export async function sharePDF(element, filename = 'invoice.pdf') {
    try {
        const pdfBlob = await generatePDFBlob(element);
        const file = new File([pdfBlob], filename, { type: 'application/pdf' });

        if (canShareFiles()) {
            await navigator.share({
                files: [file],
                title: 'Invoice',
                text: 'Here is your invoice'
            });
            return { success: true };
        } else {
            return exportToPDF(element, filename);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            return { success: false, cancelled: true };
        }
        console.error('Share error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 通过邮件发送 PDF（使用 Web Share API 或下载后发送）
 */
export async function emailPDFInvoice(element, invoice, calculated) {
    const { recipient, invoiceNumber, currency, sender } = invoice;
    const filename = `Invoice_${invoiceNumber}.pdf`;

    try {
        const pdfBlob = await generatePDFBlob(element);
        const file = new File([pdfBlob], filename, { type: 'application/pdf' });

        // 移动端：使用 Web Share API 分享到邮件应用
        if (canShareFiles()) {
            const formatCurrency = (amount) => {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency || 'USD'
                }).format(amount || 0);
            };

            const emailBody = `Dear ${recipient.companyName || 'Client'},

Please find attached invoice ${invoiceNumber}.

Invoice Summary:
• Invoice Number: ${invoiceNumber}
• Invoice Date: ${invoice.invoiceDate}
• Due Date: ${invoice.dueDate}
• Amount Due: ${formatCurrency(calculated.total)}

Thank you for your business!

Best regards,
${sender.companyName || ''}`;

            try {
                await navigator.share({
                    files: [file],
                    title: `Invoice ${invoiceNumber}`,
                    text: emailBody
                });
                return { success: true, method: 'share' };
            } catch (shareError) {
                if (shareError.name === 'AbortError') {
                    return { success: false, cancelled: true };
                }
            }
        }

        // 桌面端：先下载 PDF，然后打开邮件客户端
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 5000);

        // 延迟打开邮件客户端，让用户先看到下载
        setTimeout(() => {
            openEmailClient(invoice, calculated);
        }, 500);

        return { success: true, method: 'download_then_email' };
    } catch (error) {
        console.error('Email PDF error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 打开邮件客户端（不含附件）
 */
export function openEmailClient(invoice, calculated) {
    const { recipient, invoiceNumber, currency, sender } = invoice;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD'
        }).format(amount || 0);
    };

    const subject = `Invoice ${invoiceNumber} from ${sender.companyName || 'Your Company'}`;
    const body = `Dear ${recipient.companyName || 'Client'},

Please find attached invoice ${invoiceNumber}.

Invoice Summary:
- Invoice Number: ${invoiceNumber}
- Invoice Date: ${invoice.invoiceDate}
- Due Date: ${invoice.dueDate}
- Amount Due: ${formatCurrency(calculated.total)}

Thank you for your business!

Best regards,
${sender.companyName || ''}
${sender.email || ''}`;

    const params = new URLSearchParams();
    params.append('subject', subject);
    params.append('body', body);

    window.location.href = `mailto:${recipient.email || ''}?${params.toString()}`;
}
