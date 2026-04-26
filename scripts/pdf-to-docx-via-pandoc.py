# -*- coding: utf-8 -*-
"""Generate a Hebrew RTL .docx by building HTML and converting with pandoc."""
import pypandoc
import os

OUT_DOCX = r"C:\Users\USER\Desktop\עוסק-פטור-או-עוסק-מורשה.docx"
HTML_TMP = r"C:\Users\USER\Desktop\קלואד קוד\פרפקט וואן - מכירות\scripts\article.html"

HTML = r"""<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<title>עוסק פטור או עוסק מורשה</title>
<style>
body { font-family: 'David', 'Arial', sans-serif; direction: rtl; }
h1, h2, h3, p, li, td, th, div { direction: rtl; text-align: right; }
.badge { background: #14B8A6; color: white; padding: 4px 12px; display: inline-block; font-weight: bold; font-size: 11px; }
.meta { color: #6B7280; font-size: 11px; margin-bottom: 16px; }
h1 { color: #1E3A5F; font-size: 28px; }
h2 { color: #1E3A5F; font-size: 20px; border-bottom: 3px solid #14B8A6; padding-bottom: 4px; margin-top: 24px; }
h3 { color: #1E3A5F; font-size: 14px; }
.callout { background: #E6F7F4; border: 2px solid #14B8A6; padding: 12px; margin: 12px 0; }
.callout-dark { background: #1E3A5F; color: white; padding: 16px; margin: 16px 0; text-align: center; }
.callout-dark h3 { color: white; }
.callout-dark .phone { color: #14B8A6; font-weight: bold; font-size: 14px; }
table { border-collapse: collapse; width: 100%; margin: 12px 0; direction: rtl; }
th { background: #1E3A5F; color: white; padding: 8px; text-align: right; border: 1px solid #1E3A5F; }
td { padding: 8px; border: 1px solid #E5E7EB; text-align: right; }
td:first-child { font-weight: bold; color: #1E3A5F; }
tr:nth-child(even) td { background: #F8FAFC; }
.teal-link { color: #14B8A6; font-weight: bold; }
.footer { text-align: center; color: #6B7280; font-size: 11px; border-top: 1px solid #D1D5DB; padding-top: 12px; margin-top: 20px; }
ol li, ul li { margin-bottom: 4px; }
</style>
</head>
<body>

<p><span class="badge">מדריך מעודכן 2026</span></p>

<h1>עוסק פטור או עוסק מורשה – מה ההבדל ואיזה סוג עסק כדאי לפתוח?</h1>

<p class="meta">מאת: צוות פרפקט וואן | עודכן: אפריל 2026 | זמן קריאה: 8 דקות</p>

<p>פתיחת עסק בישראל מחייבת החלטה חשובה כבר בתחילת הדרך: <strong>האם לפתוח עוסק פטור או עוסק מורשה?</strong></p>

<p>הבחירה בין שני סוגי העסקים משפיעה על תשלום המסים, גביית מע"מ, ניהול החשבונות והיקף הפעילות העסקית. טעות בשלב הזה יכולה לעלות אלפי שקלים בשנה — ולכן חשוב להבין את ההבדלים <strong>לפני</strong> שפותחים תיק.</p>

<p>במאמר הזה נסביר בצורה ברורה ומעשית את ההבדלים בין עוסק פטור לעוסק מורשה, למי מתאים כל סוג עסק, כמה מס משלמים בכל מסלול, ומה צריך לדעת לפני שמתחילים.</p>

<h2>מה זה עוסק פטור?</h2>

<p>עוסק פטור הוא סוג של עסק קטן שמיועד לעצמאים עם <strong>מחזור הכנסות שנתי של עד 120,000 ₪</strong> (נכון ל-2026).</p>

<p>היתרון המרכזי של עוסק פטור הוא <strong>הפשטות</strong>:</p>

<ul>
<li>העסק <strong>אינו גובה מע"מ</strong> מהלקוחות</li>
<li>אין חובת הגשת דוח מע"מ דו-חודשי</li>
<li>ניהול ספרים פשוט — ספר הכנסות בסיסי</li>
<li>הדיווח למע"מ הוא <strong>פעם בשנה בלבד</strong></li>
<li>אין צורך ברואה חשבון (אם כי מומלץ)</li>
</ul>

<p>מצד שני, עוסק פטור <strong>לא יכול לקזז מע"מ</strong> על הוצאות עסקיות, ולקוחות עסקיים לא יכולים לקזז מע"מ על התשלומים לו.</p>

<p>מי שרוצה להבין את התהליך המלא יכול לקרוא מדריך מפורט על <span class="teal-link">איך פותחים עוסק פטור — שלב אחר שלב</span> באתר פרפקט וואן.</p>

<h2>מה זה עוסק מורשה?</h2>

<p>עוסק מורשה הוא סוג עסק שבו בעל העסק <strong>גובה 18% מע"מ מהלקוחות ומעביר אותו לרשויות המס</strong>. סוג זה מתאים לעסקים עם מחזור הכנסות גבוה יותר או לעסקים שעובדים מול חברות וארגונים.</p>

<p>היתרונות המרכזיים של עוסק מורשה:</p>

<ul>
<li><strong>אין תקרת הכנסות</strong> — אפשר להרוויח ללא הגבלה</li>
<li><strong>קיזוז מע"מ</strong> על כל הוצאה עסקית (ציוד, שכירות, דלק, תוכנות)</li>
<li>לקוחות עסקיים <strong>מעדיפים לעבוד עם מורשה</strong> כי הם יכולים לקזז את המע"מ</li>
<li>מנפיק <strong>חשבונית מס</strong> (לא חשבונית עסקה)</li>
<li>נתפס <strong>כמקצועי יותר</strong> בעיני לקוחות וספקים</li>
</ul>

<p>החיסרון: <strong>ניהול מורכב יותר</strong> — דוח מע"מ דו-חודשי, הנהלת חשבונות מסודרת, ולרוב צריך רואה חשבון.</p>

<p>מי שמתכנן פעילות עסקית רחבה יותר יכול לבדוק את <span class="teal-link">המדריך המלא לפתיחת עוסק מורשה</span> באתר פרפקט וואן.</p>

<h2>טבלת השוואה — עוסק פטור מול עוסק מורשה</h2>

<table>
<thead>
<tr><th>נושא</th><th>עוסק פטור</th><th>עוסק מורשה</th></tr>
</thead>
<tbody>
<tr><td>תקרת הכנסה שנתית</td><td>120,000 ₪ (2026)</td><td>ללא הגבלה</td></tr>
<tr><td>גביית מע"מ</td><td>לא גובה</td><td>גובה 18% מע"מ</td></tr>
<tr><td>קיזוז מע"מ על הוצאות</td><td>לא יכול</td><td>מקזז מע"מ תשומות</td></tr>
<tr><td>דיווח למע"מ</td><td>פעם בשנה</td><td>כל חודשיים</td></tr>
<tr><td>סוג חשבונית</td><td>חשבונית עסקה / קבלה</td><td>חשבונית מס</td></tr>
<tr><td>ניהול ספרים</td><td>ספר הכנסות בלבד</td><td>הנהלת חשבונות מלאה</td></tr>
<tr><td>צורך ברואה חשבון</td><td>מומלץ, לא חובה</td><td>מומלץ מאוד</td></tr>
<tr><td>עלות רו"ח חודשית</td><td>75–150 ₪</td><td>200–800 ₪</td></tr>
<tr><td>עבודה מול חברות</td><td>מוגבלת (לקוח לא מקזז מע"מ)</td><td>מועדפת</td></tr>
<tr><td>מתאים ל...</td><td>עסק קטן, הכנסה צדדית, התחלה</td><td>עסק צומח, פרילנס מלא, B2B</td></tr>
</tbody>
</table>

<h2>כמה מס משלמים? השוואה מספרית</h2>

<p>הנה השוואה מעשית — <strong>כמה נשאר נטו</strong> בכל מסלול:</p>

<table>
<thead>
<tr><th>הכנסה חודשית</th><th>עוסק פטור — נטו</th><th>עוסק מורשה — נטו</th><th>הערה</th></tr>
</thead>
<tbody>
<tr><td>5,000 ₪</td><td>~4,700 ₪</td><td>~4,500 ₪</td><td>פטור עדיף</td></tr>
<tr><td>8,000 ₪</td><td>~7,200 ₪</td><td>~7,000 ₪</td><td>פטור עדיף</td></tr>
<tr><td>10,000 ₪</td><td>~8,500 ₪</td><td>~8,600 ₪</td><td>כמעט שווה</td></tr>
<tr><td><strong>12,000 ₪</strong></td><td><strong>חורג מתקרה!</strong></td><td>~10,000 ₪</td><td><strong>חייב מורשה</strong></td></tr>
<tr><td>20,000 ₪</td><td>—</td><td>~14,800 ₪</td><td>רק מורשה</td></tr>
</tbody>
</table>

<div class="callout">
<p><strong>💡 נקודת מפתח:</strong> אם ההכנסות שלכם מתקרבות ל-10,000 ₪ בחודש ויש לכם הוצאות עסקיות משמעותיות (ציוד, תוכנות, נסיעות) — <strong>עוסק מורשה עשוי להיות משתלם יותר</strong> בזכות קיזוז המע"מ.</p>
</div>

<h2>למי מתאים עוסק פטור?</h2>

<p>עוסק פטור מתאים בעיקר למי שמתחיל פעילות עסקית קטנה:</p>

<ul>
<li><strong>פרילנסרים בתחילת הדרך</strong> — כותבים, מעצבים, מתרגמים</li>
<li><strong>מורים פרטיים</strong> — שיעורים פרטיים, חוגים</li>
<li><strong>נותני שירותים קטנים</strong> — הדברה, תיקונים, שליחויות</li>
<li><strong>שכירים עם הכנסה נוספת</strong> — עבודה צדדית בנוסף למשרה</li>
<li><strong>מוכרים אונליין</strong> — eBay, Etsy, מכירות קטנות ברשת</li>
</ul>

<p>מחפשים מדריך ספציפי למקצוע שלכם? יש מדריכים ייעודיים לשליחי וולט, מעצבים גרפיים, מורים פרטיים ועוד.</p>

<h2>למי מתאים עוסק מורשה?</h2>

<p>עוסק מורשה מתאים לעסקים עם פעילות רחבה יותר:</p>

<ul>
<li><strong>פרילנסרים שמרוויחים מעל 10,000 ₪/חודש</strong></li>
<li><strong>עסקים שעובדים מול חברות</strong> — הלקוחות דורשים חשבונית מס</li>
<li><strong>בעלי מקצועות חופשיים</strong> — עורכי דין, רואי חשבון, רופאים (חייבים להיות מורשים)</li>
<li><strong>יבואנים וסוחרים</strong> — חייבים מורשה לפי חוק</li>
<li><strong>עסקים עם הוצאות גבוהות</strong> — שכירות, ציוד, רכב (קיזוז מע"מ משתלם)</li>
</ul>

<h2>5 שאלות שיעזרו לכם להחליט</h2>

<ol>
<li><strong>כמה אני צפוי להרוויח בשנה?</strong> — מעל 120,000 ₪? חייב מורשה.</li>
<li><strong>הלקוחות שלי עסקים או פרטיים?</strong> — עסקים דורשים חשבונית מס = מורשה.</li>
<li><strong>יש לי הוצאות עסקיות משמעותיות?</strong> — הוצאות גבוהות + קיזוז מע"מ = מורשה עדיף.</li>
<li><strong>אני רוצה פשטות מקסימלית?</strong> — כן = פטור.</li>
<li><strong>אני מתכנן לגדול מהר?</strong> — כן = עדיף להתחיל מורשה ולחסוך מעבר.</li>
</ol>

<div class="callout">
<p><strong>⚡ טיפ חשוב:</strong> תמיד אפשר <strong>להתחיל כעוסק פטור ולעבור למורשה</strong> בהמשך. המעבר פשוט ואפשר לבצע אותו תוך ימים. <strong>אבל לעבור מעוסק מורשה חזרה לפטור — זה הרבה יותר מסובך.</strong></p>
</div>

<h2>איך לפתוח עוסק פטור או מורשה?</h2>

<h3>פתיחת עוסק פטור</h3>
<p>התהליך פשוט וניתן לביצוע אונליין תוך 1-3 ימי עסקים — כולל מסמכים נדרשים, טפסים ועלויות.</p>

<h3>פתיחת עוסק מורשה</h3>
<p>דורש רישום בשלושה גופים: מע"מ, מס הכנסה, וביטוח לאומי. התהליך לוקח 3-10 ימי עסקים וכולל 7 שלבי רישום.</p>

<div class="callout-dark">
<h3>רוצים עזרה בבחירה?</h3>
<p>צוות רואי החשבון שלנו בפרפקט וואן יעזור לכם לבחור את המסלול הנכון — בחינם וללא התחייבות.</p>
<p class="phone">לפרטים: 050-227-7087</p>
</div>

<h2>לסיכום</h2>

<p>עוסק פטור ועוסק מורשה הם שני מסלולים שונים לפתיחת עסק בישראל. <strong>אין מסלול "טוב" או "רע"</strong> — יש מסלול שמתאים לך.</p>

<p><strong>כלל אצבע:</strong></p>

<ul>
<li>הכנסה נמוכה + לקוחות פרטיים + רוצה פשטות = <strong>עוסק פטור</strong></li>
<li>הכנסה גבוהה + לקוחות עסקיים + הוצאות + צמיחה = <strong>עוסק מורשה</strong></li>
</ul>

<p>לפני שמקימים עסק חדש, כדאי להבין היטב את היתרונות והחסרונות של כל מסלול. וזכרו — <strong>תמיד אפשר לעבור ממסלול למסלול</strong>.</p>

<p>למידע נוסף ומדריכים מקיפים, בקרו באתר פרפקט וואן — perfect1.co.il.</p>

<div class="footer">
<p>מאמר זה נכתב על ידי צוות <strong>פרפקט וואן</strong> — פורטל מידע מקצועי לעצמאים ובעלי עסקים בישראל</p>
<p>www.perfect1.co.il | 050-227-7087</p>
</div>

</body>
</html>
"""


def build():
    with open(HTML_TMP, 'w', encoding='utf-8') as f:
        f.write(HTML)
    # Convert HTML -> DOCX via pandoc
    pypandoc.convert_file(
        HTML_TMP,
        'docx',
        format='html',
        outputfile=OUT_DOCX,
        extra_args=['--standalone'],
    )
    os.remove(HTML_TMP)
    print(f"saved: {OUT_DOCX}")


if __name__ == "__main__":
    build()
