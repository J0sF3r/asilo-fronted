import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generarPDFCobros = (datos, familiar, fechaInicio, fechaFin) => {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Asilo de Ancianos Cabeza de Algodón', 105, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Reporte de Cobros por Familiar', 105, 25, { align: 'center' });
    
    // Información del familiar
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Familiar: ${familiar.nombre}`, 14, 35);
    doc.text(`Período: ${new Date(fechaInicio).toLocaleDateString('es-GT')} - ${new Date(fechaFin).toLocaleDateString('es-GT')}`, 14, 42);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-GT')}`, 14, 49);
    
    // Tabla de transacciones
    const tableData = datos.transacciones.map(t => [
        new Date(t.fecha).toLocaleDateString('es-GT'),
        t.tipo,
        t.descripcion,
        `Q${parseFloat(t.monto_original || t.monto).toFixed(2)}`,
        t.descuento_aplicado ? `${t.descuento_aplicado}%` : '-',
        `Q${parseFloat(t.monto).toFixed(2)}`,
        t.estado_pago || '-'
    ]);
    
    doc.autoTable({
        startY: 55,
        head: [['Fecha', 'Tipo', 'Descripción', 'Monto Original', 'Desc.', 'Monto Final', 'Estado']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [46, 125, 50] },
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 35 },
            2: { cellWidth: 50 },
            3: { cellWidth: 25 },
            4: { cellWidth: 15 },
            5: { cellWidth: 25 },
            6: { cellWidth: 20 }
        }
    });
    
    // Resumen
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Resumen', 14, finalY);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Total Cargos: Q${datos.totalCargos}`, 14, finalY + 8);
    doc.text(`Total Descuentos: -Q${datos.totalDescuentos}`, 14, finalY + 15);
    doc.text(`Total Pagado: Q${datos.totalPagado}`, 14, finalY + 22);
    
    doc.setFont(undefined, 'bold');
    doc.text(`Balance Pendiente: Q${datos.balancePendiente}`, 14, finalY + 29);
    
    // Guardar
    doc.save(`Reporte_Cobros_${familiar.nombre.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
};