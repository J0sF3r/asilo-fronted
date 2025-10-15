import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const generarExcelCobros = (datos, familiar, fechaInicio, fechaFin) => {
    // Información del encabezado
    const header = [
        ['Asilo de Ancianos Cabeza de Algodón'],
        ['Reporte de Cobros por Familiar'],
        [],
        [`Familiar: ${familiar.nombre}`],
        [`Período: ${new Date(fechaInicio).toLocaleDateString('es-GT')} - ${new Date(fechaFin).toLocaleDateString('es-GT')}`],
        [`Fecha de emisión: ${new Date().toLocaleDateString('es-GT')}`],
        []
    ];
    
    // Encabezados de tabla
    const tableHeaders = [['Fecha', 'Tipo', 'Descripción', 'Monto Original', 'Descuento (%)', 'Monto Final', 'Estado']];
    
    // Datos de transacciones
    const tableData = datos.transacciones.map(t => [
        new Date(t.fecha).toLocaleDateString('es-GT'),
        t.tipo,
        t.descripcion,
        parseFloat(t.monto_original || t.monto).toFixed(2),
        t.descuento_aplicado || 0,
        parseFloat(t.monto).toFixed(2),
        t.estado_pago || '-'
    ]);
    
    // Resumen
    const resumen = [
        [],
        ['Resumen'],
        ['Total Cargos', datos.totalCargos],
        ['Total Descuentos', datos.totalDescuentos],
        ['Total Pagado', datos.totalPagado],
        ['Balance Pendiente', datos.balancePendiente]
    ];
    
    // Combinar todo
    const wsData = [...header, ...tableHeaders, ...tableData, ...resumen];
    
    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Ajustar anchos de columna
    ws['!cols'] = [
        { wch: 12 }, // Fecha
        { wch: 30 }, // Tipo
        { wch: 50 }, // Descripción
        { wch: 15 }, // Monto Original
        { wch: 12 }, // Descuento
        { wch: 15 }, // Monto Final
        { wch: 15 }  // Estado
    ];
    
    // Crear workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Cobros');
    
    // Exportar
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `Reporte_Cobros_${familiar.nombre.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`);
};