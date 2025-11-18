
import type { SentimentResult } from '../types';

declare const jspdf: any;

// Utility to create and trigger a file download
const downloadFile = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

// Export as JSON
export const exportAsJSON = (data: SentimentResult[]) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadFile(blob, 'sentiment_analysis_results.json');
};

// Export as CSV
export const exportAsCSV = (data: SentimentResult[]) => {
  const headers = ['Text', 'Sentiment', 'Confidence', 'Keywords', 'Explanation'];
  const rows = data.map(item => [
    `"${item.originalText.replace(/"/g, '""')}"`,
    item.sentiment,
    item.confidence.toFixed(2),
    `"${item.keywords.join(', ')}"`,
    `"${item.explanation.replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, 'sentiment_analysis_results.csv');
};

// Export as PDF
export const exportAsPDF = (data: SentimentResult[]) => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.text('Sentiment Analysis Results', 14, 16);
  
  const tableColumn = ['#', 'Text', 'Sentiment', 'Confidence', 'Keywords', 'Explanation'];
  const tableRows: (string | number)[][] = [];

  data.forEach((item, index) => {
    const row = [
      index + 1,
      item.originalText,
      item.sentiment,
      item.confidence.toFixed(2),
      item.keywords.join(', '),
      item.explanation
    ];
    tableRows.push(row);
  });
  
  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] },
    columnStyles: {
      1: { cellWidth: 50 },
      5: { cellWidth: 60 }
    }
  });

  doc.save('sentiment_analysis_results.pdf');
};
