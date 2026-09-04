import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function sanitizeFilename(name) {
  return name.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').slice(0, 80);
}

async function captureExportNode(node) {
  return html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
  });
}

export async function downloadTraceAsPng(node, filename = 'manual-tracing') {
  if (!node) throw new Error('Nothing to export.');
  const canvas = await captureExportNode(node);
  const link = document.createElement('a');
  link.download = `${sanitizeFilename(filename)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function downloadTraceAsPdf(node, filename = 'manual-tracing') {
  if (!node) throw new Error('Nothing to export.');
  const canvas = await captureExportNode(node);
  const imgData = canvas.toDataURL('image/png');

  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 10;
  const contentWidth = pdfWidth - margin * 2;

  const imgHeight = (canvas.height * contentWidth) / canvas.width;
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  let heightLeft = imgHeight;
  let position = margin;

  pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
  heightLeft -= pdfHeight - margin * 2;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + margin;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
    heightLeft -= pdfHeight - margin * 2;
  }

  pdf.save(`${sanitizeFilename(filename)}.pdf`);
}
