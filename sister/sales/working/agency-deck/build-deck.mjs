import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "file:///C:/Users/Dina%20lekhovitser/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const ROOT = "C:/GIT/Sister Workspace";
const WORK = path.join(ROOT, "sister/sales/working/agency-deck");
const ASSETS = path.join(WORK, "assets");
const BRAND = path.join(ROOT, "sister/shared/Brand book");
const OUT = path.join(ROOT, "sister/sales/outputs");
const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

const C = { orange: "#F68B59", coral: "#F36453", red: "#F0394C", gray: "#695D5D", dark: "#302929", light: "#FFF8F5", white: "#FFFFFF", pale: "#F4ECE9" };
const FONT = "Assistant";

async function bytes(file) {
  const b = await fs.readFile(file);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}
async function addImage(slide, file, position, fit = "cover", radius = "rounded-xl") {
  const ext = path.extname(file).toLowerCase();
  slide.images.add({ blob: await bytes(file), contentType: ext === ".png" ? "image/png" : "image/jpeg", position, fit, geometry: "roundRect", borderRadius: radius, alt: path.basename(file) });
}
function box(slide, x, y, w, h, fill, radius = "rounded-xl", line = "none") {
  const config = { geometry: radius === "square" ? "rect" : "roundRect", position: { left:x, top:y, width:w, height:h }, fill, line: { style:"solid", fill:line, width: line === "none" ? 0 : 1 } };
  if (radius !== "square") config.borderRadius = radius;
  return slide.shapes.add(config);
}
function text(slide, value, x, y, w, h, size, color=C.dark, bold=false, align="right") {
  const s = slide.shapes.add({ geometry:"textbox", position:{left:x,top:y,width:w,height:h}, fill:"none", line:{style:"solid",fill:"none",width:0} });
  s.text = value;
  s.text.style = { fontFamily:FONT, fontSize:size, color, bold, alignment:align, verticalAlignment:"middle", rtl:true };
  return s;
}
function chrome(slide, n, dark=false) {
  text(slide, String(n).padStart(2,"0"), 48, 660, 45, 24, 13, dark?"#FFFFFFAA":"#695D5DAA", true, "left");
  text(slide, "SISTER MARKETING AGENCY", 940, 660, 292, 24, 12, dark?"#FFFFFFAA":"#695D5DAA", true, "right");
}
function title(slide, value, sub, dark=false) {
  text(slide, value, 660, 55, 570, 70, 39, dark?C.white:C.dark, true);
  if (sub) text(slide, sub, 660, 124, 570, 42, 19, dark?"#FFFFFFCC":C.gray, false);
}
function notes(slide, lines, sources=[]) {
  const sourceBlock = sources.length ? `\n\n[Sources]\n${sources.map(s=>`- ${s}`).join("\n")}` : "";
  slide.speakerNotes.textFrame.setText(lines.join("\n") + sourceBlock);
}

// 1 — Cover
{
  const s=deck.slides.add(); s.background.fill=C.dark;
  box(s,0,0,470,720,C.red,"square"); box(s,370,-120,360,880,C.orange,"rounded-full");
  await addImage(s,path.join(BRAND,"logos and elements/LOGO LIGHT@3000x.png"),{left:770,top:88,width:390,height:155},"contain");
  text(s,"השיווק שלכם.\nעם מישהי שבאמת אכפת לה.",600,270,560,160,44,C.white,true);
  text(s,"סושיאל  |  קמפיינים  |  תוכן  |  דיגיטל",650,475,510,38,20,"#FFFFFFD9",false);
  text(s,"EVERYONE NEEDS A S!STER",650,570,510,38,22,C.white,true);
  notes(s,["פתיחה קצרה: המצגת היא טעימה מהדרך שבה אנחנו חושבות ועובדות."],["Internal brand assets: sister/shared/Brand book"]);
}

