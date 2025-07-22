// api/server.js

// ❗️ Мы убрали "const fetch = require('node-fetch');" сверху

// Экспортируем функцию-обработчик, которую Vercel будет запускать
module.exports = async (req, res) => {
    // Разрешаем запросы с любого домена (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обработка предварительного запроса OPTIONS от браузера
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Принимаем только POST-запросы
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
    
    // 🔐 Получаем секретные ключи из переменных окружения Vercel
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

    // Получаем данные из тела запроса
    const { name, email, message } = req.body;

    // Проверяем, что все данные пришли
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Всі поля є обовʼязковими для заповнення' });
    }

    // Формируем текст сообщения для Telegram
    const text = `Нове повідомлення з сайту! \n\n*Ім'я:* ${name}\n*Email:* ${email}\n*Сообщение:*\n${message}`;

    // URL для отправки запроса к Telegram API
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text
        })
    };

    try {
        // ✅ Динамически импортируем node-fetch прямо перед использованием
        const fetch = (await import('node-fetch')).default;

        const response = await fetch(url, options);
        const data = await response.json();

        if (data.ok) {
            res.status(200).json({ success: true, message: 'Повідомлення успішно надіслано!' });
        } else {
            res.status(500).json({ success: false, error: 'Помилка при відправці в Telegram.' });
        }
    } catch (error) {
        console.error(error); // Добавим логгирование ошибки для отладки
        res.status(500).json({ success: false, error: 'Внутрішня помилка сервера.' });
    }
};