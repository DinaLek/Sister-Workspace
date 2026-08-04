# באגים ופתרונות — Sister Marketing Agency

שגיאות שצצו בעבודה — טכניות, תהליכיות, ניסוחיות — ואיך נפתרו.
מתעדכן על ידי סקיל `/memory-capture` בסוף שיחות.

---

## 22/06/2026
- **WebFetch נכשל על קישורי Google Docs.** קישורי Google Docs דורשים אימות ו-WebFetch מחזיר 401. פתרון: להשתמש ב-`mcp__c9cd0aa6-0410-4212-b13e-c104282095b3__read_file_content` עם ה-file ID מתוך ה-URL — החלק הארוך שנמצא בין `/d/` לבין `/edit`.
- **שינוי שם `.claude/commands/` שובר את כל הסקילים.** Claude Code מחפש ספציפית בנתיב `.claude/commands/` ואין דרך לשנות זאת בהגדרות. הפתרון: להשאיר את השם הטכני `commands` ולקרוא לו "תיקיית SKILLS" בשיחה בלבד.
