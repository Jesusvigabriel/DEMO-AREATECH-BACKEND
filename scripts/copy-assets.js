const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '../src/assets');
const destDir = path.join(__dirname, '../dist/assets');

console.log('Iniciando copia de assets...');
console.log('Origen:', sourceDir);
console.log('Destino:', destDir);

// Verificar si el directorio de origen existe
if (!fs.existsSync(sourceDir)) {
    console.error('Error: El directorio de origen no existe:', sourceDir);
    process.exit(1);
}

// Mostrar contenido del directorio de origen
console.log('Contenido del directorio de origen:');
try {
    const files = fs.readdirSync(sourceDir, { withFileTypes: true });
    files.forEach(file => {
        const type = file.isDirectory() ? 'directorio' : 'archivo';
        console.log(`- ${file.name} (${type})`);
    });
} catch (error) {
    console.error('Error al leer el directorio de origen:', error);
}

// Crear directorio de destino si no existe
if (!fs.existsSync(destDir)) {
    console.log('Creando directorio de destino...');
    fs.mkdirSync(destDir, { recursive: true });
}

// Copiar assets
console.log('Copiando archivos...');
try {
    fs.copySync(sourceDir, destDir, { 
        overwrite: true,
        errorOnExist: false,
        preserveTimestamps: true,
        recursive: true
    });
    
    // Verificar que los archivos se copiaron correctamente
    console.log('Verificando archivos copiados...');
    const copiedFiles = fs.readdirSync(destDir, { recursive: true });
    console.log(`Se copiaron ${copiedFiles.length} archivos/directorios`);
    
    // Mostrar la estructura de directorios copiada
    console.log('Estructura de directorios copiada:');
    const listFiles = (dir, prefix = '') => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            console.log(prefix + (stat.isDirectory() ? '📁 ' : '📄 ') + file);
            if (stat.isDirectory()) {
                listFiles(fullPath, prefix + '  ');
            }
        });
    };
    
    listFiles(destDir);
    
    console.log('✅ Assets copiados exitosamente!');
} catch (error) {
    console.error('❌ Error al copiar los assets:', error);
    process.exit(1);
}
