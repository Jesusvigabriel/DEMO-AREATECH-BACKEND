import path from 'path';

export const pdfConfig = {
  page: {
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 50, right: 50 }
  },
  fonts: {
    regular: 'Helvetica',
    bold: 'Helvetica-Bold'
  },
  colors: {
    primary: '#333333',
    secondary: '#666666'
  },
  paths: {
    logo: path.join(__dirname, '../../assets/logo.png'),
    outputDir: path.join(process.cwd(), 'public', 'remitos')
  }
};