// 2 — About
{
  const s=deck.slides.add(); s.background.fill=C.light; chrome(s,2); title(s,"מאז 2013 אנחנו בתוך העסק","לא מבחוץ, לא ליד. בתוך השאלות, ההחלטות והיום־יום.");
  box(s,64,202,505,374,C.white); text(s,"אנחנו צוות של נשות מקצוע שמחברות אסטרטגיה, קריאייטיב, מדיה וטכנולוגיה למהלך שיווקי אחד.",105,238,420,132,28,C.dark,true);
  text(s,"המטרה שלנו פשוטה: לזהות מה העסק באמת צריך, לבנות את הדרך הנכונה ולהרים דגל לפני שמשהו מתפספס.",105,392,420,116,21,C.gray,false);
  box(s,640,220,540,92,C.red); text(s,"אחריות אישית",678,233,460,62,28,C.white,true);
  box(s,640,333,540,92,C.orange); text(s,"שותפות אמיתית",678,346,460,62,28,C.white,true);
  box(s,640,446,540,92,C.gray); text(s,"שיווק שמרגיש אנושי",678,459,460,62,28,C.white,true);
  notes(s,["להדגיש: אנחנו לא רק ספקיות ביצוע; אנחנו מחזיקות את התמונה המלאה."],["Internal source: sister/shared/brand-dna.md"]);
}

// 3 — Difference
{
  const s=deck.slides.add(); s.background.fill=C.white; chrome(s,3); title(s,"אותה מטרה. דרך אחרת לכל עסק","כי One Size Fits All לא עובד בשיווק.");
  const items=[
    ["01","מכירות לפני רעש","מתחילות במה שהעסק צריך להשיג, ורק אז בוחרות ערוצים ותוכן."],
    ["02","קריאייטיב עם הקשר","כל פוסט, מודעה ודף נחיתה הם חלק מאותו סיפור."],
    ["03","אנשים + AI","ידיים של אדם, קצב ועוצמה של טכנולוגיה."],
  ];
  items.forEach((it,i)=>{const y=210+i*135; text(s,it[0],85,y,90,70,38,i===1?C.orange:C.red,true,"left"); text(s,it[1],205,y-2,320,42,25,C.dark,true); text(s,it[2],205,y+42,840,55,19,C.gray,false);});
  notes(s,["המסר: התאמה אישית אינה סיסמה; היא סדר עבודה."],["Internal source: sister/shared/brand-dna.md"]);
}

// 4 — Services
{
  const s=deck.slides.add(); s.background.fill=C.dark; chrome(s,4,true); title(s,"מעטפת אחת. פחות קצוות פתוחים.","אנחנו מחברות בין התוכן, המדיה והנכסים הדיגיטליים.",true);
  const services=[
    ["ניהול סושיאל","אסטרטגיה, תוכן, עיצוב, רילס ופרסום"],
    ["ניהול קמפיינים","Meta, Google, קופי, אופטימיזציה ומעקב"],
    ["ימי צילום","תכנון, תסריטים והפקת תוכן שוטף"],
    ["תוכן באמצעות AI","וידאו ותוצרים שמרחיבים את האפשרויות"],
    ["דפי נחיתה ואתרים","אפיון, קופי, עיצוב ופיתוח"],
  ];
  services.forEach((it,i)=>{const y=206+i*82; box(s,90,y,1090,64,i===0?C.red:(i===1?C.orange:"#453C3C")); text(s,it[0],820,y+5,315,52,23,C.white,true); text(s,it[1],140,y+5,620,52,18,"#FFFFFFD6",false,"right");});
  notes(s,["לא להקריא כרשימה. לבחור את השירותים שרלוונטיים לליד ולחבר ביניהם."],["Internal source: sister/shared/services.md"]);
}

// 5 — Core operating model
{
  const s=deck.slides.add(); s.background.fill=C.light; chrome(s,5); title(s,"סושיאל וקמפיינים עובדים טוב יותר יחד","התוכן בונה אמון. המדיה מביאה אותו לקהל הנכון.");
  box(s,74,215,530,335,C.white); text(s,"סושיאל",110,242,450,52,31,C.red,true); text(s,"אסטרטגיית תוכן חודשית\nכתיבה, עיצוב ורילס\nפרסום וניהול שוטף\nיום צילום לפי הצורך",110,310,450,190,22,C.gray,false);
  box(s,676,215,530,335,C.white); text(s,"קמפיינים",712,242,450,52,31,C.orange,true); text(s,"אסטרטגיה והקמה\nקופי וקריאייטיב\nאופטימיזציה שוטפת\nמעקב ודיווח",712,310,450,190,22,C.gray,false);
  box(s,584,335,112,112,C.dark,"rounded-full"); text(s,"+",606,348,68,80,46,C.white,true,"center");
  notes(s,["כאן לשאול: מה עובד היום, מה חסר, ואיפה הליד מרגיש שהשיווק נתקע."],["Internal source: sister/shared/services.md"]);
}

// 6 — Campaign work
{
  const s=deck.slides.add(); s.background.fill=C.white; chrome(s,6); title(s,"קריאייטיב שמכבד את המותג וגם מוכר","טעימה מעבודות קמפיין. הדוגמאות כאן מעולמות הנדל״ן.");
  const imgs=["banner-blend.jpg","banner-tarsat.jpg","banner-heart.jpg","banner-sharon.jpg"];
  for(let i=0;i<4;i++) await addImage(s,path.join(ASSETS,imgs[i]),{left:74+i*287,top:205,width:250,height:390},"cover");
  notes(s,["להדגיש את הגיוון בין פרויקטים ואת היכולת להתאים שפה לכל מותג."],imgs.map(n=>`Google Drive asset supplied by user: ${n}`));
}

// 7 — Digital portfolio
{
  const s=deck.slides.add(); s.background.fill=C.light; chrome(s,7); title(s,"מתוכן ועד נכס דיגיטלי שעובד","אתרים, דפי נחיתה, מיתוג מעסיק וניהול נוכחות שוטפת.");
  const cases=[
    ["site-fadlon.png","אתר תדמית ופרויקטים","fadlon.co.il"],
    ["site-olam.png","דף נחיתה ממוקד הרשמה","lp.olamumloa.co.il"],
    ["instagram.png","ניהול נוכחות ותוכן","@shponder_fadlon"],
  ];
  for(let i=0;i<3;i++){
    const x=68+i*402; box(s,x,200,360,398,C.white); await addImage(s,path.join(ASSETS,cases[i][0]),{left:x+16,top:216,width:328,height:218},"cover"); text(s,cases[i][1],x+26,455,308,48,22,C.dark,true); text(s,cases[i][2],x+26,510,308,34,16,C.red,true,"left");
  }
  notes(s,["אפשר לפתוח את הקישורים לאחר הפגישה. במצגת עצמה נשארים ברמת הסיפור והיכולת."],["https://fadlon.co.il/","https://lp.olamumloa.co.il/","https://www.instagram.com/shponder_fadlon/"]);
}

// 8 — Close
{
  const s=deck.slides.add(); s.background.fill=C.red;
  await addImage(s,path.join(BRAND,"logos and elements/LOGO LIGHT@3000x.png"),{left:790,top:72,width:360,height:140},"contain");
  text(s,"בואו נבין מה השיווק שלכם צריך עכשיו.",480,250,670,100,43,C.white,true);
  text(s,"לא חבילה מהמדף. שיחה טובה, תמונה ברורה ותוכנית שמתאימה לעסק.",540,365,610,82,23,"#FFFFFFE0",false);
  box(s,620,505,530,1,C.white,"square");
  text(s,"קרן חיים  |  054-7529756",650,535,500,34,20,C.white,true);
  text(s,"keren@sistermarketing.co.il  |  sistermarketing.co.il",570,575,580,34,18,C.white,false);
  text(s,"EVERYONE NEEDS A S!STER",650,635,500,30,19,C.white,true);
  notes(s,["סיום: להזמין את הלקוח לדבר על המצב שלו, לא על רשימת השירותים."],["Internal source: sister/shared/brand-dna.md"]);
}

await fs.mkdir(path.join(WORK,"rendered"),{recursive:true});
for (const [i,s] of deck.slides.items.entries()) {
  const png=await deck.export({slide:s,format:"png",scale:1});
  await fs.writeFile(path.join(WORK,"rendered",`slide-${i+1}.png`),new Uint8Array(await png.arrayBuffer()));
  const layout=await s.export({format:"layout"});
  await fs.writeFile(path.join(WORK,"rendered",`slide-${i+1}.layout.json`),await layout.text());
}
const montage=await deck.export({format:"webp",montage:true,scale:1});
await fs.writeFile(path.join(WORK,"rendered","montage.webp"),new Uint8Array(await montage.arrayBuffer()));
const pptx=await PresentationFile.exportPptx(deck);
await pptx.save(path.join(OUT,"Sister-Marketing-Agency-Deck.pptx"));
console.log("created",path.join(OUT,"Sister-Marketing-Agency-Deck.pptx"));
