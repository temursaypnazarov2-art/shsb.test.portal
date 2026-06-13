import re

filepath = "script.js"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Locate the exportResultsToExcel function
start_idx = content.find("function exportResultsToExcel()")
if start_idx == -1:
    print("Function not found!")
    exit(1)

# Find the end of the function by counting braces
brace_count = 0
in_function = False
end_idx = -1
for i in range(start_idx, len(content)):
    if content[i] == '{':
        in_function = True
        brace_count += 1
    elif content[i] == '}':
        brace_count -= 1
        if in_function and brace_count == 0:
            end_idx = i + 1
            break

if end_idx == -1:
    print("End of function not found!")
    exit(1)

original_func = content[start_idx:end_idx]

new_func = """function exportResultsToExcel() {
    const filterCls = filterClass?.value || 'all';
    const filterQ = filterQuarter?.value || 'all';
    let data = getResultsArray(filterQ);
    if (filterCls !== 'all') data = data.filter(r => r.class === filterCls);
    if (currentTeacherSession) data = data.filter(r => r.subject === currentTeacherSession.subject);
    if (!data.length) {
        showToast(t('alertNoExport') || "Eksport uchun natijalar yo'q!");
        return;
    }
    if (typeof XLSX === 'undefined') {
        showToast("Excel kutubxonasi yuklanmagan!");
        return;
    }

    let numQuestions = 0;
    data.forEach(r => {
        if (r.earnedPoints && r.earnedPoints.length > numQuestions) numQuestions = r.earnedPoints.length;
    });

    const aoa = [];
    const yearStr = new Date().getFullYear();
    const sherekStr = filterQ === 'all' ? yearStr + '-sherek' : filterQ + '-sherek';
    const classStr = filterCls === 'all' ? 'Barcha sinflar' : filterCls;
    
    aoa.push([`Qaraqalpaqstan Respublikası Xojeyli rayonı qánigelestirilgen mektebiniń ${classStr} klass, ${yearStr}-sherek`]);
    aoa.push(["BARCHA FANLAR páninen ótkerilgen BSB/CHSB NÁTIYJELERI"]);
    aoa.push([]);
    aoa.push([`BSB/CHSB ótkerilgen sáne: ${new Date().toLocaleDateString('en-GB')} | Sorawlar sanı: ${numQuestions} | Max ball: ${data[0].maxScore || 0} | Oqıwshılar sanı: ${data.length}`]);

    const headers = ["№", "Oqıwshınıń familiyası, atı"];
    
    const firstR = data[0];
    const qtr = firstR.quarter || '1';
    const subjectQs = (questionsDatabase[qtr] || []).filter(q => q.subject === firstR.subject);
    
    for (let i = 0; i < numQuestions; i++) {
        let cat = 'Biliw';
        if (subjectQs[i] && subjectQs[i].cognitive) {
            let c = subjectQs[i].cognitive.toLowerCase();
            if (c.includes('qollaw') || c.includes('qollash') || c.includes("qo'llash")) cat = 'Qollaw';
            else if (c.includes('pikirlew') || c.includes('mulohaza')) cat = 'Pikirlew';
        }
        headers.push(`${i + 1}-soraw (${cat})`);
    }
    headers.push("Biliw %", "Qollaw %", "Pikirlew %", "JÁMI (Ball)", "JÁMI %");
    aoa.push(headers);

    data.forEach((r, idx) => {
        const row = [idx + 1, r.name];
        
        let biliwTotal = 0, qollawTotal = 0, pikirlewTotal = 0;
        let biliwMax = 0, qollawMax = 0, pikirlewMax = 0;
        
        const currentQs = (questionsDatabase[r.quarter || '1'] || []).filter(q => q.subject === r.subject);
        
        for (let i = 0; i < numQuestions; i++) {
            const earned = (r.earnedPoints && r.earnedPoints[i] !== undefined) ? r.earnedPoints[i] : 0;
            const q = currentQs[i];
            const max = q ? (q.points || 1) : 1;
            
            let cat = 'Biliw';
            if (q && q.cognitive) {
                let c = q.cognitive.toLowerCase();
                if (c.includes('qollaw') || c.includes('qollash') || c.includes("qo'llash")) cat = 'Qollaw';
                else if (c.includes('pikirlew') || c.includes('mulohaza')) cat = 'Pikirlew';
            }
            
            if (cat === 'Biliw') { biliwTotal += earned; biliwMax += max; }
            else if (cat === 'Qollaw') { qollawTotal += earned; qollawMax += max; }
            else { pikirlewTotal += earned; pikirlewMax += max; }
            
            if (r.earnedPoints && r.earnedPoints[i] !== undefined) {
                row.push(earned > 0 ? "+" : "-");
            } else {
                row.push("");
            }
        }
        
        row.push(biliwMax > 0 ? (biliwTotal / biliwMax * 100).toFixed(1) + '%' : '-');
        row.push(qollawMax > 0 ? (qollawTotal / qollawMax * 100).toFixed(1) + '%' : '-');
        row.push(pikirlewMax > 0 ? (pikirlewTotal / pikirlewMax * 100).toFixed(1) + '%' : '-');
        row.push(r.score || 0);
        row.push((r.percentage || 0) + '%');
        
        aoa.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const totalCols = headers.length;
    
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: totalCols - 1 } }
    ];
    
    try {
        const titleStyle = { font: { bold: true, sz: 12 }, alignment: { horizontal: "center" } };
        const subtitleStyle = { font: { bold: true, sz: 14, color: { rgb: "0000FF" } }, alignment: { horizontal: "center" } };
        const infoStyle = { font: { bold: true, sz: 11 }, alignment: { horizontal: "center" } };
        const headerStyle = { font: { bold: true, sz: 11 }, alignment: { horizontal: "center", vertical: "center" } };
        
        if (ws['A1']) ws['A1'].s = titleStyle;
        if (ws['A2']) ws['A2'].s = subtitleStyle;
        if (ws['A4']) ws['A4'].s = infoStyle;
        
        for (let c = 0; c < totalCols; c++) {
            const cellRef = XLSX.utils.encode_cell({ r: 4, c: c });
            if (ws[cellRef]) ws[cellRef].s = headerStyle;
        }
    } catch(e) {
        console.warn("Styling issue", e);
    }
    
    const wscols = [{wch: 5}, {wch: 30}];
    for(let i=0; i<numQuestions; i++) wscols.push({wch: 15});
    wscols.push({wch: 12}, {wch: 12}, {wch: 12}, {wch: 15}, {wch: 10});
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Natijalar');
    XLSX.writeFile(wb, `SHSB_Natijalar_${new Date().toISOString().slice(0, 10)}.xlsx`);
}"""

content = content.replace(original_func, new_func)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("exportResultsToExcel updated successfully.")
