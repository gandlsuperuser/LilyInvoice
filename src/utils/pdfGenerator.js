import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * 将发票预览元素导出为 PDF
 */
export async function exportToPDF(element, filename = 'invoice.pdf') {
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(filename);

        return { success: true };
    } catch (error) {
        console.error('PDF export error:', error);
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

    const subject = `Invoice ${invoiceNumber} from ${sender.companyName}`;
    const body = `Dear ${recipient.companyName},

Please find attached invoice ${invoiceNumber}.

Invoice Summary:
- Invoice Number: ${invoiceNumber}
- Invoice Date: ${invoice.invoiceDate}
- Due Date: ${invoice.dueDate}
- Amount Due: ${formatCurrency(calculated.total)}

Thank you for your business!

Best regards,
${sender.companyName}
${sender.email}`;

    const params = new URLSearchParams();
    params.append('subject', subject);
    params.append('body', body);

    window.open(`mailto:${recipient.email || ''}?${params.toString()}`, '_blank');
}
