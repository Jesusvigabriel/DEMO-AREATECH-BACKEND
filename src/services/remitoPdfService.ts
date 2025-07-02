import * as path from 'path';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as htmlPdf from 'html-pdf-node';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

interface RemitoPdfOptions {
    remito: any;
    orden: any;
    empresa: any;
    puntoVenta?: any; // Agregar esta línea
    logoPath?: string;
    outputPath?: string;
    items?: any[];
}

export class RemitoPdfService {
    private readonly templatePath: string;
    
    constructor() {
        this.templatePath = path.join(__dirname, '../views/remitos/remito.ejs');
    }

    async generatePdf(options: RemitoPdfOptions): Promise<Buffer> {
        try {
            // Leer la plantilla EJS
            const template = fs.readFileSync(this.templatePath, 'utf-8');
            
            // Preparar los datos para la plantilla
            const data = {
                remito: options.remito,
                orden: options.orden,
                empresa: {
                    ...options.empresa,
                    logoUrl: options.logoPath ? `file://${options.logoPath}` : null
                },
                // Asegurarse de que los ítems estén disponibles en la plantilla
                items: options.remito.Items || options.remito.items || []
            };

            // Renderizar la plantilla con los datos
            const html = ejs.render(template, data);

            // Configuración para la generación del PDF
            const pdfOptions = {
                format: 'A4',
                margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm'
                },
                printBackground: true,
                preferCSSPageSize: true,
                displayHeaderFooter: false
            };

            // Crear un archivo temporal para el HTML
            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            const tempHtmlPath = path.join(tempDir, `remito-${Date.now()}.html`);
            fs.writeFileSync(tempHtmlPath, html);

            // Generar el PDF
            const file = { content: html };
            const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
                htmlPdf.generatePdf(file as any, pdfOptions as any, (err: Error | null, buffer: Buffer) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(buffer);
                    }
                });
            });
            
            // Eliminar el archivo temporal
            try {
                await fs.promises.unlink(tempHtmlPath);
            } catch (error) {
                console.warn('No se pudo eliminar el archivo temporal:', error);
            }

            // Si se especificó una ruta de salida, guardar el archivo
            if (options.outputPath) {
                fs.writeFileSync(options.outputPath, pdfBuffer);
            }

            return pdfBuffer;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al generar el PDF';
            console.error('Error al generar el PDF del remito:', error);
            throw new Error(`Error al generar el PDF: ${errorMessage}`);
        }
    }

    async generatePdfFromRemito(remitoData: any, outputPath?: string): Promise<Buffer> {
        if (!remitoData) {
            throw new Error('Datos del remito no proporcionados');
        }
        // Extraer los datos necesarios del objeto remito
        const { Orden: orden, Empresa: empresa, Items: items, ...remito } = remitoData;
        
        console.log('Datos del remito para PDF:', {
            remito,
            orden,
            empresa,
            itemsCount: items?.length || 0
        });
        
        // Ruta al logo de la empresa
        let logoPath: string | undefined;
        let logoUrl: string | undefined;
        
        // Verificar si la empresa es AreaTech
        const isAreaTech = empresa?.RazonSocial?.toLowerCase().includes('areatech') || 
                         empresa?.Nombre?.toLowerCase().includes('areatech');
        
        if (isAreaTech) {
            // Ruta al logo de AreaTech en la carpeta de assets
            logoPath = path.join(
                __dirname, 
                '../../assets/empresas/areatech/logo.png'
            );
            
            // Verificar si existe el logo
            if (fs.existsSync(logoPath)) {
                // Para desarrollo local
                logoUrl = `file://${logoPath}`;
                // En producción, esto se reemplazará por la ruta correcta
                if (process.env.NODE_ENV === 'production') {
                    logoUrl = `/assets/empresas/areatech/logo.png`;
                }
            }
        }

        // Extraer el punto de venta del remito
        const puntoVenta = remito.PuntoVenta || {};
        
        return this.generatePdf({
            remito: {
                ...remito,
                // Asegurarse de que los ítems estén disponibles en el objeto remito
                Items: items || []
            },
            orden: orden || {},
            empresa: {
                ...(empresa || {}),
                logoUrl: logoUrl // Incluir la URL del logo en los datos de la empresa
            },
            puntoVenta: puntoVenta, // Pasar el punto de venta a la plantilla
            outputPath,
            // Pasar los ítems directamente al contexto de la plantilla
            items: items || []
        });
    }
}

export const remitoPdfService = new RemitoPdfService();
