export async function generarReportePDF(usuario, historial, progreso) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const ROJO = [194, 0, 0]
  const GRIS_OSCURO = [40, 40, 40]
  const GRIS_MEDIO = [120, 120, 120]
  const AZUL = [2, 102, 255]
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14

  // ── Encabezado ──
  doc.setFillColor(...ROJO)
  doc.rect(0, 0, pageW, 22, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text('REPORTE DE DESEMPEÑO', margin, 13)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const fechaGen = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
  doc.text(`Generado: ${fechaGen}`, pageW - margin, 13, { align: 'right' })

  // ── Datos del usuario ──
  let y = 32

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GRIS_OSCURO)
  doc.text(usuario.name || '—', margin, y)

  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRIS_MEDIO)
  doc.text(usuario.email || '—', margin, y)

  if (usuario.etiqueta) {
    y += 5
    doc.setFillColor(...AZUL)
    const etiqW = doc.getTextWidth(usuario.etiqueta) + 6
    doc.roundedRect(margin, y - 3.5, etiqW, 5.5, 1.5, 1.5, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(usuario.etiqueta, margin + 3, y + 0.5)
    y += 4
  }

  // ── Línea separadora ──
  y += 6
  doc.setDrawColor(230, 230, 230)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // ── Métricas resumen ──
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GRIS_OSCURO)
  doc.text('RESUMEN GENERAL', margin, y)
  y += 6

  const totalEvals = historial.reduce((a, c) => a + c.totalEvaluaciones, 0)
  const totalResp  = historial.reduce((a, c) => a + c.respondidas, 0)
  const totalApro  = historial.reduce((a, c) => a + c.aprobadas, 0)
  const totalPend  = historial.reduce((a, c) => a + c.pendientes, 0)
  const tasa = progreso?.tasa ?? (totalResp > 0 ? Math.round((totalApro / totalResp) * 100) : 0)

  const metricas = [
    { label: 'Total evaluaciones', value: totalEvals },
    { label: 'Respondidas',        value: totalResp },
    { label: 'Aprobadas',          value: totalApro },
    { label: 'Pendientes',         value: totalPend },
    { label: 'Tasa de aprobación', value: `${tasa}%` },
  ]

  const colW = (pageW - margin * 2) / metricas.length
  metricas.forEach((m, i) => {
    const x = margin + i * colW
    doc.setFillColor(245, 247, 255)
    doc.roundedRect(x, y, colW - 2, 14, 2, 2, 'F')

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...AZUL)
    doc.text(String(m.value), x + colW / 2 - 1, y + 8, { align: 'center' })

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRIS_MEDIO)
    doc.text(m.label, x + colW / 2 - 1, y + 12.5, { align: 'center' })
  })

  y += 22

  // ── Detalle por curso ──
  for (const curso of historial) {
    // Encabezado del curso
    doc.setFillColor(240, 240, 240)
    doc.roundedRect(margin, y, pageW - margin * 2, 8, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GRIS_OSCURO)
    doc.text(curso.cursoTitulo, margin + 3, y + 5.5)

    const resumenCurso = `${curso.aprobadas}/${curso.totalEvaluaciones} aprobadas`
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRIS_MEDIO)
    doc.text(resumenCurso, pageW - margin - 3, y + 5.5, { align: 'right' })
    y += 11

    // Tabla de evaluaciones del curso
    const filas = curso.evaluaciones.map(ev => [
      ev.moduloTitulo,
      ev.leccionTitulo,
      ev.respondido ? `${ev.correctas ?? 0}/${ev.totalPreguntas}` : '—',
      `${ev.minCorrectas}/${ev.totalPreguntas}`,
      ev.respondido
        ? (ev.aprobado ? 'Aprobado' : 'Reprobado')
        : 'Pendiente',
      ev.fecha
        ? new Date(ev.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—',
    ])

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Módulo', 'Lección', 'Puntaje', 'Mín. aprobación', 'Estado', 'Fecha']],
      body: filas,
      styles: { fontSize: 8, cellPadding: 3, textColor: GRIS_OSCURO },
      headStyles: { fillColor: ROJO, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 45 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 28, halign: 'center' },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 28, halign: 'center' },
      },
      didParseCell(data) {
        if (data.section === 'body' && data.column.index === 4) {
          const v = data.cell.raw
          if (v === 'Aprobado')  data.cell.styles.textColor = [22, 163, 74]
          if (v === 'Reprobado') data.cell.styles.textColor = [220, 38, 38]
          if (v === 'Pendiente') data.cell.styles.textColor = [180, 120, 0]
          data.cell.styles.fontStyle = 'bold'
        }
      },
      theme: 'grid',
    })

    y = doc.lastAutoTable.finalY + 8

    if (y > 260 && historial.indexOf(curso) < historial.length - 1) {
      doc.addPage()
      y = 20
    }
  }

  // ── Footer ──
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRIS_MEDIO)
    doc.text(
      `Página ${p} de ${totalPages}  ·  LMS Capacitaciones`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  const nombreArchivo = `reporte_${usuario.name?.replace(/\s+/g, '_') ?? 'usuario'}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(nombreArchivo)
}
