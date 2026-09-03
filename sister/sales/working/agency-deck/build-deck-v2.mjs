import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "file:///C:/Users/Dina%20lekhovitser/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const ROOT="C:/GIT/Sister Workspace";
const WORK=path.join(ROOT,"sister/sales/working/agency-deck");
const ASSETS=path.join(WORK,"assets");
const BRAND=path.join(ROOT,"sister/shared/Brand book");
const REF=path.join(BRAND,"brand refresh");
const OUT=path.join(ROOT,"sister/sales/outputs");
const deck=Presentation.create({slideSize:{width:1280,height:720}});
const C={orange:"#FA8B5C",salmon:"#FF6F61",pink:"#F40C64",red:"#F0394C",gray:"#474747",mid:"#7B7474",pale:"#FFF7F7",line:"#F9D9E2",white:"#FFFFFF"};
const FONT="Assistant", LATIN="Galano Grotesque Alt";

async function bytes(file){const b=await fs.readFile(file);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)}
async function image(slide,file,pos,fit="contain",radius="rounded-xl"){
  const ext=path.extname(file).toLowerCase();
  const cfg={blob:await bytes(file),contentType:ext===".png"?"image/png":"image/jpeg",position:pos,fit,geometry:radius==="square"?"rect":"roundRect",alt:path.basename(file)};
  if(radius!=="square")cfg.borderRadius=radius;
  slide.images.add(cfg);
}
function shape(slide,x,y,w,h,fill="none",line="none",radius="rounded-xl"){
  const cfg={geometry:radius==="square"?"rect":"roundRect",position:{left:x,top:y,width:w,height:h},fill,line:{style:"solid",fill:line,width:line==="none"?0:1}};
  if(radius!=="square")cfg.borderRadius=radius;
  return slide.shapes.add(cfg);
}
function text(slide,value,x,y,w,h,size,color=C.gray,bold=false,align="right",font=FONT){
  const s=slide.shapes.add({geometry:"textbox",position:{left:x,top:y,width:w,height:h},fill:"none",line:{style:"solid",fill:"none",width:0}});s.text=value;
  s.text.style={fontFamily:font,fontSize:size,color,bold,alignment:align,verticalAlignment:"middle"};return s;
}
function head(slide,title,sub,n){
  text(slide,title,560,54,650,65,39,C.gray,true);
  if(sub)text(slide,sub,560,119,650,47,19,C.mid,false);
  shape(slide,70,54,155,3,C.pink,"none","square");
  text(slide,String(n).padStart(2,"0"),72,650,42,24,12,"#A59B9B",true,"left",LATIN);
  text(slide,"SISTER MARKETING AGENCY",902,650,308,24,11,"#A59B9B",true,"right",LATIN);
}
function notes(slide,lines,sources=[]){slide.speakerNotes.textFrame.setText(lines.join("\n")+(sources.length?`\n\n[Sources]\n${sources.map(s=>`- ${s}`).join("\n")}`:""))}

// 1 — cover, directly inspired by the brand refresh cover.
{
  const s=deck.slides.add();s.background.fill=C.white;
  await image(s,path.join(ASSETS,"brand-cover-slide.png"),{left:0,top:0,width:1280,height:720},"contain","square");
  notes(s,["פתיחה קצרה והיכרות."],["User-supplied brand refresh slide image: brand-cover-slide.png"]);
}

// 2 — introduction
{
  const s=deck.slides.add();s.background.fill=C.white;head(s,"נעים להכיר, אנחנו סיסטר","סוכנות שיווק דיגיטלי שנוסדה ב־2013 על ידי קרן חיים.",2);
  await image(s,path.join(REF,"elements/S/s element2.png"),{left:72,top:170,width:430,height:470});
  text(s,"אנחנו מלוות עסקים שרוצים לעשות שיווק טוב, אבל לא תמיד רוצים או יכולים להחזיק את כל התחומים בתוך העסק.",585,220,590,110,27,C.gray,true);
  text(s,"אנחנו נכנסות לעבודה, מכירות את העסק ומחברות בין אסטרטגיה, קריאייטיב, תוכן, מדיה וטכנולוגיה. כך כל מי שעובדת על השיווק רואה את אותה התמונה.",585,350,590,145,21,C.mid,false);
  text(s,"וכשמשהו דורש תשומת לב, אנחנו אומרות. גם אם עוד לא שאלו אותנו.",585,520,590,58,20,C.pink,true);
  notes(s,["להציג את סיסטר בפשטות, בלי רשימת סופרלטיבים."],["Internal sources: brand-dna.md, voice-and-style.md","Internal asset: brand refresh/elements/S/s element2.png"]);
}

// 3 — approach
{
  const s=deck.slides.add();s.background.fill=C.white;head(s,"לפני שמתחילות, אנחנו מכירות את העסק","מה מוכרים, למי, מה כבר עובד ומה השיווק צריך לעשות עכשיו.",3);
  const rows=[
    ["מכירות את העסק","נכנסות לפרטים, שואלות שאלות ומבינות מה חשוב לקדם."],
    ["מתכננות את העבודה","מחליטות מה אומרים, איפה מפרסמים ואיזה תוכן צריך להכין."],
    ["מנהלות ומשפרות","עוקבות אחרי העבודה והתוצאות, ומשנות כשצריך."],
  ];
  for(let i=0;i<3;i++){
    const y=220+i*132;
    await image(s,path.join(REF,`elements/glass orbs/${i+1}.png`),{left:92,top:y-24,width:112,height:112});
    text(s,rows[i][0],245,y-8,310,48,25,C.gray,true);
    text(s,rows[i][1],570,y-8,610,62,19,C.mid,false);
    if(i<2)shape(s,245,y+89,935,1,C.line,"none","square");
  }
  notes(s,["זה סדר העבודה שלנו: להבין, לבנות, לנהל ולדייק."],["Internal sources: brand-dna.md, voice-and-style.md","Internal assets: brand refresh/elements/glass orbs"]);
}

// 4 — services
{
  const s=deck.slides.add();s.background.fill=C.white;
  await image(s,path.join(ASSETS,"brand-services-slide.png"),{left:0,top:0,width:1280,height:720},"contain","square");
  notes(s,["להתעכב רק על השירותים שרלוונטיים לשיחה. אתרים ודפי נחיתה מופיעים בהמשך המצגת."],["User-supplied brand refresh slide image: brand-services-slide.png"]);
}

// 5 — AI video work
{
  const s=deck.slides.add();s.background.fill=C.white;head(s,"סרטונים שיצרנו באמצעות בינה מלאכותית","דרך נוספת לבנות סיפור, להמחיש רעיון ולייצר תוכן שגם נראה אחרת.",5);
  const videos=[
    ["ai-lifestyle.jpg","לייפסטייל","סצנה ודמות שנוצרו עבור סרטון נדל״ן"],
    ["ai-merhav.jpg","נדל״ן","הדמיה קולנועית שמכניסה את הפרויקט לחיים"],
    ["ai-blend.jpg","קמפיין","יצירת אווירה ותנועה סביב סיפור המותג"],
  ];
  for(let i=0;i<3;i++){
    const x=115+i*355;shape(s,x,190,295,415,C.white,C.line);
    await image(s,path.join(ASSETS,videos[i][0]),{left:x+18,top:207,width:259,height:292},"cover");
    shape(s,x+112,310,72,72,"#FFFFFFDD",C.line,"rounded-full");
    text(s,"▶",x+125,321,46,48,27,C.pink,true,"center",LATIN);
    text(s,videos[i][1],x+22,518,251,35,21,C.gray,true,"center");
    text(s,videos[i][2],x+24,555,247,38,15,C.mid,false,"center");
  }
  notes(s,["שלוש דוגמאות לסרטוני AI. במצגת מוצגים פריימים כדי לשמור על קובץ קל; הקישורים המקוריים נמצאים במקורות."],["https://drive.google.com/file/d/1Q7FSet2xmuhuNIBJnDfNvUefgdF1nn4s/view","https://drive.google.com/file/d/1Gx7TybHgnShwq4otfsHC3GpXOaezDVDr/view","https://drive.google.com/file/d/1mfmqIDIDpaauvS1viwNZ7IrYc0ULpElT/view"]);
}

// 6 — selected campaign work
{
  const s=deck.slides.add();s.background.fill=C.white;head(s,"כמה דוגמאות מהעבודה שלנו","קריאייטיב שנבנה לפי המותג, הקהל והמטרה של כל קמפיין.",6);
  const imgs=["banner-blend.jpg","banner-tarsat.jpg","diet-angel-webinar.jpg","diet-angel-challenge.png"];
  for(let i=0;i<4;i++){
    const x=72+i*286;shape(s,x,195,250,410,C.white,C.line);
    await image(s,path.join(ASSETS,imgs[i]),{left:x+8,top:203,width:234,height:394},"cover");
  }
  notes(s,["הדוגמאות מציגות עבודה מעולמות הנדל״ן, הבריאות והלייפסטייל."],imgs.map(n=>`Asset supplied by user: ${n}`));
}

// 7 — web work, using flattering static screenshots rather than asking the viewer to scroll.
{
  const s=deck.slides.add();s.background.fill=C.white;head(s,"אתרים ודפי נחיתה שבנינו","האפיון, הקופי והעיצוב מתחברים לעמוד שקל להבין ונעים להתקדם בו.",7);
  const cases=[
    ["site-fadlon.png","אתר קבוצת פדלון","fadlon.co.il"],
    ["site-olam.png","דף הנחיתה של עולם ומלואה","lp.olamumloa.co.il"],
    ["site-career.png","עמוד הקריירה של שפונדר פדלון","sf-group.co.il/career"],
  ];
  for(let i=0;i<3;i++){
    const x=58+i*408;shape(s,x,190,380,410,C.white,C.line);
    shape(s,x+14,205,352,236,"#F4F4F4","none");
    shape(s,x+30,215,7,7,C.salmon,"none","rounded-full");shape(s,x+44,215,7,7,C.orange,"none","rounded-full");shape(s,x+58,215,7,7,C.pink,"none","rounded-full");
    await image(s,path.join(ASSETS,cases[i][0]),{left:x+14,top:229,width:352,height:212},"cover");
    text(s,cases[i][1],x+24,466,332,50,21,C.gray,true);
    text(s,cases[i][2],x+24,526,332,30,15,C.pink,true,"left",LATIN);
  }
  notes(s,["שלוש הדוגמאות מוצגות כצילומי מסך סטטיים, כך שהלקוח לא צריך לגלול בזמן הפגישה."],["https://fadlon.co.il/","https://lp.olamumloa.co.il/","https://sf-group.co.il/career/"]);
}

// 8 — close
{
  const s=deck.slides.add();s.background.fill=C.white;
  await image(s,path.join(REF,"elements/S/s element2.png"),{left:38,top:35,width:530,height:650});
  await image(s,path.join(BRAND,"logos and elements/LOGO@3000x.png"),{left:855,top:70,width:305,height:116});
  text(s,"נראה איך זה יכול לעבוד אצלכם.",600,245,560,70,39,C.gray,true);
  text(s,"ספרו לנו איפה השיווק עומד היום ומה הייתם רוצים שיקרה. משם נחשוב יחד מה חסר ומה נכון לעשות.",650,340,510,105,22,C.mid,false);
  shape(s,650,488,510,2,C.line,"none","square");
  text(s,"קרן חיים  |  054-7529756",650,512,510,34,19,C.pink,true);
  text(s,"keren@sistermarketing.co.il",650,552,510,30,17,C.gray,false,"right",LATIN);
  text(s,"sistermarketing.co.il",650,585,510,30,17,C.gray,false,"right",LATIN);
  text(s,"EVERYONE NEEDS A S!STER",650,634,510,28,17,C.pink,true,"right",LATIN);
  notes(s,["לסיים בשיחה על העסק והצרכים שלו."],["Internal source: brand-dna.md","Internal asset: brand refresh/elements/S/s element2.png"]);
}

// 9 — selected clients
{
  const s=deck.slides.add();s.background.fill=C.white;
  head(s,"מאושרות לעבוד עם...","כמה מהמותגים והארגונים שליווינו לאורך הדרך.",9);
  const logos=[
    "victorias-secret.png","keds.png","alut.png","afcon.png","hs.png","yasmin.png",
    "shponder-fadlon.png","hezibank.png","idea.png","panta-rei.png","pinatas-group.png","bath-body-works.png",
    "since-1919.png","greg.png","diet-angel.png","asset-1.png","client-logo-1.png","client-logo-2.png",
  ];
  for(let i=0;i<logos.length;i++){
    const col=i%6,row=Math.floor(i/6),x=70+col*195,y=190+row*137;
    shape(s,x,y,170,108,C.white,C.line);
    await image(s,path.join(ASSETS,"clients",logos[i]),{left:x+18,top:y+16,width:134,height:76},"contain","square");
  }
  notes(s,["מבחר לקוחות שמופיעים באתר Sister Marketing."],["https://sistermarketing.co.il/"]);
}

const renderDir=path.join(WORK,"rendered-v2");await fs.mkdir(renderDir,{recursive:true});
for(const [i,s] of deck.slides.items.entries()){
  const png=await deck.export({slide:s,format:"png",scale:1});await fs.writeFile(path.join(renderDir,`slide-${i+1}.png`),new Uint8Array(await png.arrayBuffer()));
  const layout=await s.export({format:"layout"});await fs.writeFile(path.join(renderDir,`slide-${i+1}.layout.json`),await layout.text());
}
const pptx=await PresentationFile.exportPptx(deck);await pptx.save(path.join(OUT,"Sister-Marketing-Agency-Deck-v2.pptx"));
console.log("created v2");
