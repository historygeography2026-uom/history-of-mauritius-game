const ExcelJS = require('exceljs');
const fs = require('fs');

async function inspectExcel() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./extracted_g6_u3/Grade 6 book unit3/Grade 6 book unit3.xlsx');
    const worksheet = workbook.worksheets[0];
    
    console.log("Headers:");
    const headers = worksheet.getRow(1).values;
    console.log(headers);
    
    console.log("\nFirst row of data:");
    const row2 = worksheet.getRow(2).values;
    console.log(row2);
}

inspectExcel().catch(console.error);
