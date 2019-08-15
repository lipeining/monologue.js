// const t1str = "^[\\s\\S]*\\.\\bA\\.\\bB\\.\\b[^.]+$";
const t1str = "^[\\s\\S]*\\.A\\.B\\.[^.]+$";
const t1 = new RegExp(t1str);
// 检查 \b 符号对此的影响
const t1r = [
    "dfjdsf.dfsf.dfsf.A.B.fdsaf",
    "dfjdsf.dfsf.dfsf.A.B",
    "dfjdsf.dfsf.dfsf.A.B.d.f",
    "dfsf.A.B.d",
    "dfsf.dfsf.A.B.f",
];
for (const istr of t1r) {
    console.log(t1.test(istr));
}