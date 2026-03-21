import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI, businessAPI } from '../services/api';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import './PrintPreview.css';

const PrintPreview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    fetchBusinessDetails();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBusinessDetails = async () => {
    try {
      const response = await businessAPI.getDetails();
      setBusinessDetails(response.data.businessDetails);
    } catch (error) {
      console.error('Error fetching business details:', error);
      toast.error('Failed to load business details');
    }
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    import('jspdf').then(jsPDFModule => {
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      let y = 10;

      // Logo (base64 or URL)
      if (businessDetails?.businessLogo) {
        const img = new Image();
        img.src = businessDetails.businessLogo.startsWith('http')
          ? businessDetails.businessLogo
          : `${process.env.REACT_APP_API_URL}/uploads/${businessDetails.businessLogo}`;
        img.onload = () => {
          doc.addImage(img, 'PNG', 80, y, 50, 50);
          y += 55;
          addBillDetails(doc, y);
        };
      } else {
        addBillDetails(doc, y);
      }

      function addBillDetails(doc, yStart) {
        let y = yStart;

        // Company Name
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(businessDetails?.businessName || 'Company Name', 105, y, { align: 'center' });
        y += 8;

        // Company Info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (businessDetails) {
          const lines = [
            businessDetails.businessAddress || '',
            `Contact: ${businessDetails.phoneNumber || 'N/A'}`,
            `GSTIN: ${businessDetails.gstinNumber || 'N/A'}`,
            businessDetails.fssaiNumber ? `FSSAI: ${businessDetails.fssaiNumber}` : null
          ].filter(Boolean);

          lines.forEach(line => {
            doc.text(line, 105, y, { align: 'center' });
            y += 5;
          });
          y += 5;
        }

        // Order Info
        doc.text(`Order ID: ${order.id}`, 10, y);
        y += 6;
        doc.text(`Customer: ${order.customerPhone || 'N/A'}`, 10, y);
        y += 6;
        doc.text(`Payment: ${order.paymentMethod || 'N/A'}`, 10, y);
        y += 8;

        // Items
        order.orderItems.forEach(item => {
          const price = Number(item.item.price || 0);
          doc.text(`${item.item.name} x${item.quantity} - ₹${(price * item.quantity).toFixed(2)}`, 10, y);
          y += 6;
        });
        y += 6;

        // Totals
        const subtotal = order.orderItems.reduce(
          (sum, item) => sum + Number(item.item.price || 0) * item.quantity,
          0
        );
        const gstRate = Number(businessDetails?.gstSlab || 0);
        const gstAmount = (subtotal * gstRate) / 100;
        const total = subtotal + gstAmount;

        doc.setFont('helvetica', 'bold');
        doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 10, y);
        y += 6;
        doc.text(`GST (${gstRate}%): ₹${gstAmount.toFixed(2)}`, 10, y);
        y += 6;
        doc.text(`Grand Total: ₹${total.toFixed(2)}`, 10, y);

        doc.save(`bill_${order.id}.pdf`);
      }
    });
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!order) return null;

  const subtotal = order.orderItems.reduce(
    (sum, item) => sum + Number(item.item.price || 0) * item.quantity,
    0
  );
  const gstRate = Number(businessDetails?.gstSlab || 0);
  const gstAmount = (subtotal * gstRate) / 100;
  const total = subtotal + gstAmount;

  return (
    <div className="print-wrapper">
      <div className="no-print flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="btn btn-secondary mr-4">
          <ArrowLeft size={16} className="mr-2" /> Back
        </button>
      </div>

      <div className="bill-container">
        {businessDetails?.businessLogo && (
          <img
            src={
              businessDetails.businessLogo.startsWith('http')
                ? businessDetails.businessLogo
                : `${process.env.REACT_APP_API_URL}/uploads/${businessDetails.businessLogo}`
            }
            alt="Business Logo"
            className="mx-auto mb-2 w-24 h-24 object-contain"
          />
        )}

        <h2 className="company-name">{businessDetails?.businessName || 'Company Name'}</h2>
        <p className="company-info">
          {businessDetails?.businessAddress || 'Business Address'} <br />
          Contact: {businessDetails?.phoneNumber || 'N/A'} <br />
          GSTIN: {businessDetails?.gstinNumber || 'N/A'} <br />
          {businessDetails?.fssaiNumber && <>FSSAI: {businessDetails?.fssaiNumber}</>}
        </p>

    <div className="bill-meta grid grid-cols-2 gap-4 my-4">
  {/* Left side */}
  <div>
    <p><strong>Order ID:</strong> {order.id}</p>
    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
    <p><strong>Time:</strong> {new Date(order.createdAt).toLocaleTimeString()}</p>
  </div>

  {/* Right side */}
  <div className="text-right">
    <p><strong>Customer Ph.no:</strong> {order.customerPhone || 'N/A'}</p>
    <p><strong>Payment:</strong> {order.paymentMethod || 'N/A'}</p>
  </div>
</div>



        <table className="bill-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate (₹)</th>
              <th>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map(item => {
              const price = Number(item.item.price || 0);
              return (
                <tr key={item.itemId}>
                  <td>{item.item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{price.toFixed(2)}</td>
                  <td>₹{(price * item.quantity).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="bill-summary">
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p>GST ({gstRate}%): ₹{gstAmount.toFixed(2)}</p>
          <h3>Grand Total: ₹{total.toFixed(2)}</h3>
        </div>

        <p className="thank-you">Thank You! Visit Again.</p>
        <p className="footer">Finova — By Smart Stack Technologies</p>
      </div>

      <div className="no-print flex space-x-4 mt-6">
        <button onClick={handlePrint} className="btn btn-primary flex items-center">
          <Printer size={16} className="mr-2" /> Print
        </button>
        
      </div>
    </div>
  );
};

export default PrintPreview;
