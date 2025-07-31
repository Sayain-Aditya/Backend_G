const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Generate PDF invoice
const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filename = `invoice-${order._id}.pdf`;
    const filepath = path.join(__dirname, '../temp', filename);

    // Ensure temp directory exists
    const tempDir = path.dirname(filepath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    doc.pipe(fs.createWriteStream(filepath));

    // Header
    doc.fontSize(20).text('FreshMart Invoice', 50, 50);
    doc.fontSize(12).text(`Order ID: ${order._id}`, 50, 80);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 95);
    doc.text(`Payment: ${order.paymentMethod}`, 50, 110);

    // Customer Info
    doc.text('Delivery Address:', 50, 140);
    doc.text(`${order.address.fullName}`, 50, 155);
    doc.text(`${order.address.street}`, 50, 170);
    doc.text(`${order.address.city}, ${order.address.state} ${order.address.zip}`, 50, 185);
    doc.text(`Phone: ${order.address.phone}`, 50, 200);

    // Items table
    doc.text('Items:', 50, 230);
    let yPosition = 250;
    
    order.items.forEach((item) => {
      doc.text(`${item.product.name}`, 50, yPosition);
      doc.text(`Qty: ${item.quantity}`, 300, yPosition);
      doc.text(`₹${(item.product.price * item.quantity).toFixed(2)}`, 450, yPosition);
      yPosition += 20;
    });

    // Total
    doc.text(`Total: ₹${order.total.toFixed(2)}`, 400, yPosition + 20);

    doc.end();

    doc.on('end', () => resolve(filepath));
    doc.on('error', reject);
  });
};

// Send email with invoice
const sendInvoiceEmail = async (order, userEmail) => {
  console.log('=== EMAIL SERVICE STARTED ===');
  console.log('Sending email to:', userEmail);
  console.log('Email config:', {
    user: process.env.EMAIL_USER,
    passLength: process.env.EMAIL_PASS?.length
  });
  
  try {
    // Generate PDF first
    console.log('Generating PDF...');
    const pdfPath = await generateInvoicePDF(order);
    console.log('PDF generated successfully at:', pdfPath);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Order Confirmation - ${order._id}`,
      text: `Thank you for your order! Order ID: ${order._id}, Total: ₹${order.total}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Your order has been placed successfully.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p>Please find your invoice attached.</p>
        <br>
        <p>Best regards,<br>FreshMart Team</p>
      `,
      attachments: [
        {
          filename: `invoice-${order._id}.pdf`,
          path: pdfPath
        }
      ]
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('Message ID:', result.messageId);
    
    // Clean up temp file
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
      console.log('PDF file cleaned up');
    }
    
  } catch (error) {
    console.error('❌ EMAIL FAILED!');
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw error;
  }
};

module.exports = { sendInvoiceEmail };