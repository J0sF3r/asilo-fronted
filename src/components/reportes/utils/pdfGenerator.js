import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ✅ Logo en Base64 - REEMPLAZA CON TU LOGO REAL
// Para convertir tu logo: https://base64.guru/converter/encode/image
const LOGO_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJlN2QzMiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCI+QTwvdGV4dD48L3N2Zz4=';

export const generarPDFCobros = (datos, familiar, fechaInicio, fechaFin) => {
    const doc = new jsPDF();
    
    // Agregar logo si existe
    if (LOGO_BASE64 && LOGO_BASE64.length > 100) {
        try {
            doc.addImage(LOGO_BASE64, 'PNG', 14, 10, 30, 30);
        } catch (error) {
            console.warn('No se pudo agregar el logo:', error);
        }
    }
    
    // Encabezado
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Asilo de Ancianos Cabeza de Algodón', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Reporte de Cobros por Familiar', 105, 28, { align: 'center' });
    
    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.line(14, 33, 196, 33);
    
    // Información del familiar
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Familiar: ${familiar.nombre}`, 14, 40);
    doc.text(`Período: ${new Date(fechaInicio).toLocaleDateString('es-GT')} - ${new Date(fechaFin).toLocaleDateString('es-GT')}`, 14, 46);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-GT')}`, 14, 52);
    
    // Preparar datos de la tabla
    const tableData = datos.transacciones.map(t => [
        new Date(t.fecha).toLocaleDateString('es-GT'),
        t.tipo,
        t.descripcion,
        `Q${parseFloat(t.monto_original || t.monto).toFixed(2)}`,
        t.descuento_aplicado ? `${t.descuento_aplicado}%` : '-',
        `Q${parseFloat(t.monto).toFixed(2)}`,
        t.estado_pago || '-'
    ]);
    
    // Generar tabla
    autoTable(doc, {
        startY: 58,
        head: [['Fecha', 'Tipo', 'Descripción', 'Monto Original', 'Desc.', 'Monto Final', 'Estado']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
            fillColor: [46, 125, 50],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 9
        },
        styles: { 
            fontSize: 8,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 32 },
            2: { cellWidth: 48 },
            3: { cellWidth: 23, halign: 'right' },
            4: { cellWidth: 15, halign: 'center' },
            5: { cellWidth: 23, halign: 'right' },
            6: { cellWidth: 20, halign: 'center' }
        },
        alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    // ✅ CORRECCIÓN: Usar lastAutoTable en lugar de previousAutoTable
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Resumen
    doc.setFillColor(240, 240, 240);
    doc.rect(14, finalY, 182, 35, 'F');
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(46, 125, 50);
    doc.text('Resumen Financiero', 20, finalY + 8);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    doc.text('Total Cargos:', 20, finalY + 16);
    doc.text(`Q${datos.totalCargos}`, 70, finalY + 16);
    
    doc.text('Total Descuentos:', 20, finalY + 23);
    doc.setTextColor(46, 125, 50);
    doc.text(`-Q${datos.totalDescuentos}`, 70, finalY + 23);
    
    doc.setTextColor(0, 0, 0);
    doc.text('Total Pagado:', 20, finalY + 30);
    doc.text(`Q${datos.totalPagado}`, 70, finalY + 30);
    
    doc.setFont(undefined, 'bold');
    doc.text('Balance Pendiente:', 110, finalY + 23);
    doc.setTextColor(211, 47, 47);
    doc.text(`Q${datos.balancePendiente}`, 165, finalY + 23);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont(undefined, 'normal');
    doc.text('Documento generado electrónicamente', 105, 285, { align: 'center' });
    
    // Guardar
    const nombreArchivo = `Reporte_Cobros_${familiar.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);
};