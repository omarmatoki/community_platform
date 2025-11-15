# Backend - منصة تعزيز الوعي المجتمعي

Backend كامل لموقع تفاعلي لتعزيز الوعي المجتمعي مبني باستخدام Node.js و Express و Sequelize ORM.

## المميزات

- ✅ نظام مصادقة كامل (JWT)
- ✅ إدارة المقالات مع التصنيفات
- ✅ استبيانات تفاعلية مع نظام تقييم
- ✅ ألعاب تعليمية (كلمات متقاطعة وبازل)
- ✅ استطلاعات رأي
- ✅ جلسات حوارية مع روابط Google Meet
- ✅ نظام نقاط متكامل لمكافأة المستخدمين
- ✅ لوحة صدارة
- ✅ صلاحيات متعددة (User & Admin)

## التقنيات المستخدمة

- **Node.js** - بيئة تشغيل JavaScript
- **Express.js** - إطار عمل الويب
- **Sequelize ORM** - للتعامل مع قاعدة البيانات
- **MySQL** - قاعدة البيانات
- **JWT** - للمصادقة والتوثيق
- **bcryptjs** - لتشفير كلمات المرور
- **express-validator** - للتحقق من صحة البيانات

## التثبيت والتشغيل

### 1. تثبيت الحزم

```bash
cd backend
npm install
```

### 2. إعداد قاعدة البيانات

قم بإنشاء قاعدة بيانات MySQL:

```sql
CREATE DATABASE community_platform;
```

### 3. إعداد متغيرات البيئة

قم بتعديل ملف `.env` بإعدادات قاعدة البيانات الخاصة بك:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=community_platform
DB_DIALECT=mysql
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. تشغيل السيرفر

**وضع التطوير:**
```bash
npm run dev
```

**وضع الإنتاج:**
```bash
npm start
```

السيرفر سيعمل على: `http://localhost:5000`

## هيكل المشروع

```
backend/
├── config/
│   └── database.js          # إعدادات قاعدة البيانات
├── models/
│   ├── index.js             # ربط Models والعلاقات
│   ├── User.js
│   ├── Category.js
│   ├── Article.js
│   ├── ArticleRead.js
│   ├── Survey.js
│   ├── Question.js
│   ├── Option.js
│   ├── UserAnswer.js
│   ├── Game.js
│   ├── UserGame.js
│   ├── Poll.js
│   ├── PollVote.js
│   ├── DiscussionSession.js
│   └── SessionAttendance.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── categoryController.js
│   ├── articleController.js
│   ├── surveyController.js
│   ├── gameController.js
│   ├── pollController.js
│   └── discussionController.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── categoryRoutes.js
│   ├── articleRoutes.js
│   ├── surveyRoutes.js
│   ├── gameRoutes.js
│   ├── pollRoutes.js
│   └── discussionRoutes.js
├── middlewares/
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   └── errorHandler.js
├── utils/
│   └── pointsSystem.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

## API Endpoints

### المصادقة (Auth)

| Method | Endpoint | الوصف | الصلاحية |
|--------|----------|-------|---------|
| POST | `/api/auth/register` | تسجيل مستخدم جديد | Public |
| POST | `/api/auth/login` | تسجيل الدخول | Public |
| GET | `/api/auth/profile` | عرض الملف الشخصي | Private |
| PUT | `/api/auth/profile` | تحديث الملف الشخصي | Private |
| PUT | `/api/auth/change-password` | تغيير كلمة المرور | Private |

### المستخدمون (Users)

| Method | Endpoint | الوصف | الصلاحية |
|--------|----------|-------|---------|
| GET | `/api/users` | جميع المستخدمين | Admin |
| GET | `/api/users/:id` | مستخدم معين | Private |
| PUT | `/api/users/:id` | تحديث مستخدم | Admin |
| DELETE | `/api/users/:id` | حذف مستخدم | Admin |
| GET | `/api/users/:id/points` | نقاط المستخدم | Private |
| GET | `/api/users/leaderboard` | لوحة الصدارة | Public |

### التصنيفات (Categories)

| Method | Endpoint | الوصف | الصلاحية |
|--------|----------|-------|---------|
| POST | `/api/categories` | إنشاء تصنيف | Admin |
| GET | `/api/categories` | جميع التصنيفات | Public |
| GET | `/api/categories/:id` | تصنيف معين | Public |
| PUT | `/api/categories/:id` | تحديث تصنيف | Admin |
| DELETE | `/api/categories/:id` | حذف تصنيف | Admin |

### المقالات (Articles)

| Method | Endpoint | الوصف | الصلاحية |
|--------|----------|-------|---------|
| POST | `/api/articles` | إنشاء مقال | Admin |
| GET | `/api/articles` | جميع المقالات | Public |
| GET | `/api/articles/:id` | مقال معين | Public |
| GET | `/api/articles/category/:categoryId` | مقالات التصنيف | Public |
| PUT | `/api/articles/:id` | تحديث مقال | Admin |
| DELETE | `/api/articles/:id` | حذف مقال | Admin |
| POST | `/api/articles/:id/read` | تسجيل قراءة (5 نقاط) | Private |

### الاستبيانات (Surveys)

| Method | Endpoint | الوصف | الصلاحية |
|--------|----------|-------|---------|
| POST | `/api/surveys` | إنشاء استبيان | Admin |
| GET | `/api/surveys/article/:articleId` | استبيان المقال | Public |
| POST | `/api/surveys/:surveyId/submit` | إرسال إجابات (10 نقاط عند 70%+) | Private |
| GET | `/api/surveys/:surveyId/results` | نتائج المستخدم | Private |

### الألعاب (Games)

| Method | Endpoint | الوصف | الصلاحية |
|--------|----------|-------|---------|
| POST | `/api/games` | إنشاء لعبة | Admin |
| GET | `/api/games` | جميع الألعاب | Public |
| GET | `/api/games/:id` | لعبة معينة | Public |
| PUT | `/api/games/:id` | تحديث لعبة | Admin |
| DELETE | `/api/games/:id` | حذف لعبة | Admin |
| POST | `/api/games/:id/complete` | إكمال لعبة (15 نقطة) | Private |
| GET | `/api/games/user/history` | سجل ألعاب المستخدم | Private |

### استطلاعات الرأي (Polls)

| Method | Endpoint | الوصف | الصلاحية |
|--------|----------|-------|---------|
| POST | `/api/polls` | إنشاء استطلاع | Admin |
| GET | `/api/polls` | جميع الاستطلاعات | Public |
| GET | `/api/polls/:id` | استطلاع معين | Public |
| PUT | `/api/polls/:id` | تحديث استطلاع | Admin |
| DELETE | `/api/polls/:id` | حذف استطلاع | Admin |
| POST | `/api/polls/:id/vote` | التصويت (5 نقاط) | Private |
| GET | `/api/polls/:id/results` | نتائج الاستطلاع | Public |

### الجلسات الحوارية (Discussions)

| Method | Endpoint | الوصف | الصلاحية |
|--------|----------|-------|---------|
| POST | `/api/discussions` | إنشاء جلسة | Admin |
| GET | `/api/discussions` | جميع الجلسات | Public |
| GET | `/api/discussions/:id` | جلسة معينة | Public |
| PUT | `/api/discussions/:id` | تحديث جلسة | Admin |
| DELETE | `/api/discussions/:id` | حذف جلسة | Admin |
| POST | `/api/discussions/:id/attend` | تسجيل حضور (20 نقطة) | Private |
| GET | `/api/discussions/:id/attendees` | الحضور | Admin |

## نظام النقاط

| النشاط | النقاط |
|--------|--------|
| قراءة مقال | 5 نقاط |
| إكمال استبيان بنجاح (70%+) | 10 نقاط |
| إكمال لعبة | 15 نقطة |
| التصويت في استطلاع رأي | 5 نقاط |
| حضور جلسة حوارية | 20 نقطة |

### منع تكرار النقاط

- كل نشاط يمنح نقاط مرة واحدة فقط
- يتم التحقق من عدم تكرار الإجراء قبل منح النقاط

## أمثلة على الاستخدام

### تسجيل مستخدم جديد

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "123456"
}
```

### تسجيل الدخول

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "123456"
}
```

### إنشاء مقال (Admin)

```bash
POST http://localhost:5000/api/articles
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "أهمية الوعي المجتمعي",
  "content": "محتوى المقال...",
  "categoryId": "category-uuid-here"
}
```

### إنشاء استبيان (Admin)

```bash
POST http://localhost:5000/api/surveys
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "articleId": "article-uuid-here",
  "title": "اختبار المقال",
  "questions": [
    {
      "questionText": "ما هو الوعي المجتمعي؟",
      "options": [
        { "optionText": "إجابة صحيحة", "isCorrect": true },
        { "optionText": "إجابة خاطئة", "isCorrect": false }
      ]
    }
  ]
}
```

## الأمان

- ✅ تشفير كلمات المرور باستخدام bcrypt
- ✅ مصادقة JWT
- ✅ التحقق من صحة البيانات
- ✅ حماية المسارات بـ Middlewares
- ✅ منع SQL Injection (Sequelize ORM)
- ✅ معالجة الأخطاء المركزية

## المساهمة

للمساهمة في المشروع:

1. Fork المشروع
2. إنشاء فرع جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## الترخيص

MIT License

## الدعم

للدعم والاستفسارات، يرجى فتح Issue في المشروع.
#   c o m m u n i t y _ p l a t f o r m  
 