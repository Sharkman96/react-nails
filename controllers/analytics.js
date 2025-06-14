const ButtonClick = require('../models/ButtonClick');
const PageView = require('../models/PageView');
const geoip = require('geoip-lite');

// Отслеживание клика по кнопке
exports.trackButtonClick = async (req, res) => {
  try {
    const { buttonType } = req.body;
    
    if (!['whatsapp', 'instagram', 'phone'].includes(buttonType)) {
      return res.status(400).json({ message: 'Неверный тип кнопки' });
    }

    // Находим или создаем запись для этого типа кнопки
    const buttonClick = await ButtonClick.findOneAndUpdate(
      { buttonType },
      { 
        $inc: { count: 1 },
        lastClicked: new Date()
      },
      { 
        upsert: true,
        new: true 
      }
    );

    res.json({ success: true, count: buttonClick.count });
  } catch (error) {
    console.error('Error tracking button click:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение статистики кликов
exports.getButtonClicks = async (req, res) => {
  try {
    const buttonClicks = await ButtonClick.find().sort({ buttonType: 1 });
    
    // Создаем объект с нулевыми значениями для всех типов кнопок
    const clicks = {
      whatsapp: 0,
      instagram: 0,
      phone: 0
    };

    // Заполняем реальными данными
    buttonClicks.forEach(click => {
      clicks[click.buttonType] = click.count;
    });

    res.json(clicks);
  } catch (error) {
    console.error('Error getting button clicks:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Сброс статистики кликов
exports.resetButtonClicks = async (req, res) => {
  try {
    await ButtonClick.updateMany({}, { count: 0, lastClicked: new Date() });
    res.json({ success: true, message: 'Статистика кликов сброшена' });
  } catch (error) {
    console.error('Error resetting button clicks:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Отслеживание просмотра страницы
exports.trackPageView = async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'] || '';
    const page = req.body.page || '/';
    const referrer = req.headers.referer || '';
    const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'ru';

    // Получаем геолокацию по IP
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : 'Unknown';
    const city = geo ? geo.city : 'Unknown';

    // Создаем запись о просмотре
    const pageView = new PageView({
      ip,
      userAgent,
      page,
      country,
      city,
      referrer,
      language
    });

    await pageView.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение общей статистики
exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Общее количество просмотров за 30 дней
    const totalViews = await PageView.countDocuments({
      timestamp: { $gte: thirtyDaysAgo }
    });

    // Уникальные посетители за 30 дней (по IP)
    const uniqueVisitors = await PageView.distinct('ip', {
      timestamp: { $gte: thirtyDaysAgo }
    });

    // Статистика по странам
    const countryStats = await PageView.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Статистика по дням за последние 7 дней
    const dailyStats = await PageView.aggregate([
      { 
        $match: { 
          timestamp: { 
            $gte: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)) 
          } 
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          views: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Статистика по страницам
    const pageStats = await PageView.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$page', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Статистика кликов по кнопкам
    const buttonClicks = await ButtonClick.find().sort({ buttonType: 1 });
    const clicks = {
      whatsapp: 0,
      instagram: 0,
      phone: 0
    };
    buttonClicks.forEach(click => {
      clicks[click.buttonType] = click.count;
    });

    // Форматируем данные для фронтенда
    const countries = countryStats.map(stat => ({
      name: stat._id,
      count: stat.count,
      percentage: Math.round((stat.count / totalViews) * 100)
    }));

    const dailyViews = dailyStats.map(stat => ({
      date: stat._id,
      views: stat.views
    }));

    const topPages = pageStats.map(stat => ({
      page: stat._id === '/' ? 'Главная' : stat._id,
      views: stat.count,
      percentage: Math.round((stat.count / totalViews) * 100)
    }));

    res.json({
      pageViews: totalViews,
      uniqueVisitors: uniqueVisitors.length,
      clicks,
      countries,
      dailyViews,
      topPages
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}; 