const { jsPDF } = require('jspdf');
const { default: autoTable } = require('jspdf-autotable');

const doc = new jsPDF();
const tableColumn = ["Fecha", "Concepto / Cuenta", "Debe", "Haber"];
const tableRows = [];

// Mock entries
const entries = [
  {
    id: "1",
    date: new Date().toISOString(),
    concept: "Venta de servicios de prueba",
    reference: "REF-001",
    entries: [
      { id: "e1", accountId: "1.1.01", description: "Caja", debit: 121000.0, credit: 0.0 },
      { id: "e2", accountId: "4.1.01", description: "Ventas de Servicios", debit: 0.0, credit: 100000.0 },
      { id: "e3", accountId: "2.1.05", description: "IVA Débito Fiscal", debit: 0.0, credit: 21000.0 }
    ]
  }
];

entries.forEach(journal => {
    // Main row
    tableRows.push([
        new Date(journal.date).toLocaleDateString('es-AR'),
        journal.concept + (journal.reference ? ` (Ref: ${journal.reference})` : ''),
        '',
        ''
    ]);

    // Entry rows
    journal.entries.forEach((entry) => {
        tableRows.push([
            '',
            `  ${entry.accountId} ${entry.description ? '- ' + entry.description : ''}`,
            entry.debit > 0 ? `$${entry.debit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '',
            entry.credit > 0 ? `$${entry.credit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : ''
        ]);
    });
    // Blank row for separation
    tableRows.push(['', '', '', '']);
});

console.log("Calling autoTable...");
try {
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    console.log("autoTable succeeded!");
    
    // Save to a string/buffer
    const output = doc.output();
    console.log("PDF generated successfully! Output length:", output.length);
} catch (error) {
    console.error("Error generating PDF:", error);
}
