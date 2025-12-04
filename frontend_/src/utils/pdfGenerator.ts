import jsPDF from 'jspdf';
import type { Order } from '../hooks/useFetchOrders';

interface Customer {
    name: string;
    phones?: string[];
    email?: string;
    gst?: string;
    billing?: {
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
}

export const generateOrderBillPDF = (order: Order, customer?: Customer | null) => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    let y = margin;

    const primary: [number, number, number] = [30, 64, 175];
    const dark: [number, number, number] = [33, 37, 41];
    const gray: [number, number, number] = [100, 100, 100];
    const lightBg: [number, number, number] = [245, 245, 245];

    // ---------------- HEADER ----------------
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', margin, 28);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No : ${order.orderId}`, pageWidth - margin, 18, { align: 'right' });
    doc.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, pageWidth - margin, 26, { align: 'right' });

    y = 55;

    // ---------------- FROM SECTION ----------------
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('From:', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    y += 7;
    doc.text('CITSPRAY', margin, y);
    y += 5;
    doc.text('Address Line 1', margin, y);
    y += 5;
    doc.text('City, State - PINCODE', margin, y);
    y += 5;
    doc.text('GSTIN: XXXXXXXXXXXXXX', margin, y);

    // ---------------- CUSTOMER SECTION ----------------
    y = 55;
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', pageWidth / 2, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    y += 7;

    const custName = customer?.name || order.customer?.name || 'N/A';
    doc.text(custName, pageWidth / 2, y);

    if (customer?.billing?.address) {
        y += 5;
        doc.text(customer.billing.address, pageWidth / 2, y);
    }
    if (customer?.billing?.city) {
        y += 5;
        doc.text(
            `${customer.billing.city}, ${customer.billing.state || ''} - ${customer.billing.pincode || ''}`,
            pageWidth / 2,
            y
        );
    }

    const custPhone = customer?.phones?.[0] || order.customer?.phones?.[0];
    if (custPhone) {
        y += 5;
        doc.text(`Phone: ${custPhone}`, pageWidth / 2, y);
    }

    const custEmail = customer?.email || order.customer?.email;
    if (custEmail) {
        y += 5;
        doc.text(`Email: ${custEmail}`, pageWidth / 2, y);
    }

    if (customer?.gst) {
        y += 5;
        doc.text(`GSTIN: ${customer.gst}`, pageWidth / 2, y);
    }

    // ---------------- ITEMS TABLE ----------------
    y = 105;

    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(margin, y - 6, pageWidth - margin * 2, 12, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.setFontSize(10);

    const col = {
        sno: margin + 2,
        name: margin + 22,
        qty: margin + 95,
        rate: margin + 115,
        gst: margin + 140,
        amt: margin + 165,
    };

    doc.text('S.No', col.sno, y);
    doc.text('Product Name', col.name, y);
    doc.text('Qty', col.qty, y);
    doc.text('Rate', col.rate, y);
    doc.text('GST', col.gst, y);
    doc.text('Amount', col.amt, y);

    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    let counter = 1;

    order.items.forEach(item => {
        if (y > pageHeight - 60) {
            doc.addPage();
            y = margin;
        }

        doc.setFontSize(9);
        doc.text(counter.toString(), col.sno, y);
        doc.text(item.productName || 'N/A', col.name, y);
        doc.text(`${item.qty} ${item.unit}`, col.qty, y);
        doc.text(`₹${item.rate.toFixed(2)}`, col.rate, y);
        doc.text(item.isGstApplicable ? `${item.gstPercent}%` : 'N/A', col.gst, y);
        doc.text(`₹${item.amount.toFixed(2)}`, col.amt, y);

        y += 7;
        counter++;
    });

    // ---------------- TOTALS ----------------
    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin + 95, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.text('Subtotal:', margin + 95, y);
    doc.text(`₹${order.totals.subTotal.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    y += 7;

    doc.text('GST:', margin + 95, y);
    doc.text(`₹${order.totals.totalGst.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    y += 7;

    if (order.shippingCharge > 0) {
        doc.text('Shipping Charge:', margin + 95, y);
        doc.text(`₹${order.shippingCharge.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
        y += 7;
    }

    y += 4;
    doc.setLineWidth(0.5);
    doc.setDrawColor(primary[0], primary[1], primary[2]);
    doc.line(margin + 95, y, pageWidth - margin, y);
    y += 9;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text('Grand Total:', margin + 95, y);
    doc.text(`₹${order.totals.grandTotal.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });

    // ---------------- FOOTER ----------------
    y = pageHeight - 25;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y - 5, pageWidth - margin, y - 5);

    doc.setFontSize(8);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', margin, y);
    doc.text('This is a computer-generated invoice.', pageWidth - margin, y, { align: 'right' });

    doc.save(`Invoice-${order.orderId}.pdf`);
};
