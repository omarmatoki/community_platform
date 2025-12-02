// Seeder لإضافة استطلاعات رأي تجريبية
const { Poll, PollOption, User } = require('../models');

const seedPolls = async () => {
  try {
    console.log('🔄 بدء إضافة استطلاعات الرأي التجريبية...');

    // الحصول على مستخدم أدمن
    const admin = await User.findOne({ where: { role: 'admin' } });

    if (!admin) {
      console.log('⚠️  لم يتم العثور على مستخدم أدمن. يرجى إنشاء مستخدم أدمن أولاً.');
      return;
    }

    // حذف الاستطلاعات القديمة (اختياري)
    await Poll.destroy({ where: {} });
    console.log('🗑️  تم حذف الاستطلاعات القديمة');

    // استطلاع 1: تقييم الخدمة
    const poll1 = await Poll.create({
      title: 'كيف تقيّم مستوى الخدمة المقدمة؟',
      description: 'نود معرفة رأيك في جودة الخدمة',
      adminId: admin.id,
      pointsReward: 5
    });

    await PollOption.create({ pollId: poll1.id, text: 'ممتاز', order: 0 });
    await PollOption.create({ pollId: poll1.id, text: 'جيد جداً', order: 1 });
    await PollOption.create({ pollId: poll1.id, text: 'جيد', order: 2 });
    await PollOption.create({ pollId: poll1.id, text: 'مقبول', order: 3 });
    await PollOption.create({ pollId: poll1.id, text: 'سيء', order: 4 });

    console.log('✓ تم إضافة استطلاع: تقييم الخدمة');

    // استطلاع 2: لغات البرمجة
    const poll2 = await Poll.create({
      title: 'ما هي لغة البرمجة المفضلة لديك؟',
      description: 'شاركنا بلغة البرمجة التي تحب العمل بها',
      adminId: admin.id,
      pointsReward: 5
    });

    await PollOption.create({ pollId: poll2.id, text: 'JavaScript', order: 0 });
    await PollOption.create({ pollId: poll2.id, text: 'Python', order: 1 });
    await PollOption.create({ pollId: poll2.id, text: 'Java', order: 2 });
    await PollOption.create({ pollId: poll2.id, text: 'C#', order: 3 });
    await PollOption.create({ pollId: poll2.id, text: 'PHP', order: 4 });
    await PollOption.create({ pollId: poll2.id, text: 'Go', order: 5 });

    console.log('✓ تم إضافة استطلاع: لغات البرمجة');

    // استطلاع 3: وقت الفراغ
    const poll3 = await Poll.create({
      title: 'كيف تفضل قضاء وقت فراغك؟',
      description: 'أخبرنا عن نشاطك المفضل',
      adminId: admin.id,
      pointsReward: 5
    });

    await PollOption.create({ pollId: poll3.id, text: 'القراءة', order: 0 });
    await PollOption.create({ pollId: poll3.id, text: 'الرياضة', order: 1 });
    await PollOption.create({ pollId: poll3.id, text: 'مشاهدة الأفلام', order: 2 });
    await PollOption.create({ pollId: poll3.id, text: 'الألعاب الإلكترونية', order: 3 });
    await PollOption.create({ pollId: poll3.id, text: 'السفر', order: 4 });

    console.log('✓ تم إضافة استطلاع: وقت الفراغ');

    // استطلاع 4: التعلم الإلكتروني
    const poll4 = await Poll.create({
      title: 'ما رأيك في التعلم الإلكتروني؟',
      description: 'شاركنا تجربتك مع التعلم عن بعد',
      adminId: admin.id,
      pointsReward: 5
    });

    await PollOption.create({ pollId: poll4.id, text: 'فعّال جداً', order: 0 });
    await PollOption.create({ pollId: poll4.id, text: 'فعّال', order: 1 });
    await PollOption.create({ pollId: poll4.id, text: 'متوسط', order: 2 });
    await PollOption.create({ pollId: poll4.id, text: 'غير فعّال', order: 3 });

    console.log('✓ تم إضافة استطلاع: التعلم الإلكتروني');

    // استطلاع 5: أنظمة التشغيل
    const poll5 = await Poll.create({
      title: 'ما هو نظام التشغيل الذي تستخدمه؟',
      description: 'أخبرنا عن نظام التشغيل المفضل لديك',
      adminId: admin.id,
      pointsReward: 5
    });

    await PollOption.create({ pollId: poll5.id, text: 'Windows', order: 0 });
    await PollOption.create({ pollId: poll5.id, text: 'macOS', order: 1 });
    await PollOption.create({ pollId: poll5.id, text: 'Linux', order: 2 });
    await PollOption.create({ pollId: poll5.id, text: 'أخرى', order: 3 });

    console.log('✓ تم إضافة استطلاع: أنظمة التشغيل');

    console.log('');
    console.log('✅ تمت إضافة جميع الاستطلاعات التجريبية بنجاح!');
    console.log('📊 عدد الاستطلاعات: 5');

  } catch (error) {
    console.error('❌ خطأ في إضافة الاستطلاعات:', error.message);
    throw error;
  }
};

module.exports = seedPolls;
