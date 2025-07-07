import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import * as htmlPdf from 'html-pdf-node';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

// Alias para evitar conflictos con las importaciones de ES6
const fsExtra = fs;
const pathExtra = path;

interface RemitoPdfOptions {
    remito: any;
    orden: any;
    empresa: any;
    puntoVenta?: any; 
    logoPath?: string;
    outputPath?: string;
    items?: any[];
}

export class RemitoPdfService {
    private readonly templatePath: string;
    
    constructor() {
        this.templatePath = pathExtra.join(__dirname, '../views/remitos/remito.ejs');
    }

    async generatePdf(options: RemitoPdfOptions): Promise<Buffer> {
        try {
            console.log('[RemitoPdfService] Iniciando generación de PDF...');
            console.log('[RemitoPdfService] Ruta de la plantilla:', this.templatePath);
            console.log('[RemitoPdfService] Directorio actual:', process.cwd());
            
            // Verificar si el archivo de plantilla existe
            if (!fsExtra.existsSync(this.templatePath)) {
                console.error('[RemitoPdfService] Error: El archivo de plantilla no existe en la ruta especificada');
                throw new Error('El archivo de plantilla no existe');
            }
            
            // Leer la plantilla EJS
            console.log('[RemitoPdfService] Leyendo plantilla EJS...');
            const template = fsExtra.readFileSync(this.templatePath, 'utf-8');
            
            // Preparar los datos para la plantilla
            const items = options.remito.Items || options.remito.items || [];
            
            console.log(`[RemitoPdfService] Datos del remito recibidos:`, {
                remitoId: options.remito.Id,
                remitoNumber: options.remito.RemitoNumber,
                cantidadItems: items.length,
                baseUrl: process.env.BASE_URL || 'No definido',
                directorioAssets: pathExtra.join(__dirname, '../../assets')
            });
            
            // Verificar directorios de assets (tanto en src como en dist)
            const possibleAssetDirs = [
                pathExtra.join(__dirname, '../../assets'), // src/assets
                pathExtra.join(__dirname, '../../../dist/assets'), // dist/assets
                pathExtra.join(process.cwd(), 'dist/assets'), // ruta absoluta a dist/assets
                pathExtra.join(process.cwd(), 'assets') // ruta absoluta a assets raíz
            ];
            
            let assetsFound = false;
            
            for (const assetsDir of possibleAssetDirs) {
                console.log(`[RemitoPdfService] Verificando directorio de assets: ${assetsDir}`);
                
                if (fsExtra.existsSync(assetsDir)) {
                    console.log(`[RemitoPdfService] Directorio encontrado: ${assetsDir}`);
                    console.log('[RemitoPdfService] Contenido:', fsExtra.readdirSync(assetsDir));

                    // Verificar si existe la carpeta images/remitos
                    const imagesDir = pathExtra.join(assetsDir, 'images/remitos');
                    if (fsExtra.existsSync(imagesDir)) {
                        console.log('[RemitoPdfService] Contenido de images/remitos:', fsExtra.readdirSync(imagesDir));
                        
                        // Verificar si existe el archivo del logo
                        const logoPath = pathExtra.join(imagesDir, 'logo-areatech.png');
                        if (fsExtra.existsSync(logoPath)) {
                            console.log(`[RemitoPdfService] Logo encontrado en: ${logoPath}`);
                            // Actualizar la ruta del logo en los datos que se pasan a la plantilla
                            options.logoPath = `/assets/images/remitos/logo-areatech.png`;
                        } else {
                            console.error(`[RemitoPdfService] El archivo logo-areatech.png no existe en ${imagesDir}`);
                        }
                    } else {
                        console.error(`[RemitoPdfService] El directorio images/remitos no existe en ${assetsDir}`);
                    }
                    
                    assetsFound = true;
                    break; // Detenemos en el primer directorio encontrado
                }
            }
            
            if (!assetsFound) {
                console.error('[RemitoPdfService] No se encontró el directorio de assets en ninguna ubicación conocida');
                console.log('[RemitoPdfService] Directorio actual:', process.cwd());
                console.log('[RemitoPdfService] __dirname:', __dirname);
            }
            
            // Configurar la ruta del logo
            const fs = require('fs');
            const path = require('path');
            
            let logoBase64 = '';
            const defaultLogoPath = path.join(__dirname, '../../assets/images/remitos/logo-areatech.png');
            
            try {
                // Leer la imagen y convertirla a base64
                const logoBuffer = fs.readFileSync(defaultLogoPath);
                const base64Image = logoBuffer.toString('base64');
                const mimeType = 'image/png';
                logoBase64 = `data:${mimeType};base64,${base64Image}`;
                console.log('[RemitoPdfService] Logo convertido a base64 correctamente');
            } catch (error) {
                console.error('[RemitoPdfService] Error al cargar el logo:', error);
                // Usar un placeholder en caso de error
                logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5Mb2dvIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
            }
            
            console.log('[RemitoPdfService] Usando logo en base64');
            
            // Preparar los datos para la plantilla
            const data = {
                remito: options.remito,
                orden: options.orden,
                empresa: options.empresa,
                puntoVenta: options.puntoVenta,
                items: options.remito.Items || options.remito.items || [],
                itemsCount: (options.remito.Items || options.remito.items || []).length,
                logoBase64: logoBase64,  // Usamos el logo en base64
                baseUrl: process.env.BASE_URL || 'http://localhost:8128'
            };
            
            console.log('[RemitoPdfService] Datos para la plantilla:', {
                remitoId: options.remito.Id,
                baseUrl: data.baseUrl,
                itemsCount: data.items.length,
                logoLoaded: !!data.logoBase64
            });

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
