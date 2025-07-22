// script.js
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    // Создаем элемент для вывода сообщений о статусе
    let statusMessage = document.querySelector('.form-status');
    if (!statusMessage) {
        statusMessage = document.createElement('p');
        statusMessage.className = 'form-status';
        contactForm.appendChild(statusMessage);
    }

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // ❗️ Вставьте сюда URL, который вам предоставил Vercel
       const VERCEL_URL = 'https://avku-6o1u-4245877s-projects.vercel.app/';

        statusMessage.textContent = 'Отправка...';
        statusMessage.style.color = 'blue';

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch(VERCEL_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                statusMessage.textContent = 'Сообщение успешно отправлено!';
                statusMessage.style.color = 'green';
                contactForm.reset();
            } else {
                statusMessage.textContent = `Ошибка: ${result.error || 'Не удалось отправить.'}`;
                statusMessage.style.color = 'red';
            }
        } catch (error) {
            statusMessage.textContent = 'Ошибка сети. Попробуйте позже.';
            statusMessage.style.color = 'red';
        }
    });
});