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
function canShare() {
    return navigator.share && navigator.canShare;
}

/**
 * 导出并分享 PDF
 */
export async function exportToPDF(element, filename = 'invoice.pdf') {
    try {
        const pdfBlob = await generatePDFBlob(element);

        // 尝试使用 Web Share API (移动端)
        if (canShare()) {
            const file = new File([pdfBlob], filename, { type: 'application/pdf' });

            if (navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Invoice',
                        text: 'Here is your invoice'
                    });
                    return { success: true, shared: true };
                } catch (shareError) {
                    // 用户取消或分享失败，回退到下载
                    if (shareError.name !== 'AbortError') {
                        console.log('Share failed, falling back to download');
                    }
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
            // 在新窗口打开 PDF
            window.open(url, '_blank');
        } else {
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // 延迟释放 URL
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

        if (canShare() && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Invoice',
                text: 'Here is your invoice'
            });
            return { success: true };
        } else {
            // 不支持分享，回退到下载
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
 * 打开邮件客户端发送发票
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
