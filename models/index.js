// ملف ربط جميع النماذج والعلاقات بينها
const { sequelize } = require('../config/database');

// استيراد جميع النماذج
const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Article = require('./Article')(sequelize);
const ArticleRead = require('./ArticleRead')(sequelize);
const Survey = require('./Survey')(sequelize);
const Question = require('./Question')(sequelize);
const Option = require('./Option')(sequelize);
const UserAnswer = require('./UserAnswer')(sequelize);
const Game = require('./Game')(sequelize);
const UserGame = require('./UserGame')(sequelize);
const Poll = require('./Poll')(sequelize);
const PollVote = require('./PollVote')(sequelize);
const DiscussionSession = require('./DiscussionSession')(sequelize);
const SessionAttendance = require('./SessionAttendance')(sequelize);

// ==================== علاقات المستخدمين ====================

// المستخدم يمكنه كتابة عدة مقالات (كأدمن)
User.hasMany(Article, {
  foreignKey: 'adminId',
  as: 'articles'
});
Article.belongsTo(User, {
  foreignKey: 'adminId',
  as: 'admin'
});

// المستخدم يمكنه قراءة عدة مقالات
User.hasMany(ArticleRead, {
  foreignKey: 'userId',
  as: 'articleReads'
});
ArticleRead.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// المستخدم يمكنه الإجابة على عدة أسئلة
User.hasMany(UserAnswer, {
  foreignKey: 'userId',
  as: 'answers'
});
UserAnswer.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// المستخدم يمكنه لعب عدة ألعاب
User.hasMany(UserGame, {
  foreignKey: 'userId',
  as: 'userGames'
});
UserGame.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// المستخدم يمكنه التصويت في عدة استطلاعات
User.hasMany(PollVote, {
  foreignKey: 'userId',
  as: 'pollVotes'
});
PollVote.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// المستخدم يمكنه حضور عدة جلسات
User.hasMany(SessionAttendance, {
  foreignKey: 'userId',
  as: 'sessionAttendances'
});
SessionAttendance.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// المستخدم يمكنه إنشاء عدة استطلاعات رأي (كأدمن)
User.hasMany(Poll, {
  foreignKey: 'adminId',
  as: 'polls'
});
Poll.belongsTo(User, {
  foreignKey: 'adminId',
  as: 'admin'
});

// المستخدم يمكنه إنشاء عدة جلسات حوارية (كأدمن)
User.hasMany(DiscussionSession, {
  foreignKey: 'adminId',
  as: 'discussionSessions'
});
DiscussionSession.belongsTo(User, {
  foreignKey: 'adminId',
  as: 'admin'
});

// ==================== علاقات التصنيفات ====================

// التصنيف يحتوي على عدة مقالات
Category.hasMany(Article, {
  foreignKey: 'categoryId',
  as: 'articles'
});
Article.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

// ==================== علاقات المقالات ====================

// المقال يحتوي على استبيان واحد
Article.hasOne(Survey, {
  foreignKey: 'articleId',
  as: 'survey'
});
Survey.belongsTo(Article, {
  foreignKey: 'articleId',
  as: 'article'
});

// المقال يمكن قراءته من عدة مستخدمين
Article.hasMany(ArticleRead, {
  foreignKey: 'articleId',
  as: 'reads'
});
ArticleRead.belongsTo(Article, {
  foreignKey: 'articleId',
  as: 'article'
});

// ==================== علاقات الاستبيانات ====================

// الاستبيان يحتوي على عدة أسئلة
Survey.hasMany(Question, {
  foreignKey: 'surveyId',
  as: 'questions'
});
Question.belongsTo(Survey, {
  foreignKey: 'surveyId',
  as: 'survey'
});

// ==================== علاقات الأسئلة ====================

// السؤال يحتوي على عدة خيارات
Question.hasMany(Option, {
  foreignKey: 'questionId',
  as: 'options'
});
Option.belongsTo(Question, {
  foreignKey: 'questionId',
  as: 'question'
});

// السؤال يمكن أن يكون له عدة إجابات من المستخدمين
Question.hasMany(UserAnswer, {
  foreignKey: 'questionId',
  as: 'userAnswers'
});
UserAnswer.belongsTo(Question, {
  foreignKey: 'questionId',
  as: 'question'
});

// ==================== علاقات الخيارات ====================

// الخيار يمكن أن يكون إجابة لعدة مستخدمين
Option.hasMany(UserAnswer, {
  foreignKey: 'optionId',
  as: 'userAnswers'
});
UserAnswer.belongsTo(Option, {
  foreignKey: 'optionId',
  as: 'option'
});

// ==================== علاقات الألعاب ====================

// اللعبة يمكن أن يلعبها عدة مستخدمين
Game.hasMany(UserGame, {
  foreignKey: 'gameId',
  as: 'userGames'
});
UserGame.belongsTo(Game, {
  foreignKey: 'gameId',
  as: 'game'
});

// ==================== علاقات الاستطلاعات ====================

// الاستطلاع يمكن أن يحتوي على عدة أصوات
Poll.hasMany(PollVote, {
  foreignKey: 'pollId',
  as: 'votes'
});
PollVote.belongsTo(Poll, {
  foreignKey: 'pollId',
  as: 'poll'
});

// ==================== علاقات الجلسات الحوارية ====================

// الجلسة يمكن أن يحضرها عدة مستخدمين
DiscussionSession.hasMany(SessionAttendance, {
  foreignKey: 'sessionId',
  as: 'attendances'
});
SessionAttendance.belongsTo(DiscussionSession, {
  foreignKey: 'sessionId',
  as: 'session'
});

// تصدير جميع النماذج
module.exports = {
  sequelize,
  User,
  Category,
  Article,
  ArticleRead,
  Survey,
  Question,
  Option,
  UserAnswer,
  Game,
  UserGame,
  Poll,
  PollVote,
  DiscussionSession,
  SessionAttendance
};
