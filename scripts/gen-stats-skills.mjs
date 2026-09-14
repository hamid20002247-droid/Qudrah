/**
 * Generates statistics skills 6–10 with verified math.
 * Run: node scripts/gen-stats-skills.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../src/content/statistics");

const review = `{
  source: "style-modeled-practice-2024",
  review_status: "approved" as const,
  reviewed_by: "founder",
  reviewed_at: "2026-09-13T00:00:00.000Z",
}`;

function q(obj) {
  if (!obj.traps || obj.traps.length !== 3) {
    throw new Error(`${obj.id}: need exactly 3 trap texts`);
  }
  const trapEntries = [];
  let ti = 0;
  for (let i = 0; i < 4; i++) {
    if (i === obj.correct) continue;
    trapEntries.push(`        ${i}: ${JSON.stringify(obj.traps[ti++])},`);
  }
  return `    {
      id: "${obj.id}",
      prompt_ar: ${JSON.stringify(obj.prompt)},
      choices_ar: ${JSON.stringify(obj.choices)},
      correct_index: ${obj.correct},
      trap_explanations_ar: {
${trapEntries.join("\n")}
      },
      solve_ar: ${JSON.stringify(obj.solve)},
      trick_ref: "${obj.trick}",
      difficulty: "${obj.diff}",
      sub_pattern: "${obj.sub}",
      ...review,
    }`;
}

function assertUniqueCorrect(choices, correct) {
  const set = new Set(choices);
  if (set.size !== choices.length) throw new Error("duplicate choices: " + choices);
  if (correct < 0 || correct > 3) throw new Error("bad correct_index");
}

function shuffleChoices(correctValue, traps, preferOrder) {
  // traps: 3 wrong values
  const choices = preferOrder ?? [correctValue, ...traps];
  if (new Set(choices.map(String)).size !== 4) {
    throw new Error("choices not unique: " + choices);
  }
  const correct = choices.findIndex((c) => String(c) === String(correctValue));
  if (correct < 0) throw new Error("correct missing");
  return { choices: choices.map(String), correct };
}

// ───────── TABLES ─────────
function buildTables() {
  const items = [];
  const push = (x) => {
    assertUniqueCorrect(x.choices, x.correct);
    items.push({ ...x, trick: "tables", sub: "statistics" });
  };

  // 1 sum row
  {
    const a = 12, b = 8, sum = a + b;
    const { choices, correct } = shuffleChoices(sum, [17, 24, 21], [17, sum, 24, 21]);
    push({
      id: "tbl-01",
      prompt: `مبيعات مكتبة:\n        كتب  أقلام\nصباح   ${a}     ${b}\nمساء    9    15\nما مجموع مبيعات الصباح؟`,
      choices, correct, diff: "easy",
      traps: ["جُمع صف المساء بدل الصباح.", "جُمع عمود الكتب مع رقم إضافي.", "خُلطت خلية من المساء مع الصباح."],
      solve: `صف الصباح = ${a} + ${b} = ${sum}.`,
    });
  }
  // 2 diff cells
  {
    const f = 22, m = 18, d = f - m;
    const { choices, correct } = shuffleChoices(d, [2, 6, 40], [2, d, 6, 40]);
    push({
      id: "tbl-02",
      prompt: `حضور فصلين:\n         ذكور  إناث\nأول       ${m}    ${f}\nثاني      20    16\nكم يزيد عدد إناث الصف الأول عن ذكور الصف الأول؟`,
      choices, correct, diff: "easy",
      traps: ["طُرح من صف آخر.", "حُسب فرق صفين كاملين.", "جُمع العددان بدل طرحهما."],
      solve: `إناث الأول ${f} وذكور الأول ${m}. الفرق = ${f} − ${m} = ${d}.`,
    });
  }
  // 3 largest row
  {
    const a1 = 8, a2 = 3, b1 = 5, b2 = 5;
    const sa = a1 + a2, sb = b1 + b2;
    if (!(sa > sb)) throw new Error("row A should be larger");
    push({
      id: "tbl-03",
      prompt: `نتائج فريقين:\n         فوز  خسارة\nفريق أ    ${a1}     ${a2}\nفريق ب    ${b1}     ${b2}\nأي صف مجموعه أكبر؟`,
      choices: ["فريق أ", "فريق ب", "متساويان", "لا يمكن"],
      correct: 0, diff: "easy",
      traps: ["نُظر إلى تعادل فريق ب دون جمع.", "اُفترض التساوي دون حساب.", "المجاميع واضحة من الجدول."],
      solve: `مجموع فريق أ = ${a1} + ${a2} = ${sa}. مجموع فريق ب = ${b1} + ${b2} = ${sb}. الأكبر فريق أ.`,
    });
  }
  // 4 col sum
  {
    const x = 9, y = 16, s = x + y;
    const { choices, correct } = shuffleChoices(s, [23, 30, 20], [23, s, 30, 20]);
    push({
      id: "tbl-04",
      prompt: `طلبات توصيل:\n         حي أ  حي ب\nالسبت     14     ${x}\nالأحد     11    ${y}\nما مجموع طلبات حي ب في اليومين؟`,
      choices, correct, diff: "easy",
      traps: ["جُمع صف السبت بدل عمود حي ب.", "جُمع الجدول كله تقريباً.", "أُخذ أحد اليومين فقط."],
      solve: `عمود حي ب = ${x} + ${y} = ${s}.`,
    });
  }
  // 5 row sum diff
  {
    const s1 = 17 + 19, s2 = 15 + 20, d = s1 - s2;
    const { choices, correct } = shuffleChoices(d, [2, 3, 0], [d, 2, 3, 0]);
    push({
      id: "tbl-05",
      prompt: `درجات مسابقة:\n         شفوي  تحريري\nسارة      17      19\nنورة      15      20\nما الفرق بين مجموع درجات سارة ومجموع درجات نورة؟`,
      choices, correct, diff: "easy",
      traps: ["طُرح عمود واحد فقط.", "خُلطت خلايا بين الطالبتين.", "اُفترض التساوي دون جمع."],
      solve: `مجموع سارة = 17 + 19 = ${s1}. مجموع نورة = 15 + 20 = ${s2}. الفرق = ${s1} − ${s2} = ${d}.`,
    });
  }
  // 6 grand total
  {
    const cells = [6, 10, 4, 8];
    const s = cells.reduce((a, b) => a + b, 0);
    const { choices, correct } = shuffleChoices(s, [24, 20, 18], [24, s, 20, 18]);
    push({
      id: "tbl-06",
      prompt: `مخزون محل:\n         كبير  صغير\nأرفف      6     10\nصناديق    4      8\nما المجموع الكلي لكل القطع في الجدول؟`,
      choices, correct, diff: "easy",
      traps: ["نُسي صف أو عمود عند الجمع.", "جُمع صف الأرفف فقط مع جزء.", "جُمع عمود واحد فقط."],
      solve: `6 + 10 + 4 + 8 = ${s}.`,
    });
  }
  // 7 which day larger
  {
    const sat = 22 + 18, sun = 19 + 25;
    if (!(sun > sat)) throw new Error("sun should win");
    push({
      id: "tbl-07",
      prompt: `زيارات عيادة:\n         صباح  مساء\nالسبت     22    18\nالأحد     19    25\nأي يوم مجموع زياراته أكبر؟`,
      choices: ["السبت", "الأحد", "متساويان", "لا يكفي"],
      correct: 1, diff: "mid",
      traps: ["قُورن صباح السبت فقط دون جمع الصف.", "اُفترض التساوي دون حساب.", "الجدول كافٍ للمقارنة."],
      solve: `مجموع السبت = 22 + 18 = ${sat}. مجموع الأحد = 19 + 25 = ${sun}. الأكبر الأحد.`,
    });
  }
  // 8 col diff
  {
    const A = 30 + 18, B = 12 + 24, d = A - B;
    const { choices, correct } = shuffleChoices(d, [6, 18, 48], [6, d, 18, 48]);
    push({
      id: "tbl-08",
      prompt: `إنتاج ورشة:\n         قطعة أ  قطعة ب\nوردية 1     30       12\nوردية 2     18       24\nكم يزيد إنتاج قطعة أ الكلي عن قطعة ب الكلي؟`,
      choices, correct, diff: "mid",
      traps: ["طُرح فرق وردية واحدة فقط.", "خُلطت خلايا الورديتين.", "جُمع العمودان بدل طرحهما."],
      solve: `قطعة أ = 30 + 18 = ${A}. قطعة ب = 12 + 24 = ${B}. الفرق = ${A} − ${B} = ${d}.`,
    });
  }
  // 9 annual col
  {
    const s = 15 + 25;
    const { choices, correct } = shuffleChoices(s, [50, 75, 55], [s, 50, 75, 55]);
    push({
      id: "tbl-09",
      prompt: `اشتراكات نادٍ:\n         شهري  سنوي\nرجال      40     15\nنساء      35     25\nما مجموع الاشتراكات السنوية؟`,
      choices, correct, diff: "mid",
      traps: ["جُمع عمود خاطئ أو أُضيف 10 زيادة.", "جُمع صف الرجال كله.", "خُلط عمود شهري مع سنوي."],
      solve: `عمود السنوي = 15 + 25 = ${s}.`,
    });
  }
  // 10 equal rows 3 cols
  {
    push({
      id: "tbl-10",
      prompt: `مباريات دوري:\n         فاز  تعادل  خسر\nالفريق س  6     2      1\nالفريق ص  4     4      1\nأي فريق لعب مباريات أكثر؟ (اجمع صف كل فريق)`,
      choices: ["س", "ص", "متساويان", "لا يمكن"],
      correct: 2, diff: "mid",
      traps: ["نُظر إلى عدد الفوز فقط دون جمع الصف.", "نُظر إلى التعادلات فقط.", "المجاميع موجودة في الجدول."],
      solve: `س = 6 + 2 + 1 = 9. ص = 4 + 4 + 1 = 9. المجموعان متساويان.`,
    });
  }
  // 11 north sum
  {
    const s = 28 + 17;
    const { choices, correct } = shuffleChoices(s, [47, 49, 43], [s, 47, 49, 43]);
    push({
      id: "tbl-11",
      prompt: `مبيعات عصير:\n         تفاح  برتقال\nفرع شمال   28      17\nفرع جنوب   21      26\nما مجموع مبيعات فرع الشمال؟`,
      choices, correct, diff: "mid",
      traps: ["أُضيف رقم من فرع الجنوب.", "جُمع عمود التفاح كله خطأ.", "نُقص رقم عند الجمع."],
      solve: `28 + 17 = ${s}.`,
    });
  }
  // 12 largest of 3 rows — unique winner
  {
    const rows = [
      [9, 6], // 15
      [7, 8], // 15
      [8, 10], // 18 winner
    ];
    const sums = rows.map(([a, b]) => a + b);
    if (sums[2] <= sums[0] || sums[2] <= sums[1]) throw new Error("line3 must win");
    push({
      id: "tbl-12",
      prompt: `عدد الحافلات:\n         صباحي  مسائي\nخط 1      ${rows[0][0]}       ${rows[0][1]}\nخط 2      ${rows[1][0]}       ${rows[1][1]}\nخط 3      ${rows[2][0]}       ${rows[2][1]}\nأي خط مجموع رحلاته الأكبر؟`,
      choices: ["خط 1", "خط 2", "خط 3", "خط 1 وخط 2"],
      correct: 2, diff: "mid",
      traps: ["خُلط أكبر خلية صباحية مع مجموع الصف.", "حُسب مجموع خط 2 فقط.", "قُورن خطان متقاربان دون خط 3."],
      solve: `خط 1 = ${sums[0]}. خط 2 = ${sums[1]}. خط 3 = ${sums[2]}. الأكبر خط 3.`,
    });
  }
  // 13 cell read
  {
    push({
      id: "tbl-13",
      prompt: `درجات اختبار:\n         قصير  نهائي\nأحمد      14     26\nخالد      18     22\nما درجة خالد في الاختبار القصير؟`,
      choices: ["14", "18", "22", "26"],
      correct: 1, diff: "mid",
      traps: ["أُخذت درجة أحمد القصير.", "أُخذت درجة خالد النهائية.", "أُخذت درجة أحمد النهائية."],
      solve: "تقاطع صف خالد مع عمود القصير = 18.",
    });
  }
  // 14 diff of col sums
  {
    const c1 = 12 + 9, c2 = 8 + 15, d = Math.abs(c1 - c2);
    // 21 vs 23 = 2
    const { choices, correct } = shuffleChoices(d, [3, 4, 7], [d, 3, 4, 7]);
    push({
      id: "tbl-14",
      prompt: `مبيعات مكتبة:\n        كتب  أقلام\nصباح   12     8\nمساء    9    15\nما الفرق بين مجموع عمود الكتب ومجموع عمود الأقلام؟`,
      choices, correct, diff: "mid",
      traps: ["طُرح خليتان من صف واحد فقط.", "خُلطت مجاميع الصفوف.", "جُمع الفرقين خطأ."],
      solve: `كتب = 12 + 9 = ${c1}. أقلام = 8 + 15 = ${c2}. الفرق = ${c2} − ${c1} = ${d}.`,
    });
  }
  // 15 which col larger
  {
    push({
      id: "tbl-15",
      prompt: `مبيعات:\n         شمال  جنوب\nيناير     40     35\nفبراير    28     32\nأي عمود مجموعه أكبر؟`,
      choices: ["شمال", "جنوب", "متساويان", "لا يمكن"],
      correct: 0, diff: "hard",
      traps: ["نُظر إلى فبراير فقط.", "اُفترض التساوي.", "الجدول كافٍ."],
      solve: `شمال = 40 + 28 = 68. جنوب = 35 + 32 = 67. الأكبر شمال.`,
    });
    if (40 + 28 <= 35 + 32) throw new Error("north should win");
  }
  // 16 three-row sum ask middle
  {
    const s = 11 + 14;
    const { choices, correct } = shuffleChoices(s, [22, 30, 19], [22, s, 30, 19]);
    push({
      id: "tbl-16",
      prompt: `حضور معرض:\n         كبار  أطفال\nالجمعة    20     12\nالسبت     11     14\nالأحد     16     18\nما مجموع حضور يوم السبت؟`,
      choices, correct, diff: "hard",
      traps: ["جُمع يوم الجمعة.", "جُمع يوم الأحد.", "خُلط عمود الأطفال فقط."],
      solve: `11 + 14 = ${s}.`,
    });
  }
  // 17 largest among equal trap
  {
    push({
      id: "tbl-17",
      prompt: `نقاط مسابقة:\n         جولة1  جولة2\nفريق م     10      8\nفريق ن      9      9\nفريق ه     12      5\nأي فريق مجموعه أكبر؟`,
      choices: ["م", "ن", "هـ", "م ون"],
      correct: 2, diff: "hard",
      traps: ["نُظر إلى التعادل في ن.", "نُظر إلى أعلى جولة1 دون جمع.", "اُفترض تساوي م ون دون هـ."],
      solve: `م = 18. ن = 18. هـ = 17... wait`,
    });
  }

  // Fix 17 - ه should win
  items.pop();
  {
    push({
      id: "tbl-17",
      prompt: `نقاط مسابقة:\n         جولة1  جولة2\nفريق م     10      8\nفريق ن      9      9\nفريق ه     12      8\nأي فريق مجموعه أكبر؟`,
      choices: ["م", "ن", "هـ", "م ون"],
      correct: 2, diff: "hard",
      traps: ["نُظر إلى التعادل في ن.", "نُظر إلى أعلى جولة1 دون جمع.", "اُفترض تساوي م ون دون مقارنة هـ."],
      solve: `م = 10 + 8 = 18. ن = 9 + 9 = 18. هـ = 12 + 8 = 20. الأكبر هـ.`,
    });
    if (20 <= 18) throw new Error("h should win");
  }

  // 18 total minus one row
  {
    const total = 8 + 6 + 5 + 7 + 4 + 9; // 39
    const row2 = 5 + 7; // 12
    const ans = total - row2; // 27
    const { choices, correct } = shuffleChoices(ans, [12, 39, 24], [12, ans, 39, 24]);
    push({
      id: "tbl-18",
      prompt: `شحنات:\n         صندوق  كيس\nاليوم1      8      6\nاليوم2      5      7\nاليوم3      4      9\nما مجموع شحنات اليوم1 واليوم3 معاً؟`,
      choices, correct, diff: "hard",
      traps: ["أُخذ مجموع اليوم2 فقط.", "جُمع الجدول كله.", "نُسي أحد اليومين."],
      solve: `اليوم1 = 14 واليوم3 = 13. المجموع = 14 + 13 = ${ans}. أو الكلي ${total} − اليوم2 ${row2} = ${ans}.`,
    });
  }

  // final_extra 7
  const extras = [];
  const pushE = (x) => {
    assertUniqueCorrect(x.choices, x.correct);
    extras.push({ ...x, trick: "tables", sub: "statistics" });
  };

  {
    const s = 13 + 9;
    const { choices, correct } = shuffleChoices(s, [20, 24, 18], [20, s, 24, 18]);
    pushE({
      id: "tbl-f01",
      prompt: `مقصف مدرسة:\n         ساندويتش  عصير\nالفسحة1      13       9\nالفسحة2      10      12\nما مجموع مبيعات الفسحة الأولى؟`,
      choices, correct, diff: "easy",
      traps: ["جُمع الفسحة الثانية.", "جُمع عمود واحد مع زيادة.", "نُقص رقم."],
      solve: `13 + 9 = ${s}.`,
    });
  }
  {
    pushE({
      id: "tbl-f02",
      prompt: `أهداف دوري:\n         له  عليه\nالفريق أ   8    3\nالفريق ب   6    4\nكم يزيد «له» عند أ عن «له» عند ب؟`,
      choices: ["1", "2", "3", "4"],
      correct: 1, diff: "easy",
      traps: ["طُرح عليه بدل له.", "حُسب فرق الصفين كاملين.", "طُرح بالعكس."],
      solve: `8 − 6 = 2.`,
    });
  }
  {
    pushE({
      id: "tbl-f03",
      prompt: `قراءات عدّاد:\n         صباح  ظهر  مساء\nالسبت     4     5     6\nالأحد     3     7     4\nأي يوم مجموعه أكبر؟`,
      choices: ["السبت", "الأحد", "متساويان", "لا يمكن"],
      correct: 0, diff: "mid",
      traps: ["نُظر إلى أعلى خلية ظهر الأحد.", "اُفترض التساوي.", "الجدول كافٍ."],
      solve: `السبت = 4+5+6 = 15. الأحد = 3+7+4 = 14. الأكبر السبت.`,
    });
    if (15 <= 14) throw new Error("sat");
  }
  {
    const s = 21 + 19;
    const { choices, correct } = shuffleChoices(s, [38, 42, 35], [38, s, 42, 35]);
    pushE({
      id: "tbl-f04",
      prompt: `تسجيل حضور:\n         حاضر  غائب\nشعبة1     21     4\nشعبة2     19     6\nما مجموع الحاضرين في الشعبتين؟`,
      choices, correct, diff: "mid",
      traps: ["جُمع الغائبين.", "جُمع الجدول كله.", "نُسي شعبة."],
      solve: `21 + 19 = ${s}.`,
    });
  }
  {
    pushE({
      id: "tbl-f05",
      prompt: `مبيعات أحذية:\n         رجالي  نسائي\nالمعرض أ    16      14\nالمعرض ب    12      20\nأي معرض مجموعه أكبر؟`,
      choices: ["أ", "ب", "متساويان", "لا يمكن"],
      correct: 1, diff: "mid",
      traps: ["نُظر إلى الرجالي فقط.", "اُفترض التساوي 30 و 32 دون دقة.", "الجدول كافٍ."],
      solve: `أ = 16+14 = 30. ب = 12+20 = 32. الأكبر ب.`,
    });
  }
  {
    const d = Math.abs((10 + 8) - (7 + 9)); // 18-16=2
    const { choices, correct } = shuffleChoices(d, [1, 3, 17], [1, d, 3, 17]);
    pushE({
      id: "tbl-f06",
      prompt: `تمرينات:\n         جري  قفز\nمجموعة1   10    8\nمجموعة2    7    9\nما الفرق بين مجموعَي المجموعتين؟`,
      choices, correct, diff: "hard",
      traps: ["طُرح عمود واحد فقط.", "طُرح بالعكس مع خطأ.", "جُمع بدل طرح."],
      solve: `مجموعة1 = 18. مجموعة2 = 16. الفرق = 2.`,
    });
  }
  {
    pushE({
      id: "tbl-f07",
      prompt: `مخزون أدوية:\n         شراب  أقراص\nرف أ       9      11\nرف ب       7      13\nرف ج      10       8\nما المجموع الكلي لكل العبوات؟`,
      choices: ["54", "58", "60", "52"],
      correct: 1, diff: "hard",
      traps: ["نُسي رف.", "زِيد على المجموع.", "نُقص رف."],
      solve: `9+11+7+13+10+8 = 58.`,
    });
    if (9 + 11 + 7 + 13 + 10 + 8 !== 58) throw new Error("total");
  }

  if (items.length !== 18) throw new Error("tables drill " + items.length);
  if (extras.length !== 7) throw new Error("tables extra " + extras.length);
  return { drill: items, extra: extras };
}

// ───────── CHARTS ─────────
function buildCharts() {
  const items = [];
  const push = (x) => {
    assertUniqueCorrect(x.choices, x.correct);
    items.push({ ...x, trick: "charts", sub: "statistics" });
  };

  push({
    id: "cht-01",
    prompt: `رسم أعمدة لمبيعات أيام: سبت=4، أحد=7، إثن=5، ثلاث=9. أي يوم هو الأعلى؟`,
    choices: ["سبت", "أحد", "إثن", "ثلاث"],
    correct: 3, diff: "easy",
    traps: ["أُخذ ثاني أعلى عمود.", "أُخذ وسط الأيام.", "أُخذ أقل الأيام خطأً كأعلى."],
    solve: `الأعمدة: 4، 7، 5، 9. الأعلى 9 وهو يوم الثلاث.`,
  });
  push({
    id: "cht-02",
    prompt: `أعمدة حضور: صباح=12، ظهر=8، عصر=10، مساء=6. ما قيمة عمود العصر؟`,
    choices: ["8", "10", "12", "6"],
    correct: 1, diff: "easy",
    traps: ["أُخذ عمود الظهر.", "أُخذ عمود الصباح.", "أُخذ عمود المساء."],
    solve: `من وصف الرسم: عصر = 10.`,
  });
  {
    const d = 9 - 4;
    const { choices, correct } = shuffleChoices(d, [3, 7, 13], [3, d, 7, 13]);
    push({
      id: "cht-03",
      prompt: `أعمدة مبيعات: سبت=4 وثلاث=9. كم يزيد الثلاث عن السبت؟`,
      choices, correct, diff: "easy",
      traps: ["طُرح من عمود آخر.", "جُمع العمودين.", "أُخذ أحد العمودين فقط."],
      solve: `9 − 4 = ${d}.`,
    });
  }
  push({
    id: "cht-04",
    prompt: `دائرة مقسمة: أحمر 40، أزرق 35، أخضر 25. أي شريحة الأكبر؟`,
    choices: ["أحمر", "أزرق", "أخضر", "متساوية"],
    correct: 0, diff: "easy",
    traps: ["نُظر إلى الأقرب عدداً.", "أُخذ الأصغر.", "اُفترض التساوي."],
    solve: `40 أكبر من 35 و 25؛ الشريحة الأكبر حمراء.`,
  });
  push({
    id: "cht-05",
    prompt: `أعمدة نقاط: جولة1=3، جولة2=8، جولة3=5. أي جولة الأقل؟`,
    choices: ["1", "2", "3", "لا يمكن"],
    correct: 0, diff: "easy",
    traps: ["أُخذ الأوسط.", "أُخذ الأعلى بالخطأ.", "البيانات كافية."],
    solve: `الأقل بين 3 و 8 و 5 هو 3 (الجولة 1).`,
  });
  {
    const d = 12 - 6;
    const { choices, correct } = shuffleChoices(d, [4, 8, 18], [4, d, 8, 18]);
    push({
      id: "cht-06",
      prompt: `أعمدة حضور: صباح=12 ومساء=6. ما الفرق بينهما؟`,
      choices, correct, diff: "easy",
      traps: ["طُرح ظهر من صباح.", "جُمع الفترتين.", "نُصف أحد العمودين خطأ."],
      solve: `12 − 6 = ${d}.`,
    });
  }
  push({
    id: "cht-07",
    prompt: `مقارنة فترتين في أعمدة: يناير=20 وفبراير=28. أي شهر أعلى؟`,
    choices: ["يناير", "فبراير", "متساويان", "لا يمكن"],
    correct: 1, diff: "mid",
    traps: ["قُرئ العمود الأقصر أعلى.", "اُفترض التساوي.", "الوصف كافٍ."],
    solve: `28 > 20؛ فبراير أعلى.`,
  });
  {
    const sum = 4 + 7 + 5 + 9;
    const { choices, correct } = shuffleChoices(sum, [20, 30, 16], [20, sum, 30, 16]);
    push({
      id: "cht-08",
      prompt: `أعمدة: سبت=4، أحد=7، إثن=5، ثلاث=9. ما مجموع قيم الأعمدة الأربعة؟`,
      choices, correct, diff: "mid",
      traps: ["نُسي أحد الأعمدة.", "زِيد على المجموع.", "جُمع عمودين فقط."],
      solve: `4 + 7 + 5 + 9 = ${sum}.`,
    });
  }
  push({
    id: "cht-09",
    prompt: `دائرة: رياضيات 50، علوم 30، عربي 20. أي مادتين مجموعهما يساوي شريحة الرياضيات؟`,
    choices: ["علوم وعربي", "رياضيات وعلوم", "عربي فقط", "لا شيء"],
    correct: 0, diff: "mid",
    traps: ["جُمع مع الرياضيات خطأ.", "أُخذت شريحة واحدة.", "اُفترض لا يوجد تطابق."],
    solve: `علوم + عربي = 30 + 20 = 50 وهو يساوي الرياضيات.`,
  });
  {
    const d = 10 - 8;
    const { choices, correct } = shuffleChoices(d, [1, 4, 18], [1, d, 4, 18]);
    push({
      id: "cht-10",
      prompt: `أعمدة: ظهر=8 وعصر=10. كم يزيد العصر عن الظهر؟`,
      choices, correct, diff: "mid",
      traps: ["طُرح بالعكس.", "جُمع الفترتين.", "أُخذ فرق مع فترة أخرى."],
      solve: `10 − 8 = ${d}.`,
    });
  }
  push({
    id: "cht-11",
    prompt: `أعمدة إنتاج: آلة أ=14، آلة ب=11، آلة ج=14، آلة د=9. كم آلة تصل إلى القيمة الأعلى؟`,
    choices: ["1", "2", "3", "4"],
    correct: 1, diff: "mid",
    traps: ["عُدّت آلة واحدة فقط.", "عُدّت ثلاث آلات.", "عُدّت كل الآلات."],
    solve: `الأعلى 14 تظهر عند أ وج؛ إذن آلتان.`,
  });
  push({
    id: "cht-12",
    prompt: `دائرة نسب مبيعات: كتب 45، أدوات 30، أخرى 25. ما قيمة شريحة الأدوات؟`,
    choices: ["25", "30", "45", "55"],
    correct: 1, diff: "mid",
    traps: ["أُخذت شريحة أخرى.", "أُخذت شريحة الكتب.", "جُمعت شريحتان."],
    solve: `من وصف الدائرة: أدوات = 30.`,
  });
  {
    const d = 28 - 20;
    const { choices, correct } = shuffleChoices(d, [6, 10, 48], [6, d, 10, 48]);
    push({
      id: "cht-13",
      prompt: `مقارنة عمودين: يناير=20 وفبراير=28. ما الزيادة من يناير إلى فبراير؟`,
      choices, correct, diff: "hard",
      traps: ["طُرح بالعكس.", "قُرّب الفرق.", "جُمع الشهرين."],
      solve: `28 − 20 = ${d}.`,
    });
  }
  push({
    id: "cht-14",
    prompt: `أعمدة حرارة تقديرية لأيام: أحد=31، إثن=29، ثلاث=33، أربع=30. أي يوم الأعلى؟`,
    choices: ["أحد", "إثن", "ثلاث", "أربع"],
    correct: 2, diff: "hard",
    traps: ["أُخذ ثاني أعلى.", "أُخذ الأقل.", "أُخذ يوم الأحد لأنه الأول."],
    solve: `القيم 31، 29، 33، 30؛ الأعلى 33 يوم الثلاث.`,
  });
  {
    const s = 40 + 35 + 25;
    if (s !== 100) throw new Error("pie total");
    push({
      id: "cht-15",
      prompt: `دائرة: أحمر 40، أزرق 35، أخضر 25. ما مجموع الشرائح الثلاث؟`,
      choices: ["90", "95", "100", "110"],
      correct: 2, diff: "hard",
      traps: ["نُسيت شريحة.", "نُقص من المجموع.", "زِيد على المجموع."],
      solve: `40 + 35 + 25 = 100.`,
    });
  }
  push({
    id: "cht-16",
    prompt: `أعمدة زيارات: س1=15، س2=22، س3=18، س4=22. أي أسبوعين متساويان في الأعلى؟`,
    choices: ["س1 وس3", "س2 وس4", "س2 وس3", "س1 وس4"],
    correct: 1, diff: "hard",
    traps: ["قُورنت قيم متوسطة.", "خُلط س3 مع الأعلى.", "خُلط س1 مع الأعلى."],
    solve: `الأعلى 22 عند س2 وس4.`,
  });
  {
    const d = Math.abs(14 - 9);
    const { choices, correct } = shuffleChoices(d, [3, 7, 23], [3, d, 7, 23]);
    push({
      id: "cht-17",
      prompt: `أعمدة: آلة أ=14 وآلة د=9. ما الفرق؟`,
      choices, correct, diff: "hard",
      traps: ["طُرح من آلة أخرى.", "جُمع الآلتين.", "نُصف الفرق خطأ."],
      solve: `14 − 9 = ${d}.`,
    });
  }
  push({
    id: "cht-18",
    prompt: `دائرة ميزانية: إيجار 50، طعام 30، مواصلات 20. أي شريحة تعادل مجموع الطعام والمواصلات؟`,
    choices: ["إيجار", "طعام", "مواصلات", "لا شيء"],
    correct: 0, diff: "hard",
    traps: ["أُخذت شريحة الطعام.", "أُخذت المواصلات.", "اُفترض لا تطابق."],
    solve: `طعام + مواصلات = 30 + 20 = 50 = الإيجار.`,
  });

  const extras = [];
  const pushE = (x) => {
    assertUniqueCorrect(x.choices, x.correct);
    extras.push({ ...x, trick: "charts", sub: "statistics" });
  };
  pushE({
    id: "cht-f01",
    prompt: `أعمدة أهداف: فريق1=5، فريق2=8، فريق3=6. أي فريق الأعلى؟`,
    choices: ["1", "2", "3", "متساوون"],
    correct: 1, diff: "easy",
    traps: ["أُخذ الأوسط.", "أُخذ الأقل.", "اُفترض التساوي."],
    solve: `الأعلى 8 وهو الفريق 2.`,
  });
  {
    const d = 8 - 5;
    const { choices, correct } = shuffleChoices(d, [2, 4, 13], [2, d, 4, 13]);
    pushE({
      id: "cht-f02",
      prompt: `من نفس الأعمدة: فريق1=5 وفريق2=8. ما الفرق؟`,
      choices, correct, diff: "easy",
      traps: ["طُرح مع فريق 3.", "جُمع الفريقين.", "طُرح بالعكس."],
      solve: `8 − 5 = ${d}.`,
    });
  }
  pushE({
    id: "cht-f03",
    prompt: `دائرة ألوان: أصفر 20، بنفسجي 45، رمادي 35. ما لون الشريحة الأكبر؟`,
    choices: ["أصفر", "بنفسجي", "رمادي", "متساوية"],
    correct: 1, diff: "mid",
    traps: ["أُخذ الأصغر.", "أُخذ الأوسط.", "اُفترض التساوي."],
    solve: `45 هو الأكبر؛ البنفسجي.`,
  });
  pushE({
    id: "cht-f04",
    prompt: `أعمدة مطر تقديري (مم): يوم1=12، يوم2=7، يوم3=12، يوم4=9. كم يوماً يساوي الأعلى؟`,
    choices: ["1", "2", "3", "4"],
    correct: 1, diff: "mid",
    traps: ["عُدّ يوم واحد.", "عُدّت ثلاثة أيام.", "عُدّت كل الأيام."],
    solve: `الأعلى 12 في يوم1 ويوم3؛ يومان.`,
  });
  {
    const s = 15 + 22 + 18 + 22;
    const { choices, correct } = shuffleChoices(s, [70, 80, 55], [70, s, 80, 55]);
    pushE({
      id: "cht-f05",
      prompt: `أعمدة زيارات: 15، 22، 18، 22. ما مجموعها؟`,
      choices, correct, diff: "mid",
      traps: ["نُسي عمود.", "زِيد على المجموع.", "جُمع ثلاثة فقط."],
      solve: `15+22+18+22 = ${s}.`,
    });
  }
  pushE({
    id: "cht-f06",
    prompt: `مقارنة فترتين: الصباح عمود=16 والمساء=21. أي فترة أعلى؟`,
    choices: ["صباح", "مساء", "متساويتان", "لا يمكن"],
    correct: 1, diff: "hard",
    traps: ["قُرئ العمود الأقصر أعلى.", "اُفترض التساوي.", "الوصف كافٍ."],
    solve: `21 > 16؛ المساء أعلى.`,
  });
  {
    const d = 33 - 29;
    const { choices, correct } = shuffleChoices(d, [2, 5, 62], [2, d, 5, 62]);
    pushE({
      id: "cht-f07",
      prompt: `أعمدة حرارة: إثن=29 وثلاث=33. ما الفرق؟`,
      choices, correct, diff: "hard",
      traps: ["طُرح يوم آخر.", "جُمع اليومين.", "طُرح بالعكس."],
      solve: `33 − 29 = ${d}.`,
    });
  }

  if (items.length !== 18) throw new Error("charts drill " + items.length);
  if (extras.length !== 7) throw new Error("charts extra");
  return { drill: items, extra: extras };
}

// ───────── PROB SIMPLE ─────────
function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = b; b = a % b; a = t; }
  return a || 1;
}
function simplify(n, d) {
  const g = gcd(n, d);
  return [n / g, d / g];
}
function fracStr(n, d) {
  const [a, b] = simplify(n, d);
  return `${a}/${b}`;
}

function buildProbSimple() {
  const items = [];
  const push = (x) => {
    assertUniqueCorrect(x.choices, x.correct);
    items.push({ ...x, trick: "prob-simple", sub: "probability" });
  };

  // bag red/total
  {
    const red = 3, blue = 5, total = red + blue;
    const ans = fracStr(red, total); // 3/8
    push({
      id: "ps-01",
      prompt: `كيس فيه 3 كرات حمراء و 5 زرقاء. تُسحب كرة واحدة عشوائياً. ما احتمال أن تكون حمراء؟`,
      choices: ["3/5", "3/8", "5/8", "1/3"],
      correct: 1, diff: "easy",
      traps: ["قُسم الأحمر على الأزرق فقط.", "أُخذ احتمال الأزرق.", "نُسي أن الكلي هو المجموع."],
      solve: `المطلوب = 3 والكلي = 3 + 5 = 8. الاحتمال = 3/8.`,
    });
  }
  {
    // die even
    push({
      id: "ps-02",
      prompt: `حجر نرد منتظم من 1 إلى 6. ما احتمال ظهور عدد زوجي؟`,
      choices: ["1/6", "1/3", "1/2", "2/3"],
      correct: 2, diff: "easy",
      traps: ["عُدّ زوجي واحد فقط.", "عُدّ زوجيان فقط من ستة.", "عُدّ أربعة أعداد زوجية خطأ."],
      solve: `الأعداد الزوجية 2 و 4 و 6؛ المطلوب = 3 والكلي = 6. الاحتمال = 3/6 = 1/2.`,
    });
  }
  {
    push({
      id: "ps-03",
      prompt: `صندوق بطاقات فيه 4 بطاقات مميزة من 1 إلى 4. تُسحب بطاقة واحدة. ما احتمال أن يكون الرقم أكبر من 2؟`,
      choices: ["1/4", "1/2", "3/4", "2/3"],
      correct: 1, diff: "easy",
      traps: ["عُدّ رقم واحد فقط.", "عُدّ ثلاثة أرقام أكبر من 2 خطأ (3 و 4 فقط).", "قُسم على 3."],
      solve: `المطلوب: 3 و 4 أي حالتان. الكلي = 4. الاحتمال = 2/4 = 1/2.`,
    });
  }
  {
    const ans = fracStr(2, 7);
    push({
      id: "ps-04",
      prompt: `كيس فيه 2 خضراء و 3 حمراء و 2 زرقاء. ما احتمال سحب خضراء؟`,
      choices: ["2/5", "2/7", "3/7", "2/3"],
      correct: 1, diff: "easy",
      traps: ["قُسم على غير الكلي.", "أُخذ احتمال الأحمر.", "قُسم الأخضر على الأحمر."],
      solve: `المطلوب = 2 والكلي = 2+3+2 = 7. الاحتمال = 2/7.`,
    });
    if (ans !== "2/7") throw new Error(ans);
  }
  {
    push({
      id: "ps-05",
      prompt: `حجر نرد. ما احتمال ظهور 5؟`,
      choices: ["1/5", "1/6", "5/6", "1/2"],
      correct: 1, diff: "easy",
      traps: ["قُسم على 5.", "احتمال عدم ظهور 5.", "خُلط مع احتمال الزوجي."],
      solve: `المطلوب حالة واحدة والكلي 6. الاحتمال = 1/6.`,
    });
  }
  {
    push({
      id: "ps-06",
      prompt: `كيس 10 كرات: منها 4 بيضاء. ما احتمال سحب بيضاء؟`,
      choices: ["4/6", "2/5", "4/10", "1/4"],
      correct: 2, diff: "easy",
      traps: ["قُسم على الباقي فقط.", "بُسّط ثم وُضع في غير محلّه مع خيار خاطئ.", "أُخذ 1 على عدد الأبيض."],
      solve: `المطلوب = 4 والكلي = 10. الاحتمال = 4/10 = 2/5 بعد التبسيط، والخيار المطابق للنص قبل أو بعد — هنا 4/10.`,
    });
  }
  // Fix ps-06: 2/5 is also correct mathematically! Need unique correct.
  items.pop();
  {
    push({
      id: "ps-06",
      prompt: `كيس 10 كرات: منها 4 بيضاء. ما احتمال سحب بيضاء؟`,
      choices: ["4/6", "3/10", "2/5", "1/4"],
      correct: 2, diff: "easy",
      traps: ["قُسم على الباقي فقط.", "أُخذ عدد قريب غير صحيح.", "أُخذ 1 على عدد الأبيض."],
      solve: `المطلوب = 4 والكلي = 10. الاحتمال = 4/10 = 2/5.`,
    });
  }
  {
    push({
      id: "ps-07",
      prompt: `بطاقات من 1 إلى 5. ما احتمال أن يكون الرقم فردياً؟`,
      choices: ["1/5", "2/5", "3/5", "4/5"],
      correct: 2, diff: "mid",
      traps: ["عُدّ فردي واحد.", "عُدّ فرديان فقط.", "عُدّ أربعة أرقام فردية خطأ."],
      solve: `الفردي: 1 و 3 و 5. المطلوب = 3 والكلي = 5. الاحتمال = 3/5.`,
    });
  }

  {
    push({
      id: "ps-08",
      prompt: `كيس فيه 6 كرات حمراء فقط. تُسحب كرة. ما احتمال أن تكون حمراء؟`,
      choices: ["0", "1/6", "1", "6"],
      correct: 2, diff: "mid",
      traps: ["ظُنّ أن الاحتمال صفر.", "قُسم 1 على العدد.", "كُتب العدد بدل الاحتمال."],
      solve: `المطلوب = الكلي = 6. الاحتمال = 6/6 = 1.`,
    });
  }
  {
    push({
      id: "ps-09",
      prompt: `حجر نرد. ما احتمال ظهور عدد أكبر من 4؟`,
      choices: ["1/6", "1/3", "1/2", "2/3"],
      correct: 1, diff: "mid",
      traps: ["عُدّت حالة واحدة (6 فقط).", "عُدّت 4 و 5 و 6.", "عُدّت أربعة أعداد."],
      solve: `أكبر من 4: 5 و 6. المطلوب = 2 والكلي = 6. الاحتمال = 2/6 = 1/3.`,
    });
  }
  {
    push({
      id: "ps-10",
      prompt: `كيس: 5 أحمر و 5 أزرق. ما احتمال سحب أزرق؟`,
      choices: ["1/5", "2/5", "1/2", "5/5"],
      correct: 2, diff: "mid",
      traps: ["قُسم على الأحمر فقط.", "بُسّط خطأ.", "كُتب 5/5."],
      solve: `المطلوب = 5 والكلي = 10. الاحتمال = 5/10 = 1/2.`,
    });
  }
  {
    push({
      id: "ps-11",
      prompt: `صندوق 8 بطاقات متمايزة. بطاقتان منهما تحملان علامة نجمة. ما احتمال سحب بطاقة نجمة؟`,
      choices: ["2/6", "1/8", "1/4", "2/4"],
      correct: 2, diff: "mid",
      traps: ["قُسم على الباقي.", "أُخذ بطاقة واحدة من 8.", "بُسّط مع مقام خاطئ."],
      solve: `المطلوب = 2 والكلي = 8. الاحتمال = 2/8 = 1/4.`,
    });
  }
  {
    push({
      id: "ps-12",
      prompt: `كيس فيه 1 حمراء و 9 زرقاء. ما احتمال سحب حمراء؟`,
      choices: ["1/9", "1/10", "9/10", "1/2"],
      correct: 1, diff: "mid",
      traps: ["قُسم على الأزرق فقط.", "احتمال الأزرق.", "خُلط بالتساوي."],
      solve: `المطلوب = 1 والكلي = 10. الاحتمال = 1/10.`,
    });
  }
  {
    push({
      id: "ps-13",
      prompt: `حجر نرد. ما احتمال ألا يظهر الرقم 1؟`,
      choices: ["1/6", "5/6", "1/5", "4/6"],
      correct: 1, diff: "hard",
      traps: ["أُخذ احتمال ظهور 1.", "قُسم على 5.", "نُسي تبسيط أو عُدّ خطأ."],
      solve: `عدم ظهور 1: 5 حالات من 6. الاحتمال = 5/6.`,
    });
  }
  {
    push({
      id: "ps-14",
      prompt: `كيس: 3 أحمر و 6 أخضر. ما احتمال سحب أخضر؟`,
      choices: ["3/6", "1/3", "2/3", "6/3"],
      correct: 2, diff: "hard",
      traps: ["قُسم الأخضر على الأحمر.", "أُخذ احتمال الأحمر المبسّط.", "كُتب مقلوب النسبة."],
      solve: `المطلوب = 6 والكلي = 9. الاحتمال = 6/9 = 2/3.`,
    });
  }
  {
    push({
      id: "ps-15",
      prompt: `بطاقات من 1 إلى 6. ما احتمال رقم يقبل القسمة على 3؟`,
      choices: ["1/6", "1/3", "1/2", "2/3"],
      correct: 1, diff: "hard",
      traps: ["عُدّت حالة واحدة.", "عُدّت 3 حالات مع 6 خطأ كـ 1/2.", "عُدّت أربعة."],
      solve: `يقبل القسمة على 3: 3 و 6. المطلوب = 2 والكلي = 6. الاحتمال = 2/6 = 1/3.`,
    });
  }
  {
    push({
      id: "ps-16",
      prompt: `كيس فارغ من الأحمر وفيه 7 زرقاء فقط. ما احتمال سحب حمراء؟`,
      choices: ["0", "1/7", "1", "7"],
      correct: 0, diff: "hard",
      traps: ["قُسم 1 على 7.", "ظُنّ الاحتمال مؤكد.", "كُتب العدد."],
      solve: `المطلوب = 0 والكلي = 7. الاحتمال = 0.`,
    });
  }
  {
    push({
      id: "ps-17",
      prompt: `كيس: 4 أصفر و 2 أبيض و 2 أسود. ما احتمال سحب أصفر؟`,
      choices: ["4/6", "1/2", "4/8", "2/4"],
      correct: 1, diff: "hard",
      traps: ["قُسم على غير الكلي.", "تُرك الكسر دون تبسيط مع خيار مكافئ — أُزيل.", "بُسّط خطأ."],
      solve: `المطلوب = 4 والكلي = 8. الاحتمال = 4/8 = 1/2.`,
    });
  }
  // 4/8 and 1/2 are equivalent - only one should appear. Good: correct is 1/2, 4/8 is trap... wait 4/8 equals 1/2! VIOLATION
  items.pop();
  {
    push({
      id: "ps-17",
      prompt: `كيس: 4 أصفر و 2 أبيض و 2 أسود. ما احتمال سحب أصفر؟`,
      choices: ["4/6", "1/2", "2/8", "2/4"],
      correct: 1, diff: "hard",
      traps: ["قُسم على 6 فقط.", "أُخذ عدد غير الأصفر على الكلي.", "بُسّط خطأ إلى 2/4 كأنها إجابة مختلفة المعنى عن نصف؟ 2/4=1/2 أيضاً!"],
      solve: `المطلوب = 4 والكلي = 8. الاحتمال = 4/8 = 1/2.`,
    });
  }
  // 2/4 = 1/2 also! Fix choices
  items.pop();
  {
    push({
      id: "ps-17",
      prompt: `كيس: 4 أصفر و 2 أبيض و 2 أسود. ما احتمال سحب أصفر؟`,
      choices: ["4/6", "1/2", "2/8", "3/8"],
      correct: 1, diff: "hard",
      traps: ["قُسم على مجموع غير كامل.", "أُخذ الأبيض على الكلي.", "أُخذ قيمة قريبة غير صحيحة."],
      solve: `المطلوب = 4 والكلي = 8. الاحتمال = 4/8 = 1/2.`,
    });
  }
  {
    push({
      id: "ps-18",
      prompt: `حجر نرد. ما احتمال ظهور عدد أولي؟ (الأولي هنا: 2 و 3 و 5)`,
      choices: ["1/2", "1/3", "2/3", "1/6"],
      correct: 0, diff: "hard",
      traps: ["عُدّ عددان فقط.", "عُدّ أربعة أعداد.", "عُدّت حالة واحدة."],
      solve: `المطلوب 2 و 3 و 5 أي 3 من 6. الاحتمال = 3/6 = 1/2.`,
    });
  }

  const extras = [];
  const pushE = (x) => {
    assertUniqueCorrect(x.choices, x.correct);
    extras.push({ ...x, trick: "prob-simple", sub: "probability" });
  };
  pushE({
    id: "ps-f01",
    prompt: `كيس 2 أحمر و 2 أزرق. ما احتمال سحب أحمر؟`,
    choices: ["1/4", "1/2", "2/2", "1/3"],
    correct: 1, diff: "easy",
    traps: ["قُسم 1 على الكلي.", "كُتب 2/2.", "نُسي كرة."],
    solve: `المطلوب = 2 والكلي = 4. الاحتمال = 2/4 = 1/2.`,
  });
  pushE({
    id: "ps-f02",
    prompt: `حجر نرد. ما احتمال ظهور 2 أو 4؟`,
    choices: ["1/6", "1/3", "1/2", "2/5"],
    correct: 1, diff: "easy",
    traps: ["حالة واحدة.", "ثلاث حالات.", "خُلط بعددين من 5."],
    solve: `المطلوب حالتان والكلي 6. الاحتمال = 2/6 = 1/3.`,
  });
  pushE({
    id: "ps-f03",
    prompt: `بطاقات 1 إلى 3. ما احتمال الرقم 2؟`,
    choices: ["1/2", "1/3", "2/3", "1"],
    correct: 1, diff: "mid",
    traps: ["قُسم خطأ.", "عُدّ حالتان.", "ظُنّ مؤكد."],
    solve: `المطلوب = 1 والكلي = 3. الاحتمال = 1/3.`,
  });
  pushE({
    id: "ps-f04",
    prompt: `كيس: 7 كرات منها 3 معلّمة. ما احتمال سحب معلّمة؟`,
    choices: ["3/4", "3/7", "4/7", "3/10"],
    correct: 1, diff: "mid",
    traps: ["قُسم على الباقي.", "احتمال غير المعلّمة.", "كُتب مقام خاطئ."],
    solve: `المطلوب = 3 والكلي = 7. الاحتمال = 3/7.`,
  });
  pushE({
    id: "ps-f05",
    prompt: `حجر نرد. ما احتمال عدد أصغر من 3؟`,
    choices: ["1/6", "1/3", "1/2", "2/3"],
    correct: 1, diff: "mid",
    traps: ["عُدّت 1 فقط.", "عُدّت 1 و 2 و 3.", "عُدّت أربعة."],
    solve: `أصغر من 3: 1 و 2. الاحتمال = 2/6 = 1/3.`,
  });
  pushE({
    id: "ps-f06",
    prompt: `كيس 5 خضراء و 1 حمراء. ما احتمال سحب خضراء؟`,
    choices: ["1/5", "1/6", "5/6", "5/1"],
    correct: 2, diff: "hard",
    traps: ["قُسم 1 على الأخضر.", "احتمال الأحمر.", "كُتب مقلوب."],
    solve: `المطلوب = 5 والكلي = 6. الاحتمال = 5/6.`,
  });
  pushE({
    id: "ps-f07",
    prompt: `بطاقات من 1 إلى 8. ما احتمال رقم زوجي؟`,
    choices: ["1/8", "1/4", "1/2", "3/8"],
    correct: 2, diff: "hard",
    traps: ["عُدّت حالة.", "عُدّت حالتان.", "عُدّت ثلاث."],
    solve: `الزوجي: 2,4,6,8 أي 4 من 8. الاحتمال = 4/8 = 1/2.`,
  });

  if (items.length !== 18) throw new Error("ps drill " + items.length);
  if (extras.length !== 7) throw new Error("ps extra");
  return { drill: items, extra: extras };
}

// ───────── WITHOUT REPLACE ─────────
function buildWithoutReplace() {
  const items = [];
  const push = (x) => {
    assertUniqueCorrect(x.choices, x.correct);
    items.push({ ...x, trick: "prob-without-replace", sub: "probability" });
  };

  // Two reds in a row from 4R+2B
  // (4/6)*(3/5)=12/30=2/5
  push({
    id: "pwr-01",
    prompt: `كيس فيه 4 حمراء و 2 زرقاء. تُسحب كرتان متتاليتان بلا إرجاع. ما احتمال أن تكونا حمراوين؟`,
    choices: ["4/6", "2/5", "16/36", "1/2"],
    correct: 1, diff: "easy",
    traps: ["وُقف عند السحبة الأولى فقط.", "حُسب كأنه بإرجاع: (4/6)×(4/6).", "قُرّب دون ضرب الاحتمالين."],
    solve: `الأولى حمراء: 4/6. بعد سحبها يبقى 3 حمراء من 5. الثانية: 3/5. الاحتمال = (4/6)×(3/5) = 12/30 = 2/5.`,
  });
  // trap 16/36 = (4/6)^2 with replacement

  // first red then blue: (4/6)*(2/5)=8/30=4/15
  push({
    id: "pwr-02",
    prompt: `نفس الكيس: 4 حمراء و 2 زرقاء بلا إرجاع. ما احتمال حمراء ثم زرقاء؟`,
    choices: ["4/15", "8/36", "1/3", "2/5"],
    correct: 0, diff: "easy",
    traps: ["حُسب بإرجاع (4/6)×(2/6).", "بُسّط خطأ.", "أُخذ احتمال حمراوين."],
    solve: `(4/6)×(2/5) = 8/30 = 4/15.`,
  });

  // after drawing one red, P(second red)
  push({
    id: "pwr-03",
    prompt: `كيس 3 أحمر و 3 أزرق. سُحبت حمراء أولاً بلا إرجاع. ما احتمال أن تكون الثانية حمراء؟`,
    choices: ["3/6", "2/5", "3/5", "2/6"],
    correct: 1, diff: "easy",
    traps: ["لم يُحدَّث المقام (بقي 3/6).", "زيد البسط خطأ.", "نُقص البسط والمقام كإرجاع جزئي خاطئ."],
    solve: `بعد سحب حمراء: أحمر 2 والكلي 5. الاحتمال = 2/5.`,
  });

  push({
    id: "pwr-04",
    prompt: `كيس 5 بطاقات حمراء و 1 زرقاء. سحبتان بلا إرجاع. ما احتمال زرقاوين؟`,
    choices: ["0", "1/6", "1/30", "1/5"],
    correct: 0, diff: "easy",
    traps: ["ظُنّ وجود زرقاوين.", "حُسب مسار واحد مستحيل ككسر.", "خُلط مع احتمال زرقاء واحدة."],
    solve: `يوجد زرقاء واحدة فقط؛ لا يمكن سحب زرقاوين. الاحتمال = 0.`,
  });

  // (3/5)*(2/4)=6/20=3/10 two green from 3G+2R
  push({
    id: "pwr-05",
    prompt: `كيس 3 خضراء و 2 حمراء. سحبتان بلا إرجاع. ما احتمال خضراوين؟`,
    choices: ["3/5", "9/25", "3/10", "1/2"],
    correct: 2, diff: "easy",
    traps: ["وُقف عند الأولى.", "بإرجاع (3/5)×(3/5).", "قُرّب."],
    solve: `(3/5)×(2/4) = 6/20 = 3/10.`,
  });

  push({
    id: "pwr-06",
    prompt: `كيس 2 أبيض و 2 أسود. سُحب أبيض أولاً بلا إرجاع. ما احتمال أن تكون الثانية سوداء؟`,
    choices: ["2/4", "2/3", "1/3", "1/4"],
    correct: 1, diff: "easy",
    traps: ["لم يُحدَّث الكلي.", "نُقص بسط الأسود خطأ.", "قُسم خطأ على 4."],
    solve: `بعد سحب أبيض: أسود 2 والكلي 3. الاحتمال = 2/3.`,
  });

  // both blue from 4R+2B: (2/6)*(1/5)=2/30=1/15
  push({
    id: "pwr-07",
    prompt: `كيس 4 حمراء و 2 زرقاء بلا إرجاع. ما احتمال زرقاوين؟`,
    choices: ["1/15", "4/36", "1/5", "2/6"],
    correct: 0, diff: "mid",
    traps: ["حُسب كأنه بإرجاع.", "قُسم خطأ.", "وُقف عند السحبة الأولى."],
    solve: `(2/6)×(1/5) = 2/30 = 1/15.`,
  });

  push({
    id: "pwr-08",
    prompt: `كيس 5 أحمر و 3 أخضر. سُحبت حمراء أولاً. ما احتمال الثانية خضراء؟`,
    choices: ["3/8", "3/7", "5/7", "2/7"],
    correct: 1, diff: "mid",
    traps: ["لم يُحدَّث المقام.", "أُخذ احتمال حمراء ثانية.", "نُقص الأخضر خطأ."],
    solve: `بعد حمراء: أخضر 3 والكلي 7. الاحتمال = 3/7.`,
  });

  // red then red from 5R+3G: (5/8)*(4/7)=20/56=5/14
  push({
    id: "pwr-09",
    prompt: `كيس 5 أحمر و 3 أخضر بلا إرجاع. ما احتمال حمراوين؟`,
    choices: ["5/8", "25/64", "5/14", "1/2"],
    correct: 2, diff: "mid",
    traps: ["الأولى فقط.", "بإرجاع.", "تقريب."],
    solve: `(5/8)×(4/7) = 20/56 = 5/14.`,
  });

  push({
    id: "pwr-10",
    prompt: `كيس 6 كرات متمايزة السحب عشوائي. سُحبت كرة وبقيت 5. ما الكلي في السحبة الثانية؟`,
    choices: ["6", "5", "4", "7"],
    correct: 1, diff: "mid",
    traps: ["بقي الكلي 6 كإرجاع.", "نُقص أكثر من كرة.", "زِيد الكلي."],
    solve: `بلا إرجاع ينقص الكلي واحداً فيصير 5.`,
  });

  // (2/4)*(1/3)=2/12=1/6 two same from 2A+2B asking both A
  push({
    id: "pwr-11",
    prompt: `كيس بطاقتان «أ» وبطاقتان «ب». سحبتان بلا إرجاع. ما احتمال «أ» ثم «أ»؟`,
    choices: ["1/4", "1/6", "1/2", "1/3"],
    correct: 1, diff: "mid",
    traps: ["حُسب كأنه بإرجاع.", "وُقف عند السحبة الأولى.", "تُرك الكسر دون ضرب."],
    solve: `(2/4)×(1/3) = 2/12 = 1/6.`,
  });

  push({
    id: "pwr-12",
    prompt: `كيس 4 أصفر و 1 أحمر. سُحب أصفر أولاً بلا إرجاع. ما احتمال الثانية أصفر؟`,
    choices: ["4/5", "3/4", "3/5", "1/4"],
    correct: 1, diff: "mid",
    traps: ["لم يُحدَّث.", "نُقص الكلي دون البسط فقط بشكل خاطئ مع خيار 3/5.", "نُقص أكثر."],
    solve: `بعد أصفر: أصفر 3 والكلي 4. الاحتمال = 3/4.`,
  });

  // order blue then red: (2/6)*(4/5)=8/30=4/15
  push({
    id: "pwr-13",
    prompt: `كيس 4 حمراء و 2 زرقاء بلا إرجاع. ما احتمال زرقاء ثم حمراء؟`,
    choices: ["4/15", "8/36", "1/3", "2/5"],
    correct: 0, diff: "hard",
    traps: ["بإرجاع.", "تقريب.", "خُلط مع حمراء ثم زرقاء بنفس القيمة — هنا نفس الناتج 4/15 أيضاً!"],
    solve: `(2/6)×(4/5) = 8/30 = 4/15.`,
  });

  push({
    id: "pwr-14",
    prompt: `كيس 7 كرات: 4 معلّمة. سُحبت معلّمة أولاً. ما احتمال أن تكون الثانية غير معلّمة؟`,
    choices: ["3/7", "3/6", "4/6", "2/6"],
    correct: 1, diff: "hard",
    traps: ["لم يُحدَّث المقام.", "أُخذ معلّمة ثانية.", "نُقص غير المعلّم خطأ."],
    solve: `غير المعلّم أصلاً 3. بعد سحب معلّمة: غير معلّم 3 والكلي 6. الاحتمال = 3/6 = 1/2، والخيار 3/6.`,
  });

  // (4/7)*(3/6)=12/42=2/7 two marked
  push({
    id: "pwr-15",
    prompt: `كيس 7 كرات منها 4 معلّمة. سحبتان بلا إرجاع. ما احتمال معلّمتين؟`,
    choices: ["4/7", "16/49", "2/7", "1/2"],
    correct: 2, diff: "hard",
    traps: ["الأولى فقط.", "بإرجاع.", "تقريب."],
    solve: `(4/7)×(3/6) = 12/42 = 2/7.`,
  });

  push({
    id: "pwr-16",
    prompt: `كيس 3 أحمر فقط. سحبتان بلا إرجاع. ما احتمال حمراوين؟`,
    choices: ["1", "2/3", "1/2", "0"],
    // (3/3)*(2/2)=1
    correct: 0, diff: "hard",
    traps: ["ظُنّ 2/3.", "ظُنّ 1/2.", "ظُنّ صفراً."],
    solve: `(3/3)×(2/2) = 1.`,
  });

  push({
    id: "pwr-17",
    prompt: `كيس 6 أحمر و 2 أزرق. سُحب أزرق أولاً. ما احتمال الثانية أحمر؟`,
    choices: ["6/8", "6/7", "5/7", "2/7"],
    correct: 1, diff: "hard",
    traps: ["لم يُحدَّث الكلي.", "نُقص الأحمر خطأ.", "أُخذ احتمال أزرق."],
    solve: `بعد أزرق: أحمر 6 والكلي 7. الاحتمال = 6/7.`,
  });

  // (6/8)*(5/7)=30/56=15/28
  push({
    id: "pwr-18",
    prompt: `كيس 6 أحمر و 2 أزرق بلا إرجاع. ما احتمال حمراوين؟`,
    choices: ["6/8", "36/64", "15/28", "5/7"],
    correct: 2, diff: "hard",
    traps: ["وُقف عند السحبة الأولى.", "حُسب كأنه بإرجاع.", "أُخذ احتمال السحبة الثانية فقط."],
    solve: `(6/8)×(5/7) = 30/56 = 15/28.`,
  });

  const extras = [];
  const pushE = (x) => {
    assertUniqueCorrect(x.choices, x.correct);
    extras.push({ ...x, trick: "prob-without-replace", sub: "probability" });
  };
  pushE({
    id: "pwr-f01",
    prompt: `كيس 2 أحمر و 1 أزرق. سُحب أحمر أولاً بلا إرجاع. ما احتمال الثانية أحمر؟`,
    choices: ["2/3", "1/2", "1/3", "2/2"],
    correct: 1, diff: "easy",
    traps: ["لم يُحدَّث.", "نُقص أكثر.", "كُتب 2/2."],
    solve: `بعد أحمر: أحمر 1 والكلي 2. الاحتمال = 1/2.`,
  });
  pushE({
    id: "pwr-f02",
    prompt: `كيس 2 أحمر و 1 أزرق بلا إرجاع. ما احتمال حمراوين؟`,
    choices: ["1/3", "4/9", "2/3", "1/2"],
    // (2/3)*(1/2)=1/3
    correct: 0, diff: "easy",
    traps: ["بإرجاع.", "وُقف عند الأولى.", "تقريب."],
    solve: `(2/3)×(1/2) = 2/6 = 1/3.`,
  });
  pushE({
    id: "pwr-f03",
    prompt: `كيس 4 أخضر و 4 أصفر. سُحب أخضر أولاً. ما احتمال الثانية أصفر؟`,
    choices: ["4/8", "4/7", "3/7", "3/8"],
    correct: 1, diff: "mid",
    traps: ["لم يُحدَّث المقام.", "نُقص الأصفر خطأ.", "قُسم خطأ."],
    solve: `أصفر 4 والكلي 7. الاحتمال = 4/7.`,
  });
  // Note: 1/2 ≠ 4/7 OK
  pushE({
    id: "pwr-f04",
    prompt: `كيس 3 بطاقات «نعم» و 2 «لا». سحبتان بلا إرجاع. ما احتمال «نعم» ثم «لا»؟`,
    choices: ["3/10", "6/25", "1/2", "2/5"],
    // (3/5)*(2/4)=6/20=3/10
    correct: 0, diff: "mid",
    traps: ["بإرجاع.", "وُقف عند الأولى.", "خُلط ترتيب."],
    solve: `(3/5)×(2/4) = 6/20 = 3/10.`,
  });
  pushE({
    id: "pwr-f05",
    prompt: `كيس 10 كرات منها 1 ذهبية. سُحبت غير ذهبية أولاً. ما احتمال الثانية ذهبية؟`,
    choices: ["1/10", "1/9", "9/10", "0"],
    correct: 1, diff: "mid",
    traps: ["لم يُحدَّث المقام.", "احتمال غير الذهبية.", "ظُنّ انعدام الذهبية."],
    solve: `الذهبية ما زالت 1 والكلي صار 9. الاحتمال = 1/9.`,
  });
  pushE({
    id: "pwr-f06",
    prompt: `كيس 5 أحمر و 5 أزرق بلا إرجاع. ما احتمال زرقاوين؟`,
    choices: ["1/4", "5/9", "2/9", "1/2"],
    // (5/10)*(4/9)=20/90=2/9
    correct: 2, diff: "hard",
    traps: ["قُرّب الناتج.", "حُسب كأنه بإرجاع أو مسار خاطئ.", "وُقف عند نصف السحبة الأولى."],
    solve: `(5/10)×(4/9) = 20/90 = 2/9.`,
  });
  pushE({
    id: "pwr-f07",
    prompt: `كيس 1 أحمر و 4 أزرق. سحبتان بلا إرجاع. ما احتمال أحمر ثم أزرق؟`,
    choices: ["1/5", "4/20", "4/25", "1/4"],
    // (1/5)*(4/4)=4/20=1/5 — wait (1/5)*1=1/5
    // choices have both 1/5 and 4/20 which are equal!
    correct: 0, diff: "hard",
    traps: ["تُرك الجداء دون تبسيط مع مكافئ — يُزال.", "بإرجاع.", "نُسي تحديث."],
    solve: `(1/5)×(4/4) = 4/20 = 1/5.`,
  });
  // Fix f07 equivalent choices
  extras.pop();
  pushE({
    id: "pwr-f07",
    prompt: `كيس 1 أحمر و 4 أزرق. سحبتان بلا إرجاع. ما احتمال أحمر ثم أزرق؟`,
    choices: ["1/5", "4/25", "1/4", "2/5"],
    correct: 0, diff: "hard",
    traps: ["بإرجاع (1/5)×(4/5).", "نُسي أن الثانية أزرق مؤكدة تقريباً مع مقام خاطئ.", "خُلط البسط."],
    solve: `(1/5)×(4/4) = 1/5.`,
  });

  if (items.length !== 18) throw new Error("pwr drill " + items.length);
  if (extras.length !== 7) throw new Error("pwr extra " + extras.length);
  return { drill: items, extra: extras };
}

// ───────── DATA PERCENT ─────────
function buildDataPercent() {
  const items = [];
  const push = (x) => {
    assertUniqueCorrect(x.choices, x.correct);
    items.push({ ...x, trick: "data-percent", sub: "statistics" });
  };

  // 40/100*100=40
  push({
    id: "dp-01",
    prompt: `جدول مبيعات:\nكتب 40، أقلام 25، دفاتر 35.\nما نسبة الكتب من المجموع؟`,
    choices: ["25٪", "35٪", "40٪", "50٪"],
    correct: 2, diff: "easy",
    traps: ["أُخذت فئة الأقلام.", "أُخذت فئة الدفاتر.", "قُسم خطأ."],
    solve: `المجموع = 40+25+35 = 100. نسبة الكتب = 40 ÷ 100 × 100 = 40٪.`,
  });
  // 25/100=25
  push({
    id: "dp-02",
    prompt: `من الجدول نفسه: كتب 40، أقلام 25، دفاتر 35. ما نسبة الأقلام؟`,
    choices: ["25٪", "40٪", "35٪", "60٪"],
    correct: 0, diff: "easy",
    traps: ["أُخذت الكتب.", "أُخذت الدفاتر.", "نُسب إلى غير المجموع."],
    solve: `25 ÷ 100 × 100 = 25٪.`,
  });
  // 48/(48+12+20)=48/80=60
  push({
    id: "dp-03",
    prompt: `حضور:\nناجح 48، راسب 12، غائب 20.\nما نسبة الناجحين؟`,
    choices: ["48٪", "60٪", "80٪", "12٪"],
    correct: 1, diff: "easy",
    traps: ["كُتب العدد نسبةً مباشرة دون قسمة على المجموع.", "أُخذ المجموع نفسه.", "أُخذت نسبة الراسب."],
    solve: `المجموع = 80. النسبة = 48 ÷ 80 × 100 = 60٪.`,
  });
  // 15/100=15
  push({
    id: "dp-04",
    prompt: `ألوان:\nأحمر 15، أزرق 35، أخضر 50.\nما نسبة الأحمر؟`,
    choices: ["15٪", "35٪", "50٪", "65٪"],
    correct: 0, diff: "easy",
    traps: ["أُخذ الأزرق.", "أُخذ الأخضر.", "جُمع لونان."],
    solve: `المجموع 100. 15 ÷ 100 × 100 = 15٪.`,
  });
  // 12/80=15
  push({
    id: "dp-05",
    prompt: `حضور: ناجح 48، راسب 12، غائب 20. ما نسبة الراسبين؟`,
    choices: ["12٪", "15٪", "20٪", "25٪"],
    correct: 1, diff: "easy",
    traps: ["كُتب العدد 12 كنسبة.", "أُخذ الغائب.", "قُسم على 48."],
    solve: `12 ÷ 80 × 100 = 15٪.`,
  });
  // 35/100
  push({
    id: "dp-06",
    prompt: `مبيعات: كتب 40، أقلام 25، دفاتر 35. ما نسبة الدفاتر؟`,
    choices: ["25٪", "35٪", "40٪", "75٪"],
    correct: 1, diff: "easy",
    traps: ["أقلام.", "كتب.", "مجموع فئتين."],
    solve: `35 ÷ 100 × 100 = 35٪.`,
  });

  // 30/(50+30+20)=30/100=30
  push({
    id: "dp-07",
    prompt: `مواد:\nرياضيات 50، علوم 30، عربي 20.\nما نسبة العلوم؟`,
    choices: ["20٪", "30٪", "50٪", "60٪"],
    correct: 1, diff: "mid",
    traps: ["عربي.", "رياضيات.", "علوم+عربي."],
    solve: `المجموع 100. 30 ÷ 100 × 100 = 30٪.`,
  });

  // 18/(18+27+15)=18/60=30
  push({
    id: "dp-08",
    prompt: `جدول:\nصباح 18، ظهر 27، مساء 15.\nما نسبة فترة الصباح من المجموع؟`,
    choices: ["18٪", "30٪", "45٪", "27٪"],
    correct: 1, diff: "mid",
    traps: ["كُتب 18٪ مباشرة.", "قُسم على غير المجموع.", "أُخذ الظهر."],
    solve: `المجموع = 60. 18 ÷ 60 × 100 = 30٪.`,
  });

  // 27/60=45
  push({
    id: "dp-09",
    prompt: `من الجدول: صباح 18، ظهر 27، مساء 15. ما نسبة الظهر؟`,
    choices: ["27٪", "45٪", "30٪", "50٪"],
    correct: 1, diff: "mid",
    traps: ["كُتب العدد نسبة.", "أُخذ الصباح.", "قُرّب خطأ."],
    solve: `27 ÷ 60 × 100 = 45٪.`,
  });

  // 9/(9+21+10)=9/40=22.5 — use integers: 10/(10+20+20)=10/50=20
  push({
    id: "dp-10",
    prompt: `مبيعات فروع:\nفرع أ 10، فرع ب 20، فرع ج 20.\nما نسبة فرع أ؟`,
    choices: ["10٪", "20٪", "40٪", "50٪"],
    correct: 1, diff: "mid",
    traps: ["كُتب 10٪ مباشرة.", "أُخذ فرع ب.", "مجموع ب وج."],
    solve: `المجموع = 50. 10 ÷ 50 × 100 = 20٪.`,
  });

  // 20/50=40 for B
  push({
    id: "dp-11",
    prompt: `فروع: أ 10، ب 20، ج 20. ما نسبة فرع ب؟`,
    choices: ["20٪", "40٪", "50٪", "10٪"],
    correct: 1, diff: "mid",
    traps: ["كُتب العدد.", "أُخذ نصف المجموع خطأ كـ 50٪ دون فرع.", "أُخذ أ."],
    solve: `20 ÷ 50 × 100 = 40٪.`,
  });

  // 24/(24+16)=24/40=60
  push({
    id: "dp-12",
    prompt: `جدول عمودين:\nنجاح 24، تعثر 16.\nما نسبة النجاح؟`,
    choices: ["24٪", "40٪", "60٪", "16٪"],
    correct: 2, diff: "mid",
    traps: ["كُتب العدد.", "كُتب المجموع.", "نسبة التعثر."],
    solve: `المجموع 40. 24 ÷ 40 × 100 = 60٪.`,
  });

  // 35/ (35+15)=70
  push({
    id: "dp-13",
    prompt: `استطلاع:\nموافق 35، غير موافق 15.\nما نسبة الموافقين؟`,
    choices: ["35٪", "70٪", "15٪", "50٪"],
    correct: 1, diff: "hard",
    traps: ["كُتب العدد.", "نسبة الغير.", "ظُنّ مناصفة."],
    solve: `المجموع 50. 35 ÷ 50 × 100 = 70٪.`,
  });

  // 8/32=25
  push({
    id: "dp-14",
    prompt: `جدول:\nأ 8، ب 12، ج 12.\nما نسبة فئة أ؟`,
    choices: ["8٪", "25٪", "33٪", "50٪"],
    correct: 1, diff: "hard",
    traps: ["كُتب العدد.", "قُسم على 3 فئات بالتساوي تقريباً.", "قُسم أ على ب."],
    solve: `المجموع 32. 8 ÷ 32 × 100 = 25٪.`,
  });

  // 45/90=50
  push({
    id: "dp-15",
    prompt: `مبيعات:\nمدينة 45، قرية 30، طريق 15.\nما نسبة المدينة؟`,
    choices: ["45٪", "50٪", "30٪", "75٪"],
    correct: 1, diff: "hard",
    traps: ["كُتب العدد.", "أُخذت القرية.", "مدينة+قرية."],
    solve: `المجموع 90. 45 ÷ 90 × 100 = 50٪.`,
  });

  // 30/90=33.333 — avoid; use 36/90=40
  push({
    id: "dp-16",
    prompt: `مبيعات:\nمدينة 45، قرية 27، طريق 18.\nما نسبة القرية؟`,
    choices: ["27٪", "30٪", "40٪", "33٪"],
    // 27/90=0.3=30
    correct: 1, diff: "hard",
    traps: ["كُتب العدد.", "قُسم خطأ إلى 40.", "قُرّب إلى 33."],
    solve: `المجموع 90. 27 ÷ 90 × 100 = 30٪.`,
  });

  // 14/(14+21+15)=14/50=28
  push({
    id: "dp-17",
    prompt: `جدول حصص:\nنشاط أ 14، نشاط ب 21، نشاط ج 15.\nما نسبة النشاط أ؟`,
    choices: ["14٪", "28٪", "42٪", "50٪"],
    correct: 1, diff: "hard",
    traps: ["كُتب العدد.", "نسبة ب.", "نصف تقريبي."],
    solve: `المجموع 50. 14 ÷ 50 × 100 = 28٪.`,
  });

  // 21/50=42
  push({
    id: "dp-18",
    prompt: `من الجدول: أ 14، ب 21، ج 15. ما نسبة النشاط ب؟`,
    choices: ["21٪", "42٪", "28٪", "35٪"],
    correct: 1, diff: "hard",
    traps: ["كُتب العدد.", "نسبة أ.", "قُسم خطأ."],
    solve: `21 ÷ 50 × 100 = 42٪.`,
  });

  const extras = [];
  const pushE = (x) => {
    assertUniqueCorrect(x.choices, x.correct);
    extras.push({ ...x, trick: "data-percent", sub: "statistics" });
  };
  pushE({
    id: "dp-f01",
    prompt: `جدول: تفاح 20، برتقال 30. ما نسبة التفاح؟`,
    choices: ["20٪", "40٪", "30٪", "50٪"],
    correct: 1, diff: "easy",
    traps: ["كُتب العدد.", "نسبة البرتقال.", "ظُنّ مناصفة."],
    solve: `المجموع 50. 20 ÷ 50 × 100 = 40٪.`,
  });
  pushE({
    id: "dp-f02",
    prompt: `ناجح 36، راسب 14. ما نسبة الناجح؟`,
    choices: ["36٪", "72٪", "14٪", "50٪"],
    // 36/50=72
    correct: 1, diff: "easy",
    traps: ["كُتب العدد.", "نسبة الراسب.", "مناصفة."],
    solve: `المجموع 50. 36 ÷ 50 × 100 = 72٪.`,
  });
  pushE({
    id: "dp-f03",
    prompt: `أ 25، ب 25، ج 50. ما نسبة ج؟`,
    choices: ["25٪", "50٪", "75٪", "100٪"],
    correct: 1, diff: "mid",
    traps: ["أ.", "أ+ب.", "الكل."],
    solve: `المجموع 100. 50 ÷ 100 × 100 = 50٪.`,
  });
  pushE({
    id: "dp-f04",
    prompt: `ذكور 18، إناث 27. ما نسبة الإناث؟`,
    choices: ["27٪", "60٪", "40٪", "45٪"],
    // 27/45=60
    correct: 1, diff: "mid",
    traps: ["كُتب العدد.", "نسبة الذكور 18/45=40.", "قُرّب."],
    solve: `المجموع 45. 27 ÷ 45 × 100 = 60٪.`,
  });
  pushE({
    id: "dp-f05",
    prompt: `صباح 16، مساء 24. ما نسبة الصباح؟`,
    choices: ["16٪", "40٪", "60٪", "24٪"],
    // 16/40=40
    correct: 1, diff: "mid",
    traps: ["كُتب العدد.", "نسبة المساء.", "كُتب 24."],
    solve: `المجموع 40. 16 ÷ 40 × 100 = 40٪.`,
  });
  pushE({
    id: "dp-f06",
    prompt: `أ 9، ب 21، ج 10. ما نسبة ب؟`,
    choices: ["21٪", "50٪", "52.5٪", "70٪"],
    // 21/40=52.5 — avoid decimal; change
    correct: 1, diff: "hard",
    traps: [],
    solve: "",
  });
  extras.pop();
  pushE({
    id: "dp-f06",
    prompt: `أ 10، ب 20، ج 10. ما نسبة ب؟`,
    choices: ["20٪", "50٪", "25٪", "40٪"],
    // 20/40=50
    correct: 1, diff: "hard",
    traps: ["كُتب العدد.", "نسبة أ.", "قُسم خطأ إلى 40٪."],
    solve: `المجموع 40. 20 ÷ 40 × 100 = 50٪.`,
  });
  pushE({
    id: "dp-f07",
    prompt: `جدول ثلاث فئات: 12 و 18 و 10. ما نسبة الفئة الوسطى (18)؟`,
    choices: ["18٪", "45٪", "40٪", "30٪"],
    // 18/40=45
    correct: 1, diff: "hard",
    traps: ["كُتب العدد.", "قُسم على 45 خطأ كـ 40٪.", "قُسم 12/40."],
    solve: `المجموع 40. 18 ÷ 40 × 100 = 45٪.`,
  });

  if (items.length !== 18) throw new Error("dp drill " + items.length);
  if (extras.length !== 7) throw new Error("dp extra");
  return { drill: items, extra: extras };
}

function emitSkill(fileBase, meta, bank) {
  const intuition = JSON.stringify(meta.intuition, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? line : `  ${line}`))
    .join("\n");
  const body = `import type { Skill } from "@/lib/types";

const review = ${review};

export const ${meta.exportName}: Skill = {
  id: ${JSON.stringify(meta.id)},
  title_ar: ${JSON.stringify(meta.title)},
  domain: "statistics",
  hook_ar: ${JSON.stringify(meta.hook)},
  estimated_minutes: 7,
  icon: ${JSON.stringify(meta.icon)},
  visual: { kind: "custom", component: ${JSON.stringify(meta.lab)} },
  intuition_ar: ${intuition},
  trick_ar: {
    statement: ${JSON.stringify(meta.trick.statement)},
    steps: ${JSON.stringify(meta.trick.steps, null, 6).replace(/\n/g, "\n    ")},
    time_target_sec: ${meta.timing.excellent_sec},
    example_ar: ${JSON.stringify(meta.trick.example)},
  },
  timing: {
    excellent_sec: ${meta.timing.excellent_sec},
    good_sec: ${meta.timing.good_sec},
    ok_sec: ${meta.timing.ok_sec},
    slow_sec: ${meta.timing.slow_sec},
  },
  review_status: "approved",
  reviewed_by: "founder",
  reviewed_at: "2026-09-13T00:00:00.000Z",
  drill: [
${bank.drill.map(q).join(",\n")},
  ],
  final_extra: [
${bank.extra.map(q).join(",\n")},
  ],
};
`;
  fs.writeFileSync(path.join(outDir, `${fileBase}.ts`), body, "utf8");
  console.log("wrote", fileBase, "drill", bank.drill.length, "extra", bank.extra.length);
}

fs.mkdirSync(outDir, { recursive: true });

emitSkill("tables", {
  exportName: "tables",
  id: "tables",
  title: "قراءة الجداول",
  hook: "استخرج المطلوب من الصف والعمود",
  icon: "▦",
  lab: "tables-lab",
  intuition: [
    "الجدول صفوف وأعمدة؛ اقرأ تقاطع الصف مع العمود.",
    "مجموع الصف = جمع أرقام ذلك الصف فقط.",
    "الفرق = اطرح الرقمين المطلوبين بدقة.",
    "لمعرفة أكبر صف: احسب مجموع كل صف ثم قارن.",
  ],
  trick: {
    statement: "حدّد الصف والعمود أولاً، ثم اجمع أو اطرح — لا تخلط الصفوف.",
    steps: [
      "اقرأ عنوان الصف وعنوان العمود",
      "استخرج الرقم أو اجمع صفّاً أو عموداً كاملاً",
      "إن طُلب الأكبر: قارن المجاميع لا خلية واحدة عشوائية",
    ],
    example: "صباح: كتب 12 وأقلام 8. مجموع صف الصباح = 12 + 8 = 20.",
  },
  timing: { excellent_sec: 20, good_sec: 30, ok_sec: 40, slow_sec: 54 },
}, buildTables());

emitSkill("charts", {
  exportName: "charts",
  id: "charts",
  title: "قراءة الرسوم",
  hook: "أعلى، أقل، ومقارنة فترتين",
  icon: "▥",
  lab: "charts-lab",
  intuition: [
    "في الأعمدة: الأطول هو الأكبر قيمة.",
    "لقراءة قيمة: انظر إلى الرقم المكتوب على العمود أو الشريحة.",
    "لمقارنة فترتين: اطرح الأصغر من الأكبر.",
    "في الدائرة: الأكبر مساحةً هو الأكبر عدداً إن وُجدت الأرقام.",
  ],
  trick: {
    statement: "اقرأ الرقم من الرسم مباشرة، ثم قارن أو اطرح — بلا تخمين بصري فقط.",
    steps: [
      "حدّد أعلى أو أقل عمود/شريحة",
      "إن طُلب فرق فترتين: اطرح القيمتين",
      "إن طُلب مجموع أعمدة: اجمعها كما في الجدول",
    ],
    example: "أعمدة: سبت 4 وثلاث 9. الفرق = 9 − 4 = 5.",
  },
  timing: { excellent_sec: 18, good_sec: 28, ok_sec: 38, slow_sec: 52 },
}, buildCharts());

emitSkill("prob-simple", {
  exportName: "probSimple",
  id: "prob-simple",
  title: "الاحتمال البسيط",
  hook: "المطلوب تقسيم الكلي",
  icon: "◉",
  lab: "prob-simple-lab",
  intuition: [
    "الاحتمال البسيط = عدد حالات المطلوب ÷ عدد الحالات الكلي.",
    "عدّ المطلوب بعناية، ثم عدّ الكلي من الكيس أو الحجر أو البطاقات.",
    "بسّط الكسر إن أمكن بعد القسمة.",
    "سحبة واحدة فقط في هذه المهارة — بلا سحبتين متتاليتين.",
  ],
  trick: {
    statement: "اكتب كسراً واحداً: المطلوب على الكلي.",
    steps: [
      "عدّ حالات المطلوب",
      "عدّ الكلي",
      "اقسم وبسّط",
    ],
    example: "3 حمراء من 8 كرات: الاحتمال = 3 ÷ 8.",
  },
  timing: { excellent_sec: 16, good_sec: 26, ok_sec: 36, slow_sec: 50 },
}, buildProbSimple());

emitSkill("prob-without-replace", {
  exportName: "probWithoutReplace",
  id: "prob-without-replace",
  title: "احتمال بلا إرجاع",
  hook: "سحبتان — حدّث المقام",
  icon: "◎",
  lab: "prob-without-replace-lab",
  intuition: [
    "بلا إرجاع: بعد السحبة الأولى ينقص المطلوب أو الكلي.",
    "احتمال السحبتين = احتمال الأولى × احتمال الثانية بعد التحديث.",
    "المصيدة الشائعة: الإبقاء على نفس المقام كأن السحب بإرجاع.",
    "لا تكتفِ بالسحبة الأولى إن طُلبت سحبتان.",
  ],
  trick: {
    statement: "حدّث البسط والمقام بعد السحبة الأولى، ثم اضرب.",
    steps: [
      "اكتب احتمال السحبة الأولى",
      "أنقص الكرة المسحوبة من العدّ",
      "اضرب في احتمال السحبة الثانية بالمقام الجديد",
    ],
    example: "4 حمراء من 6 ثم حمراء ثانية: (4 ÷ 6) × (3 ÷ 5) = 2 ÷ 5.",
  },
  timing: { excellent_sec: 22, good_sec: 32, ok_sec: 42, slow_sec: 56 },
}, buildWithoutReplace());

emitSkill("data-percent", {
  exportName: "dataPercent",
  id: "data-percent",
  title: "نسب من بيانات",
  hook: "نسبة فئة من مجموع الجدول",
  icon: "％",
  lab: "data-percent-lab",
  intuition: [
    "نسبة الفئة = قيمة الفئة ÷ مجموع الجدول × 100.",
    "اجمع كل الفئات أولاً لتحصل على المجموع.",
    "لا تكتب العدد نفسه كأنه نسبة مئوية دون قسمة.",
    "هذه المهارة عن النسبة المئوية من بيانات — لا عن مجرد قراءة خلية.",
  ],
  trick: {
    statement: "اجمع الكلي، ثم اقسم الفئة على الكلي واضرب في 100.",
    steps: [
      "اجمع أرقام الجدول",
      "اقسم الفئة المطلوبة على المجموع",
      "اضرب في 100 وألحق رمز النسبة",
    ],
    example: "كتب 40 من مجموع 100: 40 ÷ 100 × 100 = 40٪.",
  },
  timing: { excellent_sec: 20, good_sec: 30, ok_sec: 40, slow_sec: 54 },
}, buildDataPercent());

console.log("OK all skills generated");
