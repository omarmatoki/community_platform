# أمثلة Postman - منصة تعزيز الوعي المجتمعي

هذا الملف يحتوي على أمثلة عملية لاختبار API باستخدام Postman أو أي HTTP Client.

## 1. سيناريو كامل للمستخدم العادي

### الخطوة 1: التسجيل

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "سارة أحمد",
  "email": "sara@example.com",
  "password": "123456"
}
```

احفظ الـ `token` من الرد.

### الخطوة 2: تسجيل الدخول

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "sara@example.com",
  "password": "123456"
}
```

### الخطوة 3: عرض التصنيفات

```http
GET http://localhost:5000/api/categories
```

### الخطوة 4: عرض المقالات

```http
GET http://localhost:5000/api/articles
```

### الخطوة 5: قراءة مقال (اكتساب 5 نقاط)

```http
POST http://localhost:5000/api/articles/{{article_id}}/read
Authorization: Bearer {{your_token}}
```

### الخطوة 6: عرض استبيان المقال

```http
GET http://localhost:5000/api/surveys/article/{{article_id}}
```

### الخطوة 7: إرسال إجابات الاستبيان (اكتساب 10 نقاط)

```http
POST http://localhost:5000/api/surveys/{{survey_id}}/submit
Authorization: Bearer {{your_token}}
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "question-uuid-1",
      "optionId": "option-uuid-1"
    },
    {
      "questionId": "question-uuid-2",
      "optionId": "option-uuid-2"
    }
  ]
}
```

### الخطوة 8: لعب لعبة (اكتساب 15 نقطة)

```http
POST http://localhost:5000/api/games/{{game_id}}/complete
Authorization: Bearer {{your_token}}
```

### الخطوة 9: التصويت في استطلاع (اكتساب 5 نقاط)

```http
POST http://localhost:5000/api/polls/{{poll_id}}/vote
Authorization: Bearer {{your_token}}
Content-Type: application/json

{
  "vote": "ممتازة"
}
```

### الخطوة 10: حضور جلسة حوارية (اكتساب 20 نقطة)

```http
POST http://localhost:5000/api/discussions/{{session_id}}/attend
Authorization: Bearer {{your_token}}
```

### الخطوة 11: عرض نقاطي

```http
GET http://localhost:5000/api/users/{{my_user_id}}/points
Authorization: Bearer {{your_token}}
```

### الخطوة 12: عرض لوحة الصدارة

```http
GET http://localhost:5000/api/users/leaderboard?limit=10
```

---

## 2. سيناريو كامل للأدمن

### الخطوة 1: تسجيل دخول كأدمن

أولاً، قم بتسجيل مستخدم عادي ثم غيّر role إلى admin في قاعدة البيانات.

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### الخطوة 2: إنشاء تصنيف

```http
POST http://localhost:5000/api/categories
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "name": "الصحة والوعي الصحي",
  "description": "مقالات تتعلق بالصحة والوقاية من الأمراض"
}
```

### الخطوة 3: إنشاء مقال

```http
POST http://localhost:5000/api/articles
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "title": "أهمية النظافة الشخصية",
  "content": "النظافة الشخصية من أهم العادات الصحية التي يجب أن نحرص عليها يومياً. تشمل النظافة الشخصية الاستحمام المنتظم، غسل اليدين، تنظيف الأسنان، وارتداء ملابس نظيفة.\n\nفوائد النظافة الشخصية:\n1. الوقاية من الأمراض\n2. تحسين الثقة بالنفس\n3. الحفاظ على الصحة العامة\n4. احترام الآخرين\n\nيجب على الجميع الالتزام بالنظافة الشخصية للحفاظ على صحة المجتمع.",
  "categoryId": "{{category_id}}"
}
```

### الخطوة 4: إنشاء استبيان للمقال

```http
POST http://localhost:5000/api/surveys
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "articleId": "{{article_id}}",
  "title": "اختبار فهم مقال النظافة الشخصية",
  "questions": [
    {
      "questionText": "ما هي أهم فوائد النظافة الشخصية؟",
      "options": [
        {
          "optionText": "الوقاية من الأمراض",
          "isCorrect": true
        },
        {
          "optionText": "زيادة الوزن",
          "isCorrect": false
        },
        {
          "optionText": "توفير المال",
          "isCorrect": false
        },
        {
          "optionText": "تقليل ساعات النوم",
          "isCorrect": false
        }
      ]
    },
    {
      "questionText": "كم مرة يجب غسل اليدين يومياً؟",
      "options": [
        {
          "optionText": "مرة واحدة",
          "isCorrect": false
        },
        {
          "optionText": "مرتين",
          "isCorrect": false
        },
        {
          "optionText": "عدة مرات خاصة قبل الأكل وبعد الحمام",
          "isCorrect": true
        },
        {
          "optionText": "لا حاجة لغسل اليدين",
          "isCorrect": false
        }
      ]
    },
    {
      "questionText": "هل النظافة الشخصية تحسن الثقة بالنفس؟",
      "options": [
        {
          "optionText": "نعم",
          "isCorrect": true
        },
        {
          "optionText": "لا",
          "isCorrect": false
        }
      ]
    }
  ]
}
```

### الخطوة 5: إنشاء لعبة كلمات متقاطعة

```http
POST http://localhost:5000/api/games
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "type": "crossword",
  "title": "كلمات متقاطعة: النظافة والصحة",
  "content": {
    "grid": [
      ["ن", "ظ", "ا", "ف", "ة"],
      ["", "", "", "", ""],
      ["ص", "ح", "ة", "", ""],
      ["", "", "", "", ""],
      ["و", "ق", "a", "ي", "ة"]
    ],
    "clues": {
      "across": [
        "1. أساس الصحة (5 أحرف)",
        "3. الهدف من النظافة (3 أحرف)"
      ],
      "down": [
        "1. ما نحميه بالنظافة (4 أحرف)"
      ]
    }
  },
  "educationalMessage": "النظافة من الإيمان، والحفاظ على النظافة الشخصية يحمينا من الأمراض",
  "pointsReward": 15
}
```

### الخطوة 6: إنشاء لعبة بازل

```http
POST http://localhost:5000/api/games
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "type": "puzzle",
  "title": "بازل: خطوات غسل اليدين",
  "content": {
    "pieces": [
      {
        "id": 1,
        "text": "بلل يديك بالماء",
        "order": 1
      },
      {
        "id": 2,
        "text": "ضع الصابون",
        "order": 2
      },
      {
        "id": 3,
        "text": "افرك لمدة 20 ثانية",
        "order": 3
      },
      {
        "id": 4,
        "text": "اشطف بالماء",
        "order": 4
      },
      {
        "id": 5,
        "text": "جفف يديك",
        "order": 5
      }
    ]
  },
  "educationalMessage": "غسل اليدين بشكل صحيح يقضي على 99% من الجراثيم",
  "pointsReward": 15
}
```

### الخطوة 7: إنشاء استطلاع رأي

```http
POST http://localhost:5000/api/polls
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "title": "ما رأيك في محتوى المنصة؟",
  "description": "نرغب في معرفة آرائكم لتحسين المحتوى",
  "pointsReward": 5
}
```

### الخطوة 8: إنشاء جلسة حوارية

```http
POST http://localhost:5000/api/discussions
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "title": "ورشة عمل: النظافة في المدارس",
  "description": "نناقش كيفية تعزيز النظافة الشخصية لدى الطلاب",
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "dateTime": "2024-12-30T16:00:00.000Z",
  "pointsReward": 20
}
```

### الخطوة 9: عرض جميع المستخدمين

```http
GET http://localhost:5000/api/users
Authorization: Bearer {{admin_token}}
```

### الخطوة 10: تحديث نقاط مستخدم

```http
PUT http://localhost:5000/api/users/{{user_id}}
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "points": 100
}
```

---

## 3. أمثلة على استعلامات متقدمة

### الحصول على المقالات حسب التصنيف

```http
GET http://localhost:5000/api/articles/category/{{category_id}}
```

### الحصول على الجلسات القادمة فقط

```http
GET http://localhost:5000/api/discussions?upcoming=true
```

### الحصول على نتائج استطلاع رأي

```http
GET http://localhost:5000/api/polls/{{poll_id}}/results
```

### الحصول على الحضور في جلسة (Admin فقط)

```http
GET http://localhost:5000/api/discussions/{{session_id}}/attendees
Authorization: Bearer {{admin_token}}
```

### الحصول على سجل ألعابي

```http
GET http://localhost:5000/api/games/user/history
Authorization: Bearer {{your_token}}
```

### الحصول على نتائج الاستبيان

```http
GET http://localhost:5000/api/surveys/{{survey_id}}/results
Authorization: Bearer {{your_token}}
```

### تغيير كلمة المرور

```http
PUT http://localhost:5000/api/auth/change-password
Authorization: Bearer {{your_token}}
Content-Type: application/json

{
  "currentPassword": "123456",
  "newPassword": "newpass123"
}
```

### تحديث الملف الشخصي

```http
PUT http://localhost:5000/api/auth/profile
Authorization: Bearer {{your_token}}
Content-Type: application/json

{
  "name": "سارة أحمد المحدث",
  "email": "sara.new@example.com"
}
```

---

## 4. Postman Collection Variables

قم بإنشاء Environment في Postman مع المتغيرات التالية:

```json
{
  "base_url": "http://localhost:5000",
  "user_token": "",
  "admin_token": "",
  "user_id": "",
  "category_id": "",
  "article_id": "",
  "survey_id": "",
  "game_id": "",
  "poll_id": "",
  "session_id": ""
}
```

ثم استخدم `{{base_url}}` في جميع الطلبات.

---

## 5. نصائح الاختبار

### 1. ترتيب الاختبار المقترح:

1. سجل كمستخدم عادي
2. سجل كأدمن (غيّر role في DB)
3. أنشئ التصنيفات كأدمن
4. أنشئ المقالات كأدمن
5. أنشئ الاستبيانات كأدمن
6. أنشئ الألعاب كأدمن
7. أنشئ الاستطلاعات كأدمن
8. أنشئ الجلسات كأدمن
9. اختبر جميع الأنشطة كمستخدم عادي
10. تحقق من النقاط

### 2. التحقق من منع التكرار:

- حاول قراءة نفس المقال مرتين → يجب أن يرفض
- حاول إرسال نفس الاستبيان مرتين → يجب أن يرفض
- حاول إكمال نفس اللعبة مرتين → يجب أن يرفض
- حاول التصويت في نفس الاستطلاع مرتين → يجب أن يرفض
- حاول تسجيل الحضور في نفس الجلسة مرتين → يجب أن يرفض

### 3. التحقق من الصلاحيات:

- حاول إنشاء مقال كمستخدم عادي → يجب أن يرفض (403)
- حاول الوصول لمسار محمي بدون token → يجب أن يرفض (401)
- حاول الوصول لمسار محمي بـ token منتهي → يجب أن يرفض (401)

---

## 6. سكريبت اختبار سريع (cURL)

```bash
# تسجيل مستخدم
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"123456"}'

# تسجيل دخول
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# عرض التصنيفات
curl http://localhost:5000/api/categories

# عرض لوحة الصدارة
curl http://localhost:5000/api/users/leaderboard
```

---

## 7. أخطاء شائعة وحلولها

### خطأ: "غير مصرح لك بالدخول"
- تأكد من إضافة Header: `Authorization: Bearer TOKEN`
- تأكد من أن التوكن صحيح وغير منتهي

### خطأ: "دور المستخدم user غير مصرح له"
- المسار يتطلب صلاحيات Admin
- غيّر role المستخدم في قاعدة البيانات إلى 'admin'

### خطأ: "لقد قرأت هذا المقال مسبقاً"
- هذا طبيعي، النقاط تمنح مرة واحدة فقط لكل نشاط
- جرب مقال آخر

### خطأ في الاتصال بقاعدة البيانات
- تأكد من أن MySQL يعمل
- تحقق من إعدادات .env
- تأكد من إنشاء قاعدة البيانات
