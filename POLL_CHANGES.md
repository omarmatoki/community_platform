# تحديثات نظام استطلاع الرأي

## التغييرات

تم تحديث نظام استطلاع الرأي ليصبح مشابهاً لاستطلاعات WhatsApp و Telegram:

### 1. نموذج البيانات الجديد

#### جدول `poll_options` (جديد)
- `id`: معرف الخيار (UUID)
- `pollId`: معرف الاستطلاع
- `text`: نص الخيار
- `order`: ترتيب الخيار
- `createdAt`, `updatedAt`: تواريخ الإنشاء والتحديث

#### تحديث جدول `poll_votes`
- تم استبدال `vote` (String) بـ `optionId` (UUID)
- الآن يشير التصويت إلى خيار محدد من الخيارات المتاحة

### 2. API Endpoints

#### إنشاء استطلاع جديد
```
POST /api/polls
```

**Body:**
```json
{
  "title": "ما هو رأيك في الخدمة؟",
  "description": "نود معرفة رأيك",
  "pointsReward": 5,
  "options": [
    "ممتاز",
    "جيد",
    "مقبول",
    "سيء"
  ]
}
```

**ملاحظة:** يجب إضافة خيارين على الأقل

#### الحصول على جميع الاستطلاعات
```
GET /api/polls
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "uuid",
      "title": "ما هو رأيك في الخدمة؟",
      "description": "نود معرفة رأيك",
      "pointsReward": 5,
      "admin": {
        "id": "uuid",
        "name": "اسم المسؤول"
      },
      "options": [
        {
          "id": "uuid",
          "text": "ممتاز",
          "order": 0,
          "votesCount": 10
        },
        {
          "id": "uuid",
          "text": "جيد",
          "order": 1,
          "votesCount": 5
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### الحصول على استطلاع معين
```
GET /api/polls/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "ما هو رأيك في الخدمة؟",
    "options": [
      {
        "id": "uuid",
        "text": "ممتاز",
        "order": 0,
        "votesCount": 10,
        "percentage": "66.7"
      },
      {
        "id": "uuid",
        "text": "جيد",
        "order": 1,
        "votesCount": 5,
        "percentage": "33.3"
      }
    ],
    "totalVotes": 15
  }
}
```

#### التصويت في استطلاع
```
POST /api/polls/:id/vote
```

**Body:**
```json
{
  "optionId": "uuid-of-selected-option"
}
```

**Response:**
```json
{
  "success": true,
  "message": "شكراً على المشاركة! حصلت على 5 نقطة",
  "data": {
    "pointsEarned": 5
  }
}
```

#### الحصول على نتائج الاستطلاع
```
GET /api/polls/:id/results
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "ما هو رأيك في الخدمة؟",
    "options": [
      {
        "id": "uuid",
        "text": "ممتاز",
        "order": 0,
        "votesCount": 10,
        "percentage": "66.7",
        "voters": [
          {
            "userId": "uuid",
            "userName": "محمد",
            "votedAt": "2024-01-01T00:00:00.000Z"
          }
        ]
      }
    ],
    "totalVotes": 15
  }
}
```

#### تحديث استطلاع
```
PUT /api/polls/:id
```

**Body:**
```json
{
  "title": "عنوان محدث",
  "description": "وصف محدث",
  "pointsReward": 10,
  "options": [
    "خيار 1",
    "خيار 2"
  ]
}
```

**ملاحظة:** لا يمكن تعديل الخيارات إذا كان هناك أصوات بالفعل

#### حذف استطلاع
```
DELETE /api/polls/:id
```

### 3. كيفية الاستخدام

1. قم بتشغيل السيرفر:
```bash
npm run dev
```

2. سيتم إنشاء جدول `poll_options` تلقائياً
3. سيتم تحديث جدول `poll_votes` تلقائياً

### 4. ملاحظات مهمة

- يجب أن يحتوي كل استطلاع على خيارين على الأقل
- لا يمكن للمستخدم التصويت أكثر من مرة في نفس الاستطلاع
- لا يمكن تعديل خيارات الاستطلاع بعد بدء التصويت
- يتم حساب النسب المئوية للتصويت تلقائياً
- يتم ترتيب الخيارات حسب حقل `order`

### 5. مثال تطبيق عملي

**إنشاء استطلاع:**
```bash
curl -X POST http://localhost:5000/api/polls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "ما هي لغة البرمجة المفضلة لديك؟",
    "options": ["JavaScript", "Python", "Java", "C#"]
  }'
```

**التصويت:**
```bash
curl -X POST http://localhost:5000/api/polls/POLL_ID/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "optionId": "OPTION_ID"
  }'
```

**عرض النتائج:**
```bash
curl http://localhost:5000/api/polls/POLL_ID/results
```

## الملفات المعدلة

1. `models/PollOption.js` - نموذج جديد
2. `models/PollVote.js` - تم تعديله
3. `models/index.js` - تم إضافة العلاقات الجديدة
4. `controllers/pollController.js` - تم تعديل جميع الدوال
5. `routes/pollRoutes.js` - لم يتم تعديله (نفس المسارات)
