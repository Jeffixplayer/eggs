import jsPDF from 'jspdf';

// Helper function to load image and convert to base64
const loadImageAsBase64 = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

// Helper function to wrap text
const wrapText = (text, maxWidth, fontSize = 12) => {
  if (!text) return [];
  
  const words = text.toString().split(' ');
  const lines = [];
  let currentLine = '';
  
  // Approximate character width (this is a rough estimate)
  const charWidth = fontSize * 0.6;
  const maxChars = Math.floor(maxWidth / charWidth);
  
  words.forEach(word => {
    if ((currentLine + word).length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
      }
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

// Helper function to add a section header
const addSectionHeader = (pdf, title, y, pageWidth) => {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setFillColor(59, 130, 246); // Primary blue
  pdf.rect(20, y - 2, pageWidth - 40, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.text(title, 25, y + 10);
  pdf.setTextColor(0, 0, 0);
  return y + 25;
};

// Main PDF generation function
export const generateWorkOrderPDF = async (workOrderData, userInfo = null) => {
  try {
    // Create new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentY = 20;
    
    // Header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246);
    pdf.text('WORK ORDER', pageWidth / 2, currentY, { align: 'center' });
    
    // Work order number
    currentY += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Order #: ${workOrderData.workOrderNumber || 'N/A'}`, pageWidth / 2, currentY, { align: 'center' });
    
    // Date and status
    currentY += 8;
    const createdDate = workOrderData.createdAt 
      ? (workOrderData.createdAt.toDate ? workOrderData.createdAt.toDate() : new Date(workOrderData.createdAt))
      : new Date();
    pdf.text(`Created: ${createdDate.toLocaleDateString()}`, pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 15;
    
    // Company Information Section
    currentY = addSectionHeader(pdf, 'COMPANY INFORMATION', currentY, pageWidth);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    
    const companyInfo = [
      ['Company Name:', workOrderData.companyName || 'N/A'],
      ['Contact Person:', workOrderData.contactPerson || 'N/A'],
      ['Phone Number:', workOrderData.phoneNumber || 'N/A'],
      ['Address:', workOrderData.postalAddress || 'N/A']
    ];
    
    companyInfo.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, 25, currentY);
      pdf.setFont('helvetica', 'normal');
      
      if (label === 'Address:' && value !== 'N/A') {
        const addressLines = wrapText(value, 120, 11);
        addressLines.forEach((line, index) => {
          pdf.text(line, 65, currentY + (index * 5));
        });
        currentY += Math.max(5, addressLines.length * 5);
      } else {
        pdf.text(value, 65, currentY);
        currentY += 7;
      }
    });
    
    currentY += 10;
    
    // Work Details Section
    currentY = addSectionHeader(pdf, 'WORK DETAILS', currentY, pageWidth);
    
    const workDetails = [
      ['Title:', workOrderData.title || 'N/A'],
      ['Category:', workOrderData.category || 'N/A'],
      ['Priority:', workOrderData.priority || 'N/A'],
      ['Status:', workOrderData.status || 'N/A'],
      ['Estimated Hours:', workOrderData.estimatedHours ? `${workOrderData.estimatedHours} hours` : 'N/A'],
      ['Location:', workOrderData.location || 'N/A'],
      ['Assigned To:', workOrderData.assignedTo || 'Unassigned']
    ];
    
    workDetails.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, 25, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, 65, currentY);
      currentY += 7;
    });
    
    // Work Description
    if (workOrderData.workDescription) {
      currentY += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Description:', 25, currentY);
      currentY += 7;
      
      pdf.setFont('helvetica', 'normal');
      const descriptionLines = wrapText(workOrderData.workDescription, 160, 11);
      descriptionLines.forEach(line => {
        pdf.text(line, 25, currentY);
        currentY += 5;
      });
    }
    
    // Materials/Tools
    if (workOrderData.materials) {
      currentY += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Materials/Tools Required:', 25, currentY);
      currentY += 7;
      
      pdf.setFont('helvetica', 'normal');
      const materialsLines = wrapText(workOrderData.materials, 160, 11);
      materialsLines.forEach(line => {
        pdf.text(line, 25, currentY);
        currentY += 5;
      });
    }
    
    currentY += 15;
    
    // Images Section
    if (workOrderData.images && workOrderData.images.length > 0) {
      // Check if we need a new page
      if (currentY > pageHeight - 80) {
        pdf.addPage();
        currentY = 20;
      }
      
      currentY = addSectionHeader(pdf, 'ATTACHED IMAGES', currentY, pageWidth);
      
      const imagesPerRow = 2;
      const imageWidth = 70;
      const imageHeight = 50;
      const spacing = 10;
      
      for (let i = 0; i < workOrderData.images.length; i++) {
        const image = workOrderData.images[i];
        const row = Math.floor(i / imagesPerRow);
        const col = i % imagesPerRow;
        
        const x = 25 + col * (imageWidth + spacing);
        const y = currentY + row * (imageHeight + spacing + 10);
        
        // Check if we need a new page
        if (y + imageHeight > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
          const newRow = 0;
          const newY = currentY + newRow * (imageHeight + spacing + 10);
          
          try {
            const imageData = await loadImageAsBase64(image.url);
            if (imageData) {
              pdf.addImage(imageData, 'JPEG', x, newY, imageWidth, imageHeight);
              
              // Add image caption
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(9);
              pdf.text(image.name || `Image ${i + 1}`, x, newY + imageHeight + 5);
            }
          } catch (error) {
            console.error('Error adding image to PDF:', error);
            // Add placeholder for failed image
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(x, newY, imageWidth, imageHeight);
            pdf.setFontSize(9);
            pdf.text('Image unavailable', x + imageWidth/2, newY + imageHeight/2, { align: 'center' });
          }
          
          currentY = newY + imageHeight + 15;
        } else {
          try {
            const imageData = await loadImageAsBase64(image.url);
            if (imageData) {
              pdf.addImage(imageData, 'JPEG', x, y, imageWidth, imageHeight);
              
              // Add image caption
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(9);
              pdf.text(image.name || `Image ${i + 1}`, x, y + imageHeight + 5);
            }
          } catch (error) {
            console.error('Error adding image to PDF:', error);
            // Add placeholder for failed image
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(x, y, imageWidth, imageHeight);
            pdf.setFontSize(9);
            pdf.text('Image unavailable', x + imageWidth/2, y + imageHeight/2, { align: 'center' });
          }
          
          if (col === imagesPerRow - 1 || i === workOrderData.images.length - 1) {
            currentY = y + imageHeight + 15;
          }
        }
      }
    }
    
    // Digital Signature Section
    if (workOrderData.signature) {
      // Check if we need a new page
      if (currentY > pageHeight - 100) {
        pdf.addPage();
        currentY = 20;
      }
      
      currentY = addSectionHeader(pdf, 'DIGITAL SIGNATURE', currentY, pageWidth);
      
      try {
        let signatureData;
        
        if (typeof workOrderData.signature === 'string') {
          // If signature is a base64 string
          signatureData = workOrderData.signature;
        } else if (workOrderData.signature.url) {
          // If signature is an object with URL
          signatureData = await loadImageAsBase64(workOrderData.signature.url);
        }
        
        if (signatureData) {
          const signatureWidth = 120;
          const signatureHeight = 60;
          const signatureX = 25;
          
          pdf.addImage(signatureData, 'PNG', signatureX, currentY, signatureWidth, signatureHeight);
          
          // Add signature info
          currentY += signatureHeight + 10;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.text('Signed by: ' + (workOrderData.submittedBy || userInfo?.displayName || 'User'), 25, currentY);
          
          if (workOrderData.signature.createdAt) {
            currentY += 5;
            const signatureDate = new Date(workOrderData.signature.createdAt);
            pdf.text('Date: ' + signatureDate.toLocaleString(), 25, currentY);
          }
        }
      } catch (error) {
        console.error('Error adding signature to PDF:', error);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.text('Digital signature unavailable', 25, currentY);
      }
      
      currentY += 20;
    }
    
    // Footer
    const footerY = pageHeight - 20;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Generated on: ' + new Date().toLocaleString(), 25, footerY);
    pdf.text('Work Order Management System', pageWidth - 25, footerY, { align: 'right' });
    
    // Generate filename
    const filename = `WorkOrder_${workOrderData.workOrderNumber || 'Draft'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    return {
      pdf,
      filename,
      blob: pdf.output('blob')
    };
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

// Function to download the PDF
export const downloadWorkOrderPDF = async (workOrderData, userInfo = null) => {
  try {
    const { pdf, filename } = await generateWorkOrderPDF(workOrderData, userInfo);
    pdf.save(filename);
    return filename;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

// Function to get PDF as blob for further processing
export const getWorkOrderPDFBlob = async (workOrderData, userInfo = null) => {
  try {
    const { blob } = await generateWorkOrderPDF(workOrderData, userInfo);
    return blob;
  } catch (error) {
    console.error('Error getting PDF blob:', error);
    throw error;
  }
};

// Preview function (opens PDF in new tab)
export const previewWorkOrderPDF = async (workOrderData, userInfo = null) => {
  try {
    const { pdf } = await generateWorkOrderPDF(workOrderData, userInfo);
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    // Clean up the URL after a delay
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    
    return pdfUrl;
  } catch (error) {
    console.error('Error previewing PDF:', error);
    throw error;
  }
};