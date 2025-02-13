// При загрузке документа
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
      // Меняем заголовок страницы
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
