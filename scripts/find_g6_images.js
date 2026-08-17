const ExcelJS = require('exceljs');

async function inspectExcel() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./extracted_g6_u3/Grade 6 book unit3/Grade 6 book unit3.xlsx');
    const worksheet = workbook.worksheets[0];
    
    let hasImages = false;
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        const imageName = row.values[5];
        if (imageName && String(imageName).trim().length > 0) {
            console.log(`Row ${rowNumber}: Image = ${imageName}`);
            hasImages = true;
        }
    });

    if (!hasImages) {
        console.log("No images found in the 'Name of Image' column!");
    }
}

inspectExcel().catch(console.error);
