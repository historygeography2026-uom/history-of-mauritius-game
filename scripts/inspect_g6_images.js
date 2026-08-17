const ExcelJS = require('exceljs');

async function inspectExcel() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./extracted_g6_u3/Grade 6 book unit3/Grade 6 book unit3.xlsx');
    const worksheet = workbook.worksheets[0];
    
    for (let i = 2; i <= 6; i++) {
        console.log(`Row ${i}:`, worksheet.getRow(i).values);
    }
}

inspectExcel().catch(console.error);
