import jsPDF from 'jspdf';
import type { Order } from '../hooks/useFetchOrders';

interface FinanceReportData {
    orders: Order[];
    startDate: Date;
    endDate: Date;
    totalRevenue: number;
    totalGST: number;
    totalShipping: number;
    totalSubtotal: number;
    netRevenue: number;
    refundedAmount: number;
    totalOrders: number;
    paidOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
}

export const generateFinanceReportPDF = (data: FinanceReportData, reportType: string = 'Finance Report') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Colors
    const primaryColor: [number, number, number] = [37, 99, 235]; // blue-600
    const grayColor: [number, number, number] = [107, 114, 128]; // gray-500
    const darkGrayColor: [number, number, number] = [31, 41, 55]; // gray-800

    // Header Section
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 50, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(reportType.toUpperCase(), margin, 30);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
        `Period: ${data.startDate.toLocaleDateString('en-IN')} to ${data.endDate.toLocaleDateString('en-IN')}`,
        pageWidth - margin,
        20,
        { align: 'right' }
    );
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, 28, { align: 'right' });
    doc.text(`Report ID: FIN-${Date.now()}`, pageWidth - margin, 36, { align: 'right' });

    yPos = 60;

    // Company Info
    doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CITSPRAY', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    yPos += 5;
    doc.text('Financial Report', margin, yPos);

    yPos = 80;

    // Summary Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Financial Summary', margin, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Summary Table
    const summaryData = [
        { label: 'Total Orders', value: data.totalOrders, format: 'number' },
        { label: 'Paid Orders', value: data.paidOrders, format: 'number' },
        { label: 'Pending Orders', value: data.pendingOrders, format: 'number' },
        { label: 'Cancelled Orders', value: data.cancelledOrders, format: 'number' },
        { label: 'Total Revenue', value: data.totalRevenue, format: 'currency' },
        { label: 'Total Subtotal', value: data.totalSubtotal, format: 'currency' },
        { label: 'Total GST', value: data.totalGST, format: 'currency' },
        { label: 'Shipping Charges', value: data.totalShipping, format: 'currency' },
        { label: 'Refunded Amount', value: data.refundedAmount, format: 'currency' },
        { label: 'Net Revenue', value: data.netRevenue, format: 'currency' },
        { label: 'Average Order Value', value: data.averageOrderValue, format: 'currency' },
    ];

    summaryData.forEach((item, index) => {
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = margin;
        }

        const value =
            item.format === 'currency'
                ? `₹${item.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : item.value.toString();

        doc.setFont('helvetica', 'normal');
        doc.text(item.label + ':', margin, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(value, pageWidth - margin, yPos, { align: 'right' });
        yPos += 7;

        if (index === 3 || index === 9) {
            // Add separator after cancelled orders and before net revenue
            yPos += 2;
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 5;
        }
    });

    // Order Details Section
    if (data.orders.length > 0) {
        yPos += 10;
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = margin;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('Order Details', margin, yPos);
        yPos += 10;

        // Table Header
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');

        doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Order ID', margin + 2, yPos);
        doc.text('Date', margin + 40, yPos);
        doc.text('Customer', margin + 65, yPos);
        doc.text('Status', margin + 110, yPos);
        doc.text('Amount', margin + 135, yPos);

        yPos += 10;

        // Table Rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);

        let ordersShown = 0;
        const maxOrdersPerPage = 20;

        data.orders.forEach((order) => {
            if (ordersShown >= maxOrdersPerPage) {
                doc.addPage();
                yPos = margin;
                ordersShown = 0;

                // Repeat header
                doc.setFillColor(240, 240, 240);
                doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
                doc.setTextColor(darkGrayColor[0], darkGrayColor[1], darkGrayColor[2]);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('Order ID', margin + 2, yPos);
                doc.text('Date', margin + 40, yPos);
                doc.text('Customer', margin + 65, yPos);
                doc.text('Status', margin + 110, yPos);
                doc.text('Amount', margin + 135, yPos);
                yPos += 10;
            }

            if (yPos > pageHeight - 30) {
                doc.addPage();
                yPos = margin;
                ordersShown = 0;
            }

            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
            });
            const customerName = order.customer?.name || 'N/A';
            const status = order.status.toUpperCase();
            const amount = `₹${(order.totals?.grandTotal || 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;

            doc.setFontSize(8);
            doc.text(order.orderId.substring(0, 12), margin + 2, yPos);
            doc.text(orderDate, margin + 40, yPos);
            doc.text(customerName.substring(0, 20), margin + 65, yPos);
            doc.text(status.substring(0, 12), margin + 110, yPos);
            doc.text(amount, margin + 135, yPos, { align: 'right' });

            yPos += 6;
            ordersShown++;
        });
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        yPos = pageHeight - 20;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.setFont('helvetica', 'normal');
        doc.text('This is a computer-generated financial report.', margin, yPos);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, yPos, { align: 'right' });
    }

    // Generate filename
    const dateStr = `${data.startDate.toISOString().split('T')[0]}_to_${data.endDate.toISOString().split('T')[0]}`;
    const filename = `Finance_Report_${dateStr}.pdf`;

    // Save PDF
    doc.save(filename);
};

export const generateFinanceReportCSV = (data: FinanceReportData) => {
    // CSV Header
    let csv = 'Finance Report\n';
    csv += `Period: ${data.startDate.toLocaleDateString('en-IN')} to ${data.endDate.toLocaleDateString('en-IN')}\n`;
    csv += `Generated: ${new Date().toLocaleDateString('en-IN')}\n\n`;

    // Summary Section
    csv += 'Financial Summary\n';
    csv += 'Metric,Value\n';
    csv += `Total Orders,${data.totalOrders}\n`;
    csv += `Paid Orders,${data.paidOrders}\n`;
    csv += `Pending Orders,${data.pendingOrders}\n`;
    csv += `Cancelled Orders,${data.cancelledOrders}\n`;
    csv += `Total Revenue,${data.totalRevenue}\n`;
    csv += `Total Subtotal,${data.totalSubtotal}\n`;
    csv += `Total GST,${data.totalGST}\n`;
    csv += `Shipping Charges,${data.totalShipping}\n`;
    csv += `Refunded Amount,${data.refundedAmount}\n`;
    csv += `Net Revenue,${data.netRevenue}\n`;
    csv += `Average Order Value,${data.averageOrderValue}\n\n`;

    // Order Details
    csv += 'Order Details\n';
    csv += 'Order ID,Date,Customer,Status,Subtotal,GST,Shipping,Grand Total\n';

    data.orders.forEach((order) => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN');
        const customerName = (order.customer?.name || 'N/A').replace(/,/g, ' ');
        const status = order.status;
        const subtotal = order.totals?.subTotal || 0;
        const gst = order.totals?.totalGst || 0;
        const shipping = order.shippingCharge || 0;
        const grandTotal = order.totals?.grandTotal || 0;

        csv += `${order.orderId},${orderDate},"${customerName}",${status},${subtotal},${gst},${shipping},${grandTotal}\n`;
    });

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);

    const dateStr = `${data.startDate.toISOString().split('T')[0]}_to_${data.endDate.toISOString().split('T')[0]}`;
    link.setAttribute('download', `Finance_Report_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

