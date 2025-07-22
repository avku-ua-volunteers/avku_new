// server.js

// Импортируем необходимые модули
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors'); // Модуль для решения проблем с CORS

// ✅ Ваши данные, которые мы подставили ниже
const TELEGRAM_BOT_TOKEN = '7454103103:AAHNkz9hynfetF8pUKeEH0AawBX_84ZjCc4'; // Ваш API токен от BotFather
const TELEGRAM_CHAT_ID = '5891958541';     // Ваш ID чата от userinfobot

// Создаем приложение Express
const app = express();
const PORT = 3000; // Порт, на котором будет работать сервер

// Настройка Middleware
app.use(cors()); // Разрешаем запросы с других доменов
app.use(bodyParser.json()); // Позволяет серверу понимать JSON-формат данных

app.post('/sendMessage', async (req, res) => {
    // Получаем данные из тела запроса
    const { name, email, message } = req.body;

    // Проверяем, что все данные пришли
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Все поля обязательны для заполнения' });
    }

    // Формируем текст сообщения для Telegram
    const text = `
        🔔 *Новое сообщение с сайта!* 🔔
        \n*Имя:* ${name}
        \n*Email:* ${email}
        \n*Сообщение:*
        \n${message}
    `;

    // Формируем URL для отправки запроса к Telegram API
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    // Параметры для отправки
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
            parse_mode: 'Markdown' // Используем Markdown для красивого форматирования
        })
    };

    try {
        // Отправляем запрос к Telegram
        const response = await fetch(url, options);
        const data = await response.json();

        if (data.ok) {
            console.log('Сообщение успешно отправлено в Telegram!');
            res.status(200).json({ success: true, message: 'Сообщение успешно отправлено!' });
        } else {
            console.error('Ошибка от Telegram:', data);
            res.status(500).json({ success: false, error: 'Не удалось отправить сообщение. Ошибка Telegram.' });
        }
    } catch (error) {
        console.error('Ошибка сервера:', error);
        res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера.' });
    }
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Сервер запущен и слушает порт ${PORT}`);
    console.log(`Отправляйте POST-запросы на http://localhost:${PORT}/sendMessage`);
});