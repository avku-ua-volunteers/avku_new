// api/server.js

// Импортируем модуль для отправки запросов
const fetch = require('node-fetch');

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
        return res.status(400).json({ success: false, error: 'Все поля обязательны для заполнения' });
    }

    // Формируем текст сообщения для Telegram
    const text = `🔔 *Новое сообщение с сайта!* 🔔\n\n*Имя:* ${name}\n*Email:* ${email}\n*Сообщение:*\n${message}`;

    // URL для отправки запроса к Telegram API
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
            parse_mode: 'Markdown'
        })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (data.ok) {
            res.status(200).json({ success: true, message: 'Сообщение успешно отправлено!' });
        } else {
            res.status(500).json({ success: false, error: 'Ошибка при отправке в Telegram.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера.' });
    }
};