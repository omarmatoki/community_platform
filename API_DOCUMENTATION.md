# توثيق API - منصة تعزيز الوعي المجتمعي

## جدول المحتويات

1. [المصادقة](#المصادقة)
2. [المستخدمون](#المستخدمون)
3. [التصنيفات](#التصنيفات)
4. [المقالات](#المقالات)
5. [الاستبيانات](#الاستبيانات)
6. [الألعاب](#الألعاب)
7. [استطلاعات الرأي](#استطلاعات-الرأي)
8. [الجلسات الحوارية](#الجلسات-الحوارية)
9. [نظام النقاط](#نظام-النقاط)

---

## المصادقة

### تسجيل مستخدم جديد

**Endpoint:** `POST /api/auth/register`
**الصلاحية:** Public

**Request Body:**
```json
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "123456"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم التسجيل بنجاح",
  "data": {
    "user": {
      "id": "uuid",
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "points": 0,
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

### تسجيل الدخول

**Endpoint:** `POST /api/auth/login`
**الصلاحية:** Public

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "user": {
      "id": "uuid",
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "points": 50,
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

---

## المستخدمون

### الحصول على لوحة الصدارة

**Endpoint:** `GET /api/users/leaderboard?limit=10`
**الصلاحية:** Public

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "rank": 1,
      "id": "uuid",
      "name": "محمد علي",
      "email": "mohamed@example.com",
      "points": 150,
      "memberSince": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### الحصول على نقاط المستخدم

**Endpoint:** `GET /api/users/:id/points`
**الصلاحية:** Private
**Headers:** `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "أحمد محمد",
    "points": 75,
    "rank": 5
  }
}
```

---

## التصنيفات

### إنشاء تصنيف

**Endpoint:** `POST /api/categories`
**الصلاحية:** Admin
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "name": "الصحة",
  "description": "مقالات عن الصحة والوعي الصحي"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إنشاء التصنيف بنجاح",
  "data": {
    "id": "uuid",
    "name": "الصحة",
    "description": "مقالات عن الصحة والوعي الصحي",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### الحصول على جميع التصنيفات

**Endpoint:** `GET /api/categories`
**الصلاحية:** Public

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "uuid",
      "name": "الصحة",
      "description": "مقالات عن الصحة",
      "articles": [
        {
          "id": "uuid",
          "title": "أهمية الرياضة"
        }
      ]
    }
  ]
}
```

---

## المقالات

### إنشاء مقال

**Endpoint:** `POST /api/articles`
**الصلاحية:** Admin
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "title": "أهمية الوعي المجتمعي",
  "content": "محتوى المقال الكامل...",
  "categoryId": "category-uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إنشاء المقال بنجاح",
  "data": {
    "id": "uuid",
    "title": "أهمية الوعي المجتمعي",
    "content": "محتوى المقال...",
    "categoryId": "category-uuid",
    "adminId": "admin-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### تسجيل قراءة مقال

**Endpoint:** `POST /api/articles/:id/read`
**الصلاحية:** Private
**Headers:** `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "success": true,
  "message": "تم تسجيل القراءة وحصلت على 5 نقاط",
  "data": {
    "pointsEarned": 5
  }
}
```

---

## الاستبيانات

### إنشاء استبيان

**Endpoint:** `POST /api/surveys`
**الصلاحية:** Admin
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "articleId": "article-uuid",
  "title": "اختبار فهم المقال",
  "questions": [
    {
      "questionText": "ما هو الموضوع الرئيسي للمقال؟",
      "options": [
        {
          "optionText": "الوعي المجتمعي",
          "isCorrect": true
        },
        {
          "optionText": "التكنولوجيا",
          "isCorrect": false
        },
        {
          "optionText": "الرياضة",
          "isCorrect": false
        }
      ]
    },
    {
      "questionText": "ما هي فائدة الوعي المجتمعي؟",
      "options": [
        {
          "optionText": "تحسين المجتمع",
          "isCorrect": true
        },
        {
          "optionText": "لا فائدة",
          "isCorrect": false
        }
      ]
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إنشاء الاستبيان بنجاح",
  "data": {
    "id": "uuid",
    "articleId": "article-uuid",
    "title": "اختبار فهم المقال",
    "questions": [...]
  }
}
```

### إرسال إجابات الاستبيان

**Endpoint:** `POST /api/surveys/:surveyId/submit`
**الصلاحية:** Private
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
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

**Response (200):**
```json
{
  "success": true,
  "message": "أحسنت! لقد نجحت في الاستبيان",
  "data": {
    "points": 10,
    "percentage": 80,
    "passed": true,
    "correctAnswers": 4,
    "totalQuestions": 5
  }
}
```

---

## الألعاب

### إنشاء لعبة

**Endpoint:** `POST /api/games`
**الصلاحية:** Admin
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "type": "crossword",
  "title": "كلمات متقاطعة: الوعي البيئي",
  "content": {
    "grid": [[...]],
    "clues": {
      "across": [...],
      "down": [...]
    }
  },
  "educationalMessage": "الحفاظ على البيئة مسؤولية الجميع",
  "pointsReward": 15
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إنشاء اللعبة بنجاح",
  "data": {
    "id": "uuid",
    "type": "crossword",
    "title": "كلمات متقاطعة: الوعي البيئي",
    "content": {...},
    "educationalMessage": "...",
    "pointsReward": 15
  }
}
```

### إكمال لعبة

**Endpoint:** `POST /api/games/:id/complete`
**الصلاحية:** Private
**Headers:** `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "success": true,
  "message": "أحسنت! لقد أكملت اللعبة وحصلت على 15 نقطة",
  "data": {
    "pointsEarned": 15,
    "educationalMessage": "الحفاظ على البيئة مسؤولية الجميع"
  }
}
```

---

## استطلاعات الرأي

### إنشاء استطلاع رأي

**Endpoint:** `POST /api/polls`
**الصلاحية:** Admin
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "title": "ما رأيك في المنصة؟",
  "description": "نود معرفة رأيك",
  "pointsReward": 5
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إنشاء الاستطلاع بنجاح",
  "data": {
    "id": "uuid",
    "title": "ما رأيك في المنصة؟",
    "description": "نود معرفة رأيك",
    "pointsReward": 5,
    "adminId": "admin-uuid"
  }
}
```

### التصويت في استطلاع

**Endpoint:** `POST /api/polls/:id/vote`
**الصلاحية:** Private
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "vote": "ممتازة"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "شكراً على المشاركة! حصلت على 5 نقطة",
  "data": {
    "pointsEarned": 5
  }
}
```

### الحصول على نتائج الاستطلاع

**Endpoint:** `GET /api/polls/:id/results`
**الصلاحية:** Public

**Response (200):**
```json
{
  "success": true,
  "data": {
    "poll": {...},
    "totalVotes": 150,
    "results": {
      "ممتازة": 100,
      "جيدة": 40,
      "تحتاج تحسين": 10
    },
    "votes": [...]
  }
}
```

---

## الجلسات الحوارية

### إنشاء جلسة حوارية

**Endpoint:** `POST /api/discussions`
**الصلاحية:** Admin
**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "title": "جلسة نقاشية: الوعي الصحي",
  "description": "نناقش أهمية الوعي الصحي في المجتمع",
  "meetLink": "https://meet.google.com/xxx-xxxx-xxx",
  "dateTime": "2024-12-25T18:00:00.000Z",
  "pointsReward": 20
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إنشاء الجلسة الحوارية بنجاح",
  "data": {
    "id": "uuid",
    "title": "جلسة نقاشية: الوعي الصحي",
    "description": "...",
    "meetLink": "https://meet.google.com/xxx-xxxx-xxx",
    "dateTime": "2024-12-25T18:00:00.000Z",
    "pointsReward": 20,
    "adminId": "admin-uuid"
  }
}
```

### تسجيل حضور جلسة

**Endpoint:** `POST /api/discussions/:id/attend`
**الصلاحية:** Private
**Headers:** `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "success": true,
  "message": "تم تسجيل حضورك بنجاح وحصلت على 20 نقطة",
  "data": {
    "pointsEarned": 20
  }
}
```

### الحصول على الجلسات القادمة

**Endpoint:** `GET /api/discussions?upcoming=true`
**الصلاحية:** Public

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "uuid",
      "title": "جلسة نقاشية: الوعي الصحي",
      "dateTime": "2024-12-25T18:00:00.000Z",
      "meetLink": "https://meet.google.com/xxx-xxxx-xxx",
      "admin": {
        "id": "uuid",
        "name": "أحمد"
      },
      "attendances": [...]
    }
  ]
}
```

---

## نظام النقاط

### ملخص النقاط

| النشاط | النقاط | الشرط |
|--------|--------|-------|
| قراءة مقال | 5 | مرة واحدة لكل مقال |
| إكمال استبيان | 10 | النجاح بنسبة 70%+ |
| إكمال لعبة | 15 | مرة واحدة لكل لعبة |
| التصويت في استطلاع | 5 | مرة واحدة لكل استطلاع |
| حضور جلسة حوارية | 20 | مرة واحدة لكل جلسة |

### رموز الحالة (Status Codes)

| Code | الوصف |
|------|-------|
| 200 | نجاح |
| 201 | تم الإنشاء بنجاح |
| 400 | خطأ في البيانات المدخلة |
| 401 | غير مصرح |
| 403 | ممنوع |
| 404 | غير موجود |
| 500 | خطأ في السيرفر |

### رؤوس المصادقة (Headers)

جميع المسارات المحمية تحتاج إلى:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### أمثلة على الأخطاء

**خطأ المصادقة (401):**
```json
{
  "success": false,
  "message": "غير مصرح لك بالدخول، يرجى تسجيل الدخول"
}
```

**خطأ الصلاحيات (403):**
```json
{
  "success": false,
  "message": "دور المستخدم user غير مصرح له بالوصول إلى هذا المسار"
}
```

**خطأ في البيانات (400):**
```json
{
  "success": false,
  "message": "جميع الحقول مطلوبة"
}
```
