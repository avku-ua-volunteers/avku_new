/**
 * 1. Language switching + local storage
**/
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
      // Используем innerHTML для поддержки HTML-тегов
      elem.innerHTML = translations[key];
    }
  });
}
/**
 2. Логика галереи: фильтрация + пагинация
**/
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


/*******************************************************
 * 3. Модальное окно (просмотр изображений)
**/
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


/**
 * Функционал для страницы публикаций
 */
document.addEventListener('DOMContentLoaded', function() {
    // Фильтрация публикаций по категориям
    const filterButtons = document.querySelectorAll('.filter-btn');
    const publications = document.querySelectorAll('.publication-card');
    
    // Добавляем обработчики событий для кнопок фильтрации
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Удаляем класс active у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем класс active нажатой кнопке
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            // Фильтруем публикации
            publications.forEach(publication => {
                if (filter === 'all' || publication.dataset.category === filter) {
                    publication.style.display = '';
                } else {
                    publication.style.display = 'none';
                }
            });
        });
    });
    
    // Поиск публикаций по тексту
    const searchInput = document.getElementById('publicationSearch');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        publications.forEach(publication => {
            const title = publication.querySelector('.publication-title').textContent.toLowerCase();
            const description = publication.querySelector('.publication-description').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                publication.style.display = '';
            } else {
                publication.style.display = 'none';
            }
        });
    });
    
    // Если есть активные фильтры из URL или других источников,
    // можно активировать их здесь при загрузке страницы
    function initializeFilters() {
        // Пример: получение параметра из URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        if (categoryParam) {
            const targetButton = document.querySelector(`.filter-btn[data-filter="${categoryParam}"]`);
            if (targetButton) {
                targetButton.click();
            }
        }
    }
    
    // Инициализация фильтров
    initializeFilters();
});













/**
 * Функционал для страницы публикаций
 */
/**
 * Функционал для страницы публикаций
 */
document.addEventListener('DOMContentLoaded', function() {
  // Фильтрация публикаций по категориям
  const filterButtons = document.querySelectorAll('.filter-btn');
  const publications = document.querySelectorAll('.publication-card');
  
  // Добавляем обработчики событий для кнопок фильтрации
  filterButtons.forEach(button => {
      button.addEventListener('click', function() {
          // Удаляем класс active у всех кнопок
          filterButtons.forEach(btn => btn.classList.remove('active'));
          // Добавляем класс active нажатой кнопке
          this.classList.add('active');
          
          const filter = this.dataset.filter;
          
          // Фильтруем публикации
          publications.forEach(publication => {
              if (filter === 'all' || publication.dataset.category === filter) {
                  publication.style.display = '';
              } else {
                  publication.style.display = 'none';
              }
          });
      });
  });
  
  // Поиск публикаций по тексту
  const searchInput = document.getElementById('publicationSearch');
  
  searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      
      publications.forEach(publication => {
          const title = publication.querySelector('.publication-title').textContent.toLowerCase();
          const description = publication.querySelector('.publication-description').textContent.toLowerCase();
          
          if (title.includes(searchTerm) || description.includes(searchTerm)) {
              publication.style.display = '';
          } else {
              publication.style.display = 'none';
          }
      });
  });
  
  // Функционал просмотра PDF
  const modal = document.getElementById('pdfPreviewModal');
  const pdfViewer = document.getElementById('pdfViewer');
  const modalTitle = document.getElementById('pdfModalTitle');
  const downloadBtn = document.getElementById('downloadPdfBtn');
  const closeBtn = document.getElementById('closePdfModal');
  const previewButtons = document.querySelectorAll('.publication-preview-btn');
  
  // Открытие модального окна для просмотра PDF
  previewButtons.forEach(button => {
      button.addEventListener('click', function() {
          const pdfUrl = this.dataset.pdf;
          const pdfTitle = this.dataset.title;
          
          // Устанавливаем URL PDF в iframe
          pdfViewer.src = pdfUrl;
          
          // Устанавливаем заголовок модального окна
          modalTitle.textContent = pdfTitle;
          
          // Устанавливаем URL для кнопки скачивания
          downloadBtn.addEventListener('click', function() {
              // Создаем временную ссылку для скачивания
              const tempLink = document.createElement('a');
              tempLink.href = pdfUrl;
              tempLink.download = pdfUrl.split('/').pop();
              document.body.appendChild(tempLink);
              tempLink.click();
              document.body.removeChild(tempLink);
          });
          
          // Отображаем модальное окно
          modal.style.display = 'block';
          
          // Запрещаем прокрутку страницы
          document.body.style.overflow = 'hidden';
      });
  });
  
  // Закрытие модального окна
  closeBtn.addEventListener('click', closeModal);
  
  // Закрытие модального окна при клике вне content
  modal.addEventListener('click', function(e) {
      if (e.target === modal) {
          closeModal();
      }
  });
  
  // Закрытие модального окна по клавише Escape
  document.addEventListener('keyup', function(e) {
      if (e.key === 'Escape' && modal.style.display === 'block') {
          closeModal();
      }
  });
  
  function closeModal() {
      modal.style.display = 'none';
      pdfViewer.src = '';
      document.body.style.overflow = '';
  }
  
  // Если есть активные фильтры из URL или других источников,
  // можно активировать их здесь при загрузке страницы
  function initializeFilters() {
      // Пример: получение параметра из URL
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get('category');
      
      if (categoryParam) {
          const targetButton = document.querySelector(`.filter-btn[data-filter="${categoryParam}"]`);
          if (targetButton) {
              targetButton.click();
          }
      }
  }
  
  // Инициализация фильтров
  initializeFilters();
});