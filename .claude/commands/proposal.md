הפק הצעת מחיר מעוצבת ל-Sister Marketing Agency.

## קבל את הקלט

**אם סופקו שירותים ישירות (מצב ידני):**
- שם לקוח, תאריך (DD/MM/YY), רשימת שירותים — קיבלת הכל, עבור לשלב 2.

**אם סופק קובץ TIME OS (PDF/DOCX):**
- קרא את הקובץ וחלץ: תחום עסק, צרכים/בעיות, פלטפורמות שהוזכרו, אינדיקציות תקציביות, שם לקוח.
- סכם בנקודות ושאל אישור לפני שממשיכים.

**אם חסר מידע:** שאל את המשתמשת על שם לקוח, תאריך, ושירותים רצויים.

---

## שלב 1: אמת שירותים

קרא את `shared knowledge/Services/שירותים.pdf` — כל השירותים, הניסוחים והמחירים המדויקים נמצאים שם.
- וודא שהשירותים המבוקשים קיימים בקטלוג
- אם שם לא מדויק — הצע התאמה קרובה
- הצג ללקוחה לאישור לפני המשך

---

## שלב 2: צור קובץ JSON

שמור כ-`agents/proposals agent/proposals/proposal_[שם לקוח]_draft.json`:

```json
{
  "client_name": "שם הלקוח",
  "date": "DD/MM/YY",
  "services": [
    {
      "title": "כותרת השירות בדיוק כמו בשירותים.pdf",
      "lead": "משפט מוביל מתוך שירותים.pdf",
      "bullets": ["פריט 1", "פריט 2"],
      "price": "עלות השירות: X,XXX ₪ + מע\"מ לחודש"
    }
  ]
}
```

**חשוב:** העתק ניסוחים בדיוק מ-שירותים.pdf — אל תמציא.

---

## שלב 3: הפק PDF

```powershell
& "C:\Users\Dina lekhovitser\AppData\Local\Programs\Python\Python311\python.exe" "agents/proposals agent/generate_proposal.py" --content "agents/proposals agent/proposals/proposal_[שם לקוח]_draft.json" --output "agents/proposals agent/proposals/proposal_[שם לקוח].pdf"
```

---

## שלב 4: דווח ונקה

- דווח: נתיב ה-PDF, שירותים שנכללו, סה"כ עלות חודשית (אם ידוע)
- מחק את קובץ ה-draft: `Remove-Item "agents/proposals agent/proposals/proposal_[שם לקוח]_draft.json"`
