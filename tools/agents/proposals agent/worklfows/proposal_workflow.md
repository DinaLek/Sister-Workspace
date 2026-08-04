# תהליך עבודה — הפקת הצעת מחיר

## תנאי מוכנות לפני הפעלה

- [ ] Python 3.11+ מותקן (`python --version`)
- [ ] תלויות מותקנות (`pip install -r requirements.txt`)
- [ ] קובץ TIME OS זמין (מצב א') **או** רשימת שירותים מהמשתמשת (מצב ב')

---

## מצב א' — עם קובץ TIME OS

### 1. קרא את קובץ ה-TIME OS
- PDF → כלי Read
- DOCX → קרא עם python-docx (הרץ `python -c "from docx import Document; print(Document('path').paragraphs[0].text)"`)

### 2. חלץ מהסיכום
- מה הלקוח עושה / תחום העסק
- אילו בעיות / צרכים הוזכרו
- פלטפורמות שהוזכרו (אינסטגרם, פייסבוק, גוגל, אתר...)
- סיגנלים תקציביים (אם קיימים)
- שם הלקוח אם הוזכר

### 3. המשך משלב 2 של מצב ב' →

---

## מצב ב' — ידני (ללא TIME OS)

### 1. קבל מהמשתמשת
- שם הלקוח
- תאריך (פורמט: DD/MM/YY)
- רשימת שירותים רצויים

### 2. אמת מול services.md
- קרא `sister/shared/services.md`
- וודא שכל שירות שהוזכר קיים בקטלוג
- אם שם לא מדויק — הצע את ההתאמה הקרובה ביותר
- **הצג ללקוחה לאישור לפני המשך**

---

## שלבים משותפים (אחרי קריאת הקלט)

### 3. בחר שירותים
- בחר 2–5 שירותים רלוונטיים
- סדר לפי רלוונטיות (הכי חשוב ראשון)
- שירות עם "⚠️ יש להשלים": שים בשדה `price`: `"מחיר בהתאם להיקף — יועבר בנפרד"`

### 4. צור קובץ JSON

שמור כ: `operations/sales/proposals/proposal_[שם לקוח]_draft.json`

```json
{
  "client_name": "שם הלקוח",
  "date": "DD/MM/YY",
  "intro": "Sister Marketing היא סוכנות דיגיטל שחושבת אסטרטגיה, נושמת קריאייטיב וחיה תוצאות.\nאנחנו משלבות שיווק מדויק עם טכנולוגיות AI מתקדמות, כדי ליצור מהלכים חכמים שמחוברים לעסק, לקהל ולמטרות שלו.\nניהול סושיאל, קידום ממומן, תוכן, מיתוג ואוטומציה. הכול נבנה סביבכם, עם הבנה עמוקה של מה שצריך לקרות, ואיך לגרום לזה לקרות כמו שצריך.",
  "services": [
    {
      "title": "...",
      "lead": "...",
      "bullets": ["...", "..."],
      "price": "עלות השירות: X,XXX ₪ + מע\"מ לחודש"
    }
  ]
}
```

### 5. הפק את ה-PDF

```powershell
python "tools/agents/proposals agent/generate_proposal.py" `
  --content "operations/sales/proposals/proposal_[שם לקוח]_draft.json" `
  --output "operations/sales/proposals/proposal_[שם לקוח].pdf"
```

### 6. אשר ודווח

- [ ] ה-PDF נוצר בנתיב הצפוי
- [ ] דווח על הנתיב + תקציר שירותים + סכום כולל (אם ידוע)
- [ ] העלה את ה-PDF הסופי ל-Drive ומחק את עותק ה-PDF המקומי לאחר אימות

---

## פתרון בעיות נפוצות

| תסמין | פתרון |
|-------|-------|
| `ModuleNotFoundError` | `pip install -r requirements.txt` |
| `Font not found` | ודא ש-`sister/shared/Brand book/hebrew font/static/` קיים |
| `Template PDF not found` | ודא שקבצי ה-PDF ב-`resources/` קיימים |
| עברית מוצגת הפוך | ספריות `python-bidi` ו-`arabic-reshaper` חייבות להיות מותקנות |
| PDF ריק / לבן | בדוק שה-JSON תקין (`json.loads` יזרוק שגיאה אם לא) |
