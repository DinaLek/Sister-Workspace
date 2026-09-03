---
name: create-proposals
description: Create and update branded Hebrew PDF proposals for Sister Marketing clients from meeting summaries or selected services. Use for proposal drafting, pricing updates, service-scope changes, and final PDF generation.
---

# יצירת הצעות מחיר

הפק הצעות מחיר בעברית לפי תבניות Sister Marketing והמידע העסקי המעודכן בריפו.

## מקורות מחייבים

- קרא את `sister/shared/services.md` לפני ניסוח שירות או מחיר. זהו המקור העדכני והמחייב.
- השתמש ב-`tools/agents/proposals agent/generate_proposal.py` להפקת ה-PDF.
- השתמש בתבניות שב-`tools/agents/proposals agent/resources/`.
- שמור טיוטות ותוצרים מקומיים ב-`operations/sales/proposals/`.

## כללים קבועים

- בשירות ניהול סושיאל אין לכלול סטוריז בשום ניסוח, רשימת תכולה או דוגמה.
- נספח התנאים המעודכן כולל פגישה חודשית ב-Zoom, ולא פגישה פרונטלית במשרדי הלקוח.
- אין להסתמך על `sister/shared/Services/שירותים.pdf` למחירים או לתכולה כאשר הוא סותר את `sister/shared/services.md`.
- כתוב בטון ישיר, חם ומקצועי, ללא ז'רגון ריק, הבטחות מנופחות או מקף ארוך.

## תהליך עבודה

1. קבל שם לקוח, תאריך ורשימת שירותים או סיכום פגישה.
2. אמת את השירותים, התכולה והמחירים מול `sister/shared/services.md`.
3. הצג למשתמשת את השירותים והמחירים לאישור אם קיימת אי-בהירות מהותית.
4. צור JSON בפורמט שהסקריפט מצפה לו: `client_name`, `date`, `intro`, ו-`services` עם `title`, `lead`, `bullets`, `price`.
5. הפק PDF באמצעות הסקריפט ושמור אותו ב-`operations/sales/proposals/`.
6. רנדר את כל עמודי ה-PDF לתמונות ובדוק עברית, חיתוכים, חפיפות, מחירים וסדר עמודים.
7. מחק את קובץ ה-JSON הזמני לאחר אישור הפלט.

## מבנה הפלט

סדר העמודים חייב להיות:

1. שער ממותג.
2. עמוד או עמודי תוכן.
3. נספח תנאים והערות מעודכן.

