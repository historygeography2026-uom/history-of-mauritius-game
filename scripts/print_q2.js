const ExcelJS = require('exceljs');
async function run() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('./extracted_g6_u3/Grade 6 book unit3/Grade 6 book unit3.xlsx');
    const ws = wb.worksheets[0];
    ws.eachRow((r, i) => {
        if(i > 15) {
            let q = r.values[4];
            if (q && typeof q === 'object' && q.richText) q = q.richText.map(rt => rt.text).join('');
            console.log(`Q${i}:`, q);
        }
    });
}
run();
