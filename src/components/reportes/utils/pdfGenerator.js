import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ✅ Agrega tu logo en Base64 aquí (reemplaza con tu logo real)
const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP4z8AAAAMBAQD3A0FDAAAAAElFTkSuQmCC';
// ☝️ REEMPLAZA ESTO CON TU LOGO EN BASE64

export const generarPDFCobros = (datos, familiar, fechaInicio, fechaFin) => {
    const doc = new jsPDF();
    
    // Agregar logo
    if (LOGO_BASE64 && LOGO_BASE64.length > 100) {
        try {
            doc.addImage(LOGO_BASE64, 'PNG', 14, 10, 30, 30);
        } catch (error) {
            console.error('Error al agregar logo:', error);
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
    
    // Tabla
    const tableData = datos.transacciones.map(t => [
        new Date(t.fecha).toLocaleDateString('es-GT'),
        t.tipo,
        t.descripcion,
        `Q${parseFloat(t.monto_original || t.monto).toFixed(2)}`,
        t.descuento_aplicado ? `${t.descuento_aplicado}%` : '-',
        `Q${parseFloat(t.monto).toFixed(2)}`,
        t.estado_pago || '-'
    ]);
    
    autoTable(doc, {
        startY: 58,
        head: [['Fecha', 'Tipo', 'Descripción', 'Monto Original', 'Desc.', 'Monto Final', 'Estado']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
            fillColor: [46, 125, 50],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
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
        }
    });
    
    // Resumen
    const finalY = doc.previousAutoTable.finalY + 10;
    
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
    doc.save(`Reporte_Cobros_${familiar.nombre.replace(/\s+/g, '_')}.pdf`);
};