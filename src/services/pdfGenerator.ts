import PDFDocument from 'pdfkit';
import fs from 'fs';
import { Remito } from '../entities/Remito';
import { pdfConfig } from '../config/pdfConfig';
import { formatDateTime } from '../utils/dateUtils';

export class PDFGenerator {
  constructor(private config = pdfConfig) {}

  public generate(remito: Remito): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: this.config.page.size,
      margins: this.config.page.margins
    });

    // Logo
    try {
      if (fs.existsSync(this.config.paths.logo)) {
        doc.image(this.config.paths.logo, this.config.page.margins.left, 15, {
          width: 120
        });
      }
    } catch (_) {
      // ignore if logo not found
    }

    doc.font(this.config.fonts.bold).fontSize(16).text('Remito', {
      align: 'right'
    });
    doc.moveDown();

    doc.font(this.config.fonts.regular).fontSize(12);
    doc.text(`Número: ${remito.RemitoNumber}`);
    doc.text(`Fecha: ${formatDateTime(remito.Fecha)}`);
    if (remito.Empresa) {
      // doc.text(`Empresa: ${remito.Empresa.Nombre}`);
    }
    doc.moveDown();

    doc.text('Items:', { underline: true });

    remito.Items?.forEach((item, idx) => {
      doc.text(
        `${idx + 1}. ${item.CodeEmpresa || ''} - Cantidad: ${item.Cantidad}`,
        { indent: 20 }
      );
    });

    doc.end();
    return doc;
  }
}
