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

export const generarExcelPagosFundacion = (datos, fechaInicio, fechaFin) => {
    const header = [
        ['Asilo de Ancianos Cabeza de Algodón'],
        ['Reporte de Pagos a la Fundación'],
        [],
        [`Período: ${new Date(fechaInicio).toLocaleDateString('es-GT')} - ${new Date(fechaFin).toLocaleDateString('es-GT')}`],
        [`Fecha de emisión: ${new Date().toLocaleDateString('es-GT')}`],
        []
    ];
    
    const tableHeaders = [['Fecha', 'Tipo', 'Familiar', 'Descripción', 'Monto Original', 'Descuento (%)', 'Monto Pagado']];
    
    const tableData = datos.pagos.map(p => [
        new Date(p.fecha).toLocaleDateString('es-GT'),
        p.tipo,
        p.nombre_familiar,
        p.descripcion,
        parseFloat(p.monto_original || p.monto).toFixed(2),
        p.descuento_aplicado || 0,
        parseFloat(p.monto).toFixed(2)
    ]);
    
    const resumen = [
        [],
        ['Resumen de Pagos'],
        ['Total Pagado', datos.totalPagos],
        ['Cantidad de Pagos', datos.cantidadPagos]
    ];
    
    const wsData = [...header, ...tableHeaders, ...tableData, ...resumen];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    ws['!cols'] = [
        { wch: 12 },
        { wch: 25 },
        { wch: 30 },
        { wch: 50 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 }
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pagos a la Fundación');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `Reporte_Pagos_Fundacion_${new Date().toISOString().split('T')[0]}.xlsx`);
};


export const generarExcelEntradas = (datos, fechaInicio, fechaFin) => {
    const header = [
        ['Asilo de Ancianos Cabeza de Algodón'],
        ['Reporte de Entradas (Donaciones y Cobros)'],
        [],
        [`Período: ${new Date(fechaInicio).toLocaleDateString('es-GT')} - ${new Date(fechaFin).toLocaleDateString('es-GT')}`],
        [`Fecha de emisión: ${new Date().toLocaleDateString('es-GT')}`],
        []
    ];
    
    const tableHeaders = [['Fecha', 'Tipo', 'Descripción', 'Origen', 'Monto']];
    
    const tableData = datos.transacciones.map(t => [
        new Date(t.fecha).toLocaleDateString('es-GT'),
        t.tipo,
        t.descripcion,
        t.nombre_familiar || t.nombre_donante || 'N/A',
        parseFloat(t.monto).toFixed(2)
    ]);
    
    const resumen = [
        [],
        ['Resumen de Ingresos'],
        ['Donaciones', datos.totalDonaciones],
        ['Cobros/Cuotas', datos.totalCobros],
        ['Otros Ingresos', datos.totalOtrosIngresos],
        ['Total General', datos.totalGeneral]
    ];
    
    const wsData = [...header, ...tableHeaders, ...tableData, ...resumen];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    ws['!cols'] = [
        { wch: 12 },
        { wch: 25 },
        { wch: 50 },
        { wch: 30 },
        { wch: 15 }
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Entradas');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `Reporte_Entradas_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const generarExcelExamenes = (datos, fechaInicio, fechaFin) => {
    const header = [
        ['Asilo de Ancianos Cabeza de Algodón'],
        ['Reporte de Exámenes Médicos por Paciente'],
        [],
        [`Paciente: ${datos.paciente.nombre}`],
        [`Período: ${new Date(fechaInicio).toLocaleDateString('es-GT')} - ${new Date(fechaFin).toLocaleDateString('es-GT')}`],
        [`Fecha de emisión: ${new Date().toLocaleDateString('es-GT')}`],
        []
    ];
    
    const tableHeaders = [['Fecha', 'Examen', 'Resultado', 'Médico', 'Diagnóstico']];
    
    const tableData = datos.examenes.map(ex => [
        new Date(ex.fecha_visita).toLocaleDateString('es-GT'),
        ex.nombre_examen,
        ex.resultado || 'Pendiente',
        ex.nombre_medico || 'N/A',
        ex.diagnostico || '-'
    ]);
    
    const resumen = [
        [],
        ['Resumen'],
        ['Total de Exámenes Realizados', datos.totalExamenes]
    ];
    
    const wsData = [...header, ...tableHeaders, ...tableData, ...resumen];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    ws['!cols'] = [
        { wch: 12 },
        { wch: 35 },
        { wch: 40 },
        { wch: 30 },
        { wch: 50 }
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Exámenes');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `Reporte_Examenes_${datos.paciente.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const generarExcelMedicamentos = (datos, fechaInicio, fechaFin) => {
    const header = [
        ['Asilo de Ancianos Cabeza de Algodón'],
        ['Reporte de Medicamentos Aplicados por Paciente'],
        [],
        [`Paciente: ${datos.paciente.nombre}`],
        [`Período: ${new Date(fechaInicio).toLocaleDateString('es-GT')} - ${new Date(fechaFin).toLocaleDateString('es-GT')}`],
        [`Fecha de emisión: ${new Date().toLocaleDateString('es-GT')}`],
        []
    ];
    
    const tableHeaders = [['Fecha', 'Medicamento', 'Descripción', 'Cantidad', 'Tiempo Aplicación', 'Estado', 'Médico']];
    
    const tableData = datos.medicamentos.map(med => [
        new Date(med.fecha_entrega).toLocaleDateString('es-GT'),
        med.nombre_medicamento,
        med.descripcion || '-',
        med.cantidad,
        med.tiempo_aplicacion || 'N/A',
        med.estado,
        med.nombre_medico || 'N/A'
    ]);
    
    const resumen = [
        [],
        ['Resumen'],
        ['Total de Aplicaciones de Medicamentos', datos.totalAplicaciones]
    ];
    
    const wsData = [...header, ...tableHeaders, ...tableData, ...resumen];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    ws['!cols'] = [
        { wch: 12 },
        { wch: 35 },
        { wch: 40 },
        { wch: 12 },
        { wch: 20 },
        { wch: 15 },
        { wch: 25 }
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Medicamentos');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `Reporte_Medicamentos_${datos.paciente.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const generarExcelCostosVisitas = (datos, fechaInicio, fechaFin) => {
    const header = [
        ['Asilo de Ancianos Cabeza de Algodón'],
        ['Reporte de Costos por Visita Médica'],
        [],
        [`Paciente: ${datos.paciente.nombre}`],
        [`Período: ${new Date(fechaInicio).toLocaleDateString('es-GT')} - ${new Date(fechaFin).toLocaleDateString('es-GT')}`],
        [`Fecha de emisión: ${new Date().toLocaleDateString('es-GT')}`],
        [],
        ['RESUMEN GENERAL'],
        ['Total Visitas', datos.cantidadVisitas],
        ['Total Consultas', parseFloat(datos.totalConsultas).toFixed(2)],
        ['Total Exámenes', parseFloat(datos.totalExamenes).toFixed(2)],
        ['Total Medicamentos', parseFloat(datos.totalMedicamentos).toFixed(2)],
        ['TOTAL GENERAL', parseFloat(datos.totalGeneral).toFixed(2)],
        []
    ];
    
    let wsData = [...header];
    
    // Detalle por visita
    datos.visitas.forEach((visita, index) => {
        wsData.push([`VISITA ${index + 1} - ${new Date(visita.fecha_visita).toLocaleDateString('es-GT')}`]);
        wsData.push([`Médico: ${visita.nombre_medico || 'N/A'}`]);
        wsData.push([`Diagnóstico: ${visita.diagnostico || 'Sin diagnóstico'}`]);
        wsData.push([]);
        
        // Consulta Médica
        wsData.push(['CONSULTA MÉDICA']);
        wsData.push([visita.desc_consulta, '', visita.costo_consulta.toFixed(2)]);
        wsData.push([]);
        
        // Exámenes
        if (visita.examenes.length > 0) {
            wsData.push(['EXÁMENES']);
            wsData.push(['Examen', 'Resultado', 'Costo']);
            visita.examenes.forEach(ex => {
                wsData.push([ex.nombre_examen, ex.resultado || 'Pendiente', parseFloat(ex.costo).toFixed(2)]);
            });
            wsData.push(['Subtotal Exámenes', '', visita.total_examenes.toFixed(2)]);
            wsData.push([]);
        }
        
        // Medicamentos
        if (visita.medicamentos.length > 0) {
            wsData.push(['MEDICAMENTOS']);
            wsData.push(['Medicamento', 'Costo']);
            visita.medicamentos.forEach(med => {
                wsData.push([
                    med.nombre_medicamento,
                    parseFloat(med.costo).toFixed(2)
                ]);
            });
            wsData.push(['Subtotal Medicamentos', visita.total_medicamentos.toFixed(2)]);
            wsData.push([]);
        }
        
        wsData.push(['DESGLOSE DE ESTA VISITA']);
        wsData.push(['Consulta', visita.costo_consulta.toFixed(2)]);
        wsData.push(['Exámenes', visita.total_examenes.toFixed(2)]);
        wsData.push(['Medicamentos', visita.total_medicamentos.toFixed(2)]);
        wsData.push(['TOTAL VISITA', visita.total_visita.toFixed(2)]);
        wsData.push([]);
        wsData.push([]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    ws['!cols'] = [
        { wch: 50 },
        { wch: 20 },
        { wch: 20 }
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Costos por Visita');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `Reporte_Costos_Visitas_${datos.paciente.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};