/*********************************************************** 
 * 1. Language switching + local storage
 **********************************************************/
document.addEventListener("DOMContentLoaded", () => {
  // Get the previously selected language from localStorage, or default to "en"
  const savedLang = localStorage.getItem("selectedLanguage") || "en";
  loadLanguage(savedLang);

  // Add click handlers to language switch buttons
  document.querySelectorAll(".lang-btn").forEach(button => {
    button.addEventListener("click", () => {
      const lang = button.getAttribute("data-lang");
      loadLanguage(lang);
    });
  });

  // Hamburger menu click handler
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  // Initialize the gallery after language and menu setup
  initGallery();

  // Set up the modal (once)
  setupModal();
});

/**
 * Loads the JSON file with translations for the selected language
 * @param {string} lang - language code ("en" or "uk")
 */
function loadLanguage(lang) {
  fetch(`lang/${lang}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error loading translation file");
      }
      return response.json();
    })
    .then(data => {
      applyTranslations(data);
      // Change the page title if "page_title" exists in the JSON
      document.title = data.page_title || document.title;
      // Save the selected language to localStorage
      localStorage.setItem("selectedLanguage", lang);
    })
    .catch(error => {
      console.error("Error loading translation:", error);
    });
}

/**
 * Applies translations from the translations object to all elements with data-translate
 * @param {Object} translations - object with translations
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
  // При клике на кнопку-фильтр:
  document.querySelectorAll('.btn-filter').forEach(button => {
    button.addEventListener('click', () => {
      // Меняем фильтр
      activeFilter = button.dataset.filter;
      // Сбрасываем на первую страницу
      currentPage = 1;
      // Обновляем галерею
      updateGallery();
      // Подсвечиваем активную кнопку
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
    });
  });

  // Первичный рендер
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

  // Скрываем все элементы
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

function renderPagination() {
  const container = document.querySelector('.pagination-inner');
  if (!container) return; // Если блока пагинации нет

  container.innerHTML = '';

  // Если страниц меньше 2, пагинация не нужна
  if (totalPages <= 1) {
    return;
  }

  // Кнопка "Предыдущая страница"
  const prevButton = document.createElement('button');
  prevButton.className = 'page-link prev-page';
  prevButton.textContent = '<';
  prevButton.disabled = (currentPage === 1);
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updateGallery();
    }
  });
  container.appendChild(prevButton);

  // Максимальное количество кнопок с номерами страниц
  const maxButtons = 5;
  let startPage, endPage;

  if (totalPages <= maxButtons) {
    startPage = 1;
    endPage = totalPages;
  } else {
    const half = Math.floor(maxButtons / 2);
    startPage = currentPage - half;
    endPage = currentPage + half;

    // Корректировка, если диапазон выходит за пределы допустимых значений
    if (startPage < 1) {
      startPage = 1;
      endPage = maxButtons;
    }
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = totalPages - maxButtons + 1;
    }
  }

  // Кнопки с номерами страниц
  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement('button');
    button.className = `page-link ${i === currentPage ? 'active' : ''}`;
    button.textContent = i;
    button.addEventListener('click', () => {
      currentPage = i;
      updateGallery();
    });
    container.appendChild(button);
  }

  // Кнопка "Следующая страница"
  const nextButton = document.createElement('button');
  nextButton.className = 'page-link next-page';
  nextButton.textContent = '>';
  nextButton.disabled = (currentPage === totalPages);
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      updateGallery();
    }
  });
  container.appendChild(nextButton);
}


/***********************************************************
 * 3. Модальное окно (просмотр изображений)
 **********************************************************/
/**
 * Настройка модального окна: навешиваем обработчики кликов на изображения и на кнопку закрытия
 */
function setupModal() {
  const modal = document.querySelector('.gallery-modal');
  if (!modal) return; // Если модальное окно отсутствует

  const modalClose = modal.querySelector('.modal-close');
  const modalImg = modal.querySelector('#modal-image');
  const modalCaption = modal.querySelector('.modal-caption');

  // Открытие модального окна по клику на изображение
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

  // Закрытие модального окна по клику на крестик
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Закрытие модального окна по клику вне изображения
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}
