// Controller لإدارة الاستبيانات
const { Survey, Question, Option, UserAnswer, Article } = require('../models');
const { addPoints, calculateSurveyPoints } = require('../utils/pointsSystem');

// @desc    إنشاء استبيان مع الأسئلة والخيارات
// @route   POST /api/surveys
// @access  Private/Admin
const createSurvey = async (req, res, next) => {
  try {
    const { articleId, title, questions } = req.body;

    if (!articleId || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'معرف المقال والأسئلة مطلوبة'
      });
    }

    // التحقق من وجود المقال
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'المقال غير موجود'
      });
    }

    // التحقق من عدم وجود استبيان للمقال
    const existingSurvey = await Survey.findOne({ where: { articleId } });
    if (existingSurvey) {
      return res.status(400).json({
        success: false,
        message: 'يوجد استبيان بالفعل لهذا المقال'
      });
    }

    // إنشاء الاستبيان
    const survey = await Survey.create({
      articleId,
      title
    });

    // إنشاء الأسئلة والخيارات
    for (const questionData of questions) {
      const question = await Question.create({
        surveyId: survey.id,
        questionText: questionData.questionText
      });

      if (questionData.options && questionData.options.length > 0) {
        for (const optionData of questionData.options) {
          await Option.create({
            questionId: question.id,
            optionText: optionData.optionText,
            isCorrect: optionData.isCorrect || false
          });
        }
      }
    }

    // إعادة جلب الاستبيان مع الأسئلة والخيارات
    const fullSurvey = await Survey.findByPk(survey.id, {
      include: [
        {
          model: Question,
          as: 'questions',
          include: [
            {
              model: Option,
              as: 'options'
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الاستبيان بنجاح',
      data: fullSurvey
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على استبيان حسب معرف المقال
// @route   GET /api/surveys/article/:articleId
// @access  Public
const getSurveyByArticleId = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({
      where: { articleId: req.params.articleId },
      include: [
        {
          model: Question,
          as: 'questions',
          include: [
            {
              model: Option,
              as: 'options',
              attributes: ['id', 'optionText'] // إخفاء isCorrect
            }
          ]
        }
      ]
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'الاستبيان غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: survey
    });
  } catch (error) {
    next(error);
  }
};

// @desc    إرسال إجابات الاستبيان
// @route   POST /api/surveys/:surveyId/submit
// @access  Private
const submitSurveyAnswers = async (req, res, next) => {
  try {
    const { answers } = req.body; // [{questionId, optionId}, ...]
    const surveyId = req.params.surveyId;
    const userId = req.user.id;

    if (!answers || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'الإجابات مطلوبة'
      });
    }

    // التحقق من وجود الاستبيان
    const survey = await Survey.findByPk(surveyId, {
      include: [
        {
          model: Question,
          as: 'questions'
        }
      ]
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'الاستبيان غير موجود'
      });
    }

    // التحقق من عدم إرسال الإجابات مسبقاً
    const existingAnswers = await UserAnswer.findOne({
      include: [
        {
          model: Question,
          as: 'question',
          where: { surveyId }
        }
      ],
      where: { userId }
    });

    if (existingAnswers) {
      return res.status(400).json({
        success: false,
        message: 'لقد أجبت على هذا الاستبيان مسبقاً'
      });
    }

    let correctAnswers = 0;
    const totalQuestions = survey.questions.length;

    // معالجة الإجابات
    for (const answer of answers) {
      const { questionId, optionId } = answer;

      // التحقق من الخيار
      const option = await Option.findByPk(optionId);
      if (!option || option.questionId !== questionId) {
        continue;
      }

      // حفظ الإجابة
      await UserAnswer.create({
        userId,
        questionId,
        optionId,
        isCorrect: option.isCorrect
      });

      if (option.isCorrect) {
        correctAnswers++;
      }
    }

    // حساب النقاط
    const result = calculateSurveyPoints(correctAnswers, totalQuestions);

    // منح النقاط إذا نجح
    if (result.passed) {
      await addPoints(userId, result.points);
    }

    res.status(200).json({
      success: true,
      message: result.passed ? 'أحسنت! لقد نجحت في الاستبيان' : 'للأسف لم تحصل على النقاط المطلوبة (70%+)',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    الحصول على نتائج الاستبيان للمستخدم
// @route   GET /api/surveys/:surveyId/results
// @access  Private
const getUserSurveyResults = async (req, res, next) => {
  try {
    const surveyId = req.params.surveyId;
    const userId = req.user.id;

    const userAnswers = await UserAnswer.findAll({
      include: [
        {
          model: Question,
          as: 'question',
          where: { surveyId },
          include: [
            {
              model: Option,
              as: 'options'
            }
          ]
        },
        {
          model: Option,
          as: 'option'
        }
      ],
      where: { userId }
    });

    if (userAnswers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'لم تجب على هذا الاستبيان بعد'
      });
    }

    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = userAnswers.length;
    const result = calculateSurveyPoints(correctAnswers, totalQuestions);

    res.status(200).json({
      success: true,
      data: {
        answers: userAnswers,
        result
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSurvey,
  getSurveyByArticleId,
  submitSurveyAnswers,
  getUserSurveyResults
};
