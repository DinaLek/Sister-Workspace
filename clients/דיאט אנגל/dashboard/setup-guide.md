# מדריך הקמת דשבורד Looker Studio — דיאט אנגל

**זמן הקמה משוער:** 30–45 דקות  
**קדם-תנאים:** גישת Admin לחשבון Meta Business Manager של דיאט אנגל

---

## שלב 1 — פתיחת Looker Studio ויצירת דשבורד חדש

1. כנסי ל-[lookerstudio.google.com](https://lookerstudio.google.com) (חשבון Google שלך)
2. לחצי **+ Create → Report**
3. בחרי **"Blank report"**

---

## שלב 2 — חיבור מקור הנתונים: Meta Ads

1. בחלונית "Add data to report" — חפשי **"Facebook Ads"**
2. בחרי את הקונקטור של Google (Facebook Ads by Google — חינמי, ללא Supermetrics)
3. לחצי **Authorize** → התחברי עם פרטי Meta של דיאט אנגל (או שלך אם יש לך גישה)
4. בחרי את ה-**Ad Account**: בחרי את החשבון של דיאט אנגל (בדקי ב-`campaign-mapping.json` מה ה-ID)
5. לחצי **Add** → **Add to Report**

> **טיפ:** אם את עובדת עם כמה לקוחות, ניתן להוסיף מקורות נתונים נוספים מאוחר יותר

---

## שלב 3 — יצירת Calculated Fields (שדות מחושבים)

אלה השדות שהופכים את השמות הלא-עקביים לקטגוריות ברורות.

### איך להוסיף Calculated Field
1. בתפריט העליון: **Resource → Manage added data sources**
2. לחצי על **Edit** ליד Facebook Ads
3. לחצי **Add a field** (בפינה הימנית התחתונה)

---

### שדה 1: `campaign_type` — סוג קמפיין

**שם השדה:** `campaign_type`  
**הנוסחה** — copy-paste ישיר (^ = "מתחיל ב"):

```
CASE
  WHEN REGEXP_MATCH(Campaign Name, "^תכנית") THEN "תכנית — לידים"
  WHEN REGEXP_MATCH(Campaign Name, "^אתגר") THEN "אתגר 5 ימים"
  WHEN REGEXP_MATCH(Campaign Name, "^וובינר") THEN "וובינר"
  ELSE "אחר"
END
```

פשוט ואמין — כל קמפיין מתחיל בסוג השירות.

---

### שדה 2: `audience_by_adset` — קהל לפי Ad Set (לקמפיין תכנית)

**שם השדה:** `audience_by_adset`  
**הנוסחה** — copy-paste ישיר:

```
CASE
  WHEN REGEXP_MATCH(Ad Set Name, "^גברים") THEN "גברים"
  WHEN REGEXP_MATCH(Ad Set Name, "^גיל המעבר") THEN "נשים גיל המעבר"
  WHEN REGEXP_MATCH(Ad Set Name, "^נשים אחרי לידה|^אחרי לידה") THEN "נשים אחרי לידה"
  WHEN REGEXP_MATCH(Ad Set Name, "^נשים כללי|^כללי") THEN "נשים כללי"
  ELSE "לא מזוהה"
END
```

כל Ad Set מתחיל בשם הקהל — ^ מבטיח זיהוי מדויק ללא התנגשויות.

---

### שדה 3: `audience_by_campaign` — קהל לפי קמפיין (לאתגר ווובינר)

**שם השדה:** `audience_by_campaign`  
**הנוסחה** — copy-paste ישיר:

```
CASE
  WHEN REGEXP_MATCH(Campaign Name, "גברים") THEN "גברים"
  WHEN REGEXP_MATCH(Campaign Name, "גיל המעבר|מעבר") THEN "נשים גיל המעבר"
  WHEN REGEXP_MATCH(Campaign Name, "אחרי לידה|לידה") THEN "נשים אחרי לידה"
  WHEN REGEXP_MATCH(Campaign Name, "נשים כללי|כללי|עסוקות") THEN "נשים כללי"
  ELSE "נשים כללי"
END
```

שם הקהל מופיע בשם הקמפיין עצמו — אין תלות באדסטים.

---

### שדה 4: `is_active` — האם הקמפיין פעיל

**שם השדה:** `is_active`  
**הנוסחה:**

```
CASE
  WHEN Campaign Status = "ACTIVE" THEN "פעיל"
  WHEN Campaign Status = "PAUSED" THEN "מושהה"
  ELSE "הסתיים"
END
```

---

## שלב 4 — יצירת 4 עמודים בדשבורד

בתפריט העליון: **Page → Add page** (חזרי על זה לכל עמוד)

### שמות העמודים
1. `סיכום כללי`
2. `קמפיין לידים — קהלים`
3. `אתגר 5 ימים`
4. `וובינר`

> לשינוי שם עמוד: לחצי פעמיים על שם העמוד בסרגל התחתון

---

## שלב 5 — הוספת Date Range Control לכל עמוד

זה מה שמאפשר ללקוח לבחור טווח תאריכים:

1. **Insert → Date range control**
2. גררי אותו לפינה הימנית העליונה
3. ב-Default date range: בחרי **"Last 30 days"**
4. חזרי על זה בכל 4 העמודים

---

## שלב 6 — שיתוף עם הלקוח

1. לחצי על כפתור **Share** (ראש הדף, ימין)
2. לחצי **Manage access**
3. שני אפשרויות:
   - **Link sharing:** "Anyone with the link can view" — הכי נוח, הלקוח לא צריך Google Account
   - **Specific person:** הזיני את האימייל של הלקוח — מאובטח יותר
4. לחצי **Done** והעתיקי את הלינק

---

## טיפים לשאלות נפוצות

**ה-Ad Set Name לא מופיע בשדות?**  
חיבור ה-Facebook Ads מביא Ad Set level data — בדקי שבחרת את הרמה הנכונה ב-Data Source

**הפטרן לא עובד?**  
ב-Looker Studio, REGEXP_MATCH הוא case-sensitive בחלק מהגרסאות. נסי להוסיף `LOWER()`:
```
WHEN REGEXP_MATCH(LOWER(Ad Set Name), "pattern") THEN "..."
```

**הנתונים לא מתעדכנים?**  
הדשבורד מתעדכן כל 12 שעות כברירת מחדל. ללחיצה ידנית — כפתור Refresh בפינה

---

## צ'קליסט לפני שליחה ללקוח

- [ ] כל 4 שדות מחושבים נוצרו ועובדים
- [ ] עמוד לידים — בטבלה מופיעות 4 שורות קהל נפרדות
- [ ] Date range control מופיע בכל עמוד
- [ ] שם הדשבורד עודכן: "דיאט אנגל — דשבורד קמפיינים"
- [ ] הלינק הוגדר כ-View only
- [ ] הלינק נבדק בחלון גלישה פרטית (לוודא שאינו דורש התחברות)
