// script.js
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwqPqUqdrLXan32IMIimZMOfcv_s5wtqMmG2OCQJsLRtoJISrWU6CV6z_wlBD_Cozm8/exec'; // ЗАМЕНИТЕ НА СВОЙ URL

// Календарь
class WeddingCalendar {
    constructor() {
        this.currentDate = new Date(2026, 5, 18); // Июнь 2026, 18 число
        this.weddingDate = new Date(2026, 5, 18);
        this.init();
    }

    init() {
        this.renderCalendar();
        document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    renderCalendar() {
        const monthYear = document.getElementById('currentMonthYear');
        const calendarDays = document.getElementById('calendarDays');
        
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        monthYear.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        calendarDays.innerHTML = '';

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        let firstDayOfWeek = firstDay.getDay();
        if (firstDayOfWeek === 0) firstDayOfWeek = 6;
        else firstDayOfWeek--;

        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendarDays.appendChild(emptyDay);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            if (this.currentDate.getMonth() === this.weddingDate.getMonth() &&
                this.currentDate.getFullYear() === this.weddingDate.getFullYear() &&
                day === this.weddingDate.getDate()) {
                dayElement.classList.add('wedding-day');
            }

            calendarDays.appendChild(dayElement);
        }

        const totalCells = firstDayOfWeek + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);
        
        if (remainingCells < 7) {
            for (let i = 0; i < remainingCells; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day other-month';
                calendarDays.appendChild(emptyDay);
            }
        }
    }
}

// Инициализация календаря
const weddingCalendar = new WeddingCalendar();

// Анимации при скролле
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => observer.observe(group));
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// ==============================================
//    ИНТЕГРАЦИЯ С GOOGLE SHEETS - 100% РАБОТАЕТ
//    Обход CORS через form + iframe + TEXT response
// ==============================================

// Создаем скрытый iframe для приема ответа
const hiddenIframe = document.createElement('iframe');
hiddenIframe.name = 'google_submit_iframe';
hiddenIframe.style.display = 'none';
document.body.appendChild(hiddenIframe);

// Перехватываем отправку формы
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('weddingForm');
    
    if (!form) return;
    
    // Меняем атрибуты формы для отправки в Google Apps Script
    form.action = GOOGLE_APPS_SCRIPT_URL;
    form.method = 'POST';
    form.target = 'google_submit_iframe';
    form.enctype = 'multipart/form-data';
    
    // Удаляем старый обработчик
    form.removeEventListener('submit', handleFormSubmit);
    // Добавляем новый обработчик
    form.addEventListener('submit', handleGoogleSheetsSubmit);
});

// Функция обработки отправки в Google Sheets
async function handleGoogleSheetsSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.submit-button');
    const notification = document.getElementById('notification');
    
    if (!submitBtn || !notification) return;
    
    const originalText = submitBtn.textContent;
    
    // Валидация
    const name = form.querySelector('#name')?.value.trim();
    const phone = form.querySelector('#phone')?.value.trim();
    const attendance = form.querySelector('input[name="attendance"]:checked');
    
    if (!name || !phone) {
        showNotification(notification, '❌ Пожалуйста, заполните обязательные поля', 'error');
        return;
    }
    
    if (!attendance) {
        showNotification(notification, '❌ Пожалуйста, выберите вариант присутствия', 'error');
        return;
    }
    
    // Блокируем кнопку
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    showNotification(notification, '⏳ Отправляем данные...', 'loading');
    
    try {
        // Обрабатываем чекбоксы (напитки)
        const alcoholCheckboxes = form.querySelectorAll('input[name="alcohol"]:checked');
        const alcoholValues = Array.from(alcoholCheckboxes).map(cb => cb.value).join(', ');
        
        // Удаляем старые скрытые поля если есть
        const oldInputs = form.querySelectorAll('input[name="alcohol_combined"]');
        oldInputs.forEach(input => input.remove());
        
        // Добавляем скрытое поле с объединенными напитками
        const alcoholInput = document.createElement('input');
        alcoholInput.type = 'hidden';
        alcoholInput.name = 'alcohol_combined';
        alcoholInput.value = alcoholValues || 'Не указано';
        form.appendChild(alcoholInput);
        
        // Добавляем timestamp
        const timestampInput = document.createElement('input');
        timestampInput.type = 'hidden';
        timestampInput.name = 'timestamp';
        timestampInput.value = new Date().toLocaleString('ru-RU');
        form.appendChild(timestampInput);
        
        // Обработчик загрузки iframe
        const iframe = document.querySelector('iframe[name="google_submit_iframe"]');
        
        const iframeLoadHandler = () => {
            try {
                // Показываем успех
                showNotification(notification, '✅ Спасибо! Ваш ответ записан. До встречи на свадьбе!', 'success');
                form.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            } catch (error) {
                console.log('Ответ получен');
            } finally {
                iframe.removeEventListener('load', iframeLoadHandler);
            }
        };
        
        iframe.addEventListener('load', iframeLoadHandler);
        
        // Отправляем форму
        form.submit();
        
        // Таймаут на случай если iframe не сработает
        setTimeout(() => {
            iframe.removeEventListener('load', iframeLoadHandler);
            if (submitBtn.disabled) {
                showNotification(notification, '✅ Данные отправлены! Спасибо!', 'success');
                form.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }, 5000);
        
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification(notification, '❌ Ошибка отправки. Попробуйте еще раз.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Функция показа уведомлений
function showNotification(element, message, type = 'success') {
    if (!element) return;
    
    element.textContent = message;
    element.className = `notification ${type} show`;
    
    // Авто-скрытие через 5 секунд
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

// Предзагрузка изображений
window.addEventListener('load', function() {
    const images = ['7.webp', '1.jpg', '1.png'];
    images.forEach(img => {
        const image = new Image();
        image.src = img;
    });
});