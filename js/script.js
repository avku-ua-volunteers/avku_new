/***********************************************************
 * 1. Переключение языка + локальное хранилище
 **********************************************************/
document.addEventListener("DOMContentLoaded", () => {
  // Если язык уже выбран ранее, берем его из localStorage, иначе по умолчанию "en"
  const savedLang = localStorage.getItem("selectedLanguage") || "en";
  loadLanguage(savedLang);

  // Обработчик клика по кнопкам смены языка
  document.querySelectorAll(".lang-btn").forEach(button => {
    button.addEventListener("click", () => {
      const lang = button.getAttribute("data-lang");
      loadLanguage(lang);
    });
  });

  // Обработчик клика по гамбургеру (меню)
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  // После инициализации языка и меню — запускаем галерею
  initGallery();

  // Настраиваем модальное окно (один раз)
  setupModal();
});

/**
 * Загружает JSON-файл с переводами для выбранного языка
 * @param {string} lang - код языка ("en" или "uk")
 */
function loadLanguage(lang) {
  fetch(`lang/${lang}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Ошибка загрузки файла перевода");
      }
      return response.json();
    })
    .then(data => {
      applyTranslations(data);
      // Меняем заголовок страницы (если в JSON есть key page_title)
      document.title = data.page_title || document.title;
      // Сохраняем выбранный язык в localStorage
      localStorage.setItem("selectedLanguage", lang);
    })
    .catch(error => {
      console.error("Ошибка при загрузке перевода:", error);
    });
}

/**
 * Применяет переводы из объекта translations ко всем элементам с data-translate
 * @param {Object} translations - объект с переводами
 */
function applyTranslations(translations) {
  document.querySelectorAll("[data-translate]").forEach(elem => {
    const key = elem.getAttribute("data-translate");
    if (translations[key]) {
      elem.textContent = translations[key];
    }
  });
}

/***********************************************************
 * 2. Логика галереи: фильтрация + пагинация
 **********************************************************/
// Конфигурация
const itemsPerPage = 9; // Количество фото на странице
let currentPage = 1;
let totalPages = 1;
let activeFilter = 'all';

/**
 * Инициализация галереи:
 *  - навешиваем обработчик на кнопки фильтра
 *  - запускаем первый рендер
 */
function initGallery() {
  // Когда нажимаем на кнопку-фильтр:
  document.querySelectorAll('.btn-filter').forEach(button => {
    button.addEventListener('click', () => {
      // Меняем фильтр
      activeFilter = button.dataset.filter;
      // Сбрасываем на первую страницу
      currentPage = 1;
      // Обновляем галерею
      updateGallery();
      // Подсветка активной кнопки (если нужно)
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
    });
  });

  // Запускаем первичный рендер
  updateGallery();
}

/**
 * Функция, которая скрывает/показывает элементы исходя из текущего фильтра и пагинации
 */
function updateGallery() {
  const allItems = Array.from(document.querySelectorAll('.gallery-item'));
  
  // Фильтруем по activeFilter
  const filteredItems = (activeFilter === 'all')
    ? allItems
    : allItems.filter(item => item.classList.contains(activeFilter));
  
  // Считаем общее кол-во страниц
  totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Скрываем все
  allItems.forEach(item => {
    item.style.display = 'none';
  });

  // Показываем элементы текущей страницы
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  filteredItems.slice(start, end).forEach(item => {
    item.style.display = 'block';
  });

  // Генерируем и отрисовываем пагинацию
  renderPagination();
}

/**
 * Генерация кнопок пагинации
 */
function renderPagination() {
  const container = document.querySelector('.pagination-inner');
  if (!container) return; // Если блока пагинации нет на странице

  container.innerHTML = '';

  // Если страниц меньше 2, можно спрятать блок пагинации
  if (totalPages <= 1) {
    return;
  }

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.className = `page-link ${i === currentPage ? 'active' : ''}`;
    button.textContent = i;
    button.addEventListener('click', () => {
      currentPage = i;
      updateGallery();
    });
    container.appendChild(button);
  }
}

/***********************************************************
 * 3. Модальное окно (просмотр изображений)
 **********************************************************/
/**
 * Настройка модального окна: навешиваем обработчики кликов на изображения и на кнопку закрытия
 */
function setupModal() {
  const modal = document.querySelector('.gallery-modal');
  if (!modal) return; // Если у вас нет модального окна на странице

  const modalClose = modal.querySelector('.modal-close');
  const modalImg = modal.querySelector('#modal-image');
  const modalCaption = modal.querySelector('.modal-caption');

  // Клик по каждому изображению в галерее
  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', () => {
      modal.style.display = 'block';
      modalImg.src = img.src;

      // Ищем подпись внутри <figure> → <figcaption>, если есть
      const fig = img.closest('figure');
      if (fig) {
        const captionEl = fig.querySelector('figcaption');
        modalCaption.textContent = captionEl ? captionEl.textContent : '';
      } else {
        modalCaption.textContent = '';
      }
    });
  });

  // Закрытие модалки по клику на крестик
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Закрытие модалки по клику вне картинки (дополнительно)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}
