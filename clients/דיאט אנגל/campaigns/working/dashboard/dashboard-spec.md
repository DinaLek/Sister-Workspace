# ספציפיקציית דשבורד — דיאט אנגל

## מטרת הדשבורד
לתת ללקוח תמונה עצמאית, בזמן אמת, על ביצועי הקמפיינים — עם דגש על פילוח קהלים.

---

## עמוד 1: סיכום כללי

### פקדים
| פקד | סוג | מיקום |
|-----|-----|--------|
| טווח תאריכים | Date Range Control | ראש הדף, מימין |
| פילטר סוג קמפיין | Filter Control — `campaign_type` | ראש הדף, שמאל לתאריכים |

### כרטיסי KPI (Scorecards) — שורה עליונה
| כרטיס | מדד | עיצוב |
|--------|-----|--------|
| הוצאה כוללת | `Spend` | כולל השוואה לתקופה קודמת |
| סה"כ לידים/רישומים | `Results` | |
| CPL ממוצע | `Cost per Result` | |
| CTR ממוצע | `CTR` | |

### תרשים קו — ביצועים לאורך זמן
- **ציר X:** תאריך (גרנולריות: יום)
- **מדדים:** `Results` (קו כחול) + `Spend` (קו שני, אפור)
- **ממד:** ללא פירוט — סה"כ

### טבלה — סיכום לפי סוג קמפיין
| עמודות | מדד |
|--------|-----|
| סוג קמפיין | `campaign_type` (Calculated Field) |
| הוצאה | `Spend` |
| תוצאות | `Results` |
| עלות לתוצאה | `Cost per Result` |
| CTR | `CTR` |

---

## עמוד 2: קמפיין לידים — פילוח קהלים

### פילטרים קבועים בעמוד
- `campaign_type` = "קמפיין לידים" (פילטר נסתר, לא ניתן לשינוי ע"י המשתמש)
- Date Range Control

### 4 כרטיסי KPI לפי קהל (Scorecards)
ארבעה כרטיסים בשורה אחת, כל אחד עם סינון לקהל ספציפי:

| קהל | `audience_by_adset` = |
|-----|----------------------|
| נשים כללי | "נשים כללי" |
| נשים גיל המעבר | "נשים גיל המעבר" |
| נשים אחרי לידה | "נשים אחרי לידה" |
| גברים | "גברים" |

כל כרטיס מציג: **הוצאה | לידים | CPL**

### Bar Chart — CPL השוואתי בין קהלים
- **ציר X:** `audience_by_adset`
- **ציר Y:** `Cost per Result`
- **מיון:** מהנמוך לגבוה (הכי זול בשמאל)
- **צבעים:** כל קהל בצבע אחר (4 צבעים מהפלטה של Sister)

### Stacked Bar Chart — לידים לאורך זמן לפי קהל
- **ציר X:** תאריך (שבועי)
- **ציר Y:** `Results`
- **ממד צבע:** `audience_by_adset`

### טבלה מפורטת
| עמודה | שדה |
|--------|-----|
| קהל | `audience_by_adset` |
| הוצאה | `Spend` |
| חשיפות | `Impressions` |
| קליקים | `Link Clicks` |
| CTR | `CTR` |
| לידים | `Results` |
| CPL | `Cost per Result` |
| CPM | `CPM` |

- **מיון ברירת מחדל:** לפי Spend, מהגבוה לנמוך
- **הדגשת שורה:** CPL הנמוך ביותר — ירוק, הגבוה ביותר — אדום (Conditional Formatting)

---

## עמוד 3: אתגר 5 ימים

### פילטרים קבועים
- `campaign_type` = "אתגר 5 ימים" (נסתר)
- Date Range Control

### Scorecard — סיכום האתגר הנוכחי/האחרון
- הוצאה | רישומים | עלות לרישום | Reach

### טבלה — קמפיינים לפי קהל
| עמודה | שדה |
|--------|-----|
| קהל | `audience_by_campaign` |
| שם קמפיין | `Campaign Name` |
| סטטוס | `is_active` |
| הוצאה | `Spend` |
| Reach | `Reach` |
| רישומים | `Results` |
| עלות לרישום | `Cost per Result` |
| CTR | `CTR` |

- **מיון:** קמפיינים פעילים ראשונים, אחר כך לפי תאריך

### Bar Chart — השוואת אתגרים לאורך זמן
- **ציר X:** שם קמפיין
- **ציר Y:** `Cost per Result`
- **ממד צבע:** `audience_by_campaign`

---

## עמוד 4: וובינר

מבנה **זהה לעמוד 3**, רק עם פילטר `campaign_type` = "וובינר"

---

## מדדים — טבלת עזר מלאה

| שם בעברית | שדה ב-Meta Connector | סוג |
|------------|----------------------|-----|
| הוצאה | Spend | Metric |
| חשיפות | Impressions | Metric |
| Reach | Reach | Metric |
| קליקים | Link Clicks | Metric |
| CTR | CTR (Link Click-Through Rate) | Metric |
| CPM | CPM (Cost per 1,000 Impressions) | Metric |
| תוצאות (לידים/רישומים) | Results | Metric |
| עלות לתוצאה | Cost per Result | Metric |
| שם קמפיין | Campaign Name | Dimension |
| שם Ad Set | Ad Set Name | Dimension |
| סטטוס קמפיין | Campaign Status | Dimension |
| תאריך | Date | Dimension |
| **סוג קמפיין** | campaign_type | Calculated Field |
| **קהל (לידים)** | audience_by_adset | Calculated Field |
| **קהל (אתגר/וובינר)** | audience_by_campaign | Calculated Field |
| **סטטוס בעברית** | is_active | Calculated Field |

---

## הנחיות עיצוב

### צבעים לפי קהל
| קהל | צבע מוצע (HEX) |
|-----|----------------|
| נשים כללי | `#B5AFFF` (סגול בהיר) |
| נשים גיל המעבר | `#FFB5D8` (ורוד) |
| נשים אחרי לידה | `#B5E8FF` (תכלת) |
| גברים | `#B5FFD9` (ירוק בהיר) |

### צבעים לפי סוג קמפיין
| סוג | צבע |
|-----|-----|
| לידים | `#6B5CE7` (סגול Sister) |
| אתגר 5 ימים | `#FF6B9D` (ורוד Sister) |
| וובינר | `#00D9A3` (ירוק-טורקיז) |

### טיפוגרפיה
- **כותרות:** Google Sans Bold / Montserrat Bold
- **גוף:** Google Sans / Open Sans
- **שפת ממשק:** ניתן לשמור כותרות בעברית, שמות שדות באנגלית
