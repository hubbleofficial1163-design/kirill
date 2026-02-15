// script.js
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwqPqUqdrLXan32IMIimZMOfcv_s5wtqMmG2OCQJsLRtoJISrWU6CV6z_wlBD_Cozm8/exec';

// Календарь
class WeddingCalendar {
    constructor() {
        this.currentDate = new Date(2026, 5, 18);
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
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем календарь только если есть элементы на странице
    if (document.getElementById('calendarDays')) {
        const weddingCalendar = new WeddingCalendar();
    }

    // Анимации при скролле
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => observer.observe(group));
    
    // Плавный скролл для якорей
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

    // Инициализация формы
    initForm();
});

// ==============================================
//    УЛУЧШЕННОЕ УВЕДОМЛЕНИЕ И ОТПРАВКА ФОРМЫ
// ==============================================

// Создаём контейнер для уведомления
const notificationDiv = document.createElement('div');
notificationDiv.id = 'weddingNotification';
notificationDiv.style.cssText = `
    position: fixed;
    top: 30px;
    right: 30px;
    background: #6b4f3a;
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    font-size: 1.3rem;
    font-family: 'Cormorant Garamond', serif;
    box-shadow: 0 15px 35px rgba(74,55,41,0.3);
    transform: translateX(150%);
    transition: transform 0.4s ease;
    z-index: 9999;
    border-left: 6px solid #e6d5c1;
    max-width: 400px;
    line-height: 1.5;
`;
notificationDiv.innerHTML = '💌 Спасибо! Ваш ответ отправлен.';
document.body.appendChild(notificationDiv);

// Функция показа уведомления
function showSimpleNotification(message = '💌 Спасибо! Ваш ответ отправлен.') {
    notificationDiv.innerHTML = message;
    notificationDiv.style.transform = 'translateX(0)';
    
    // Скрываем через 4 секунды
    setTimeout(() => {
        notificationDiv.style.transform = 'translateX(150%)';
    }, 4000);
}

// Функция для сбора данных формы в URL-encoded формат
function serializeForm(form) {
    const formData = new FormData(form);
    const params = new URLSearchParams();
    
    // Сначала добавляем все обычные поля
    for (let [key, value] of formData.entries()) {
        // Пропускаем чекбоксы alcohol, обработаем их отдельно
        if (key === 'alcohol') {
            continue;
        }
        params.append(key, value);
    }
    
    // Обрабатываем чекбоксы алкоголя
    const alcoholCheckboxes = form.querySelectorAll('input[name="alcohol"]:checked');
    const alcoholValues = Array.from(alcoholCheckboxes).map(cb => {
        // Преобразуем значения в читаемый вид
        const valueMap = {
            'red_wine': 'Красное вино',
            'white_wine': 'Белое вино',
            'champagne': 'Шампанское',
            'non_alcoholic': 'Безалкогольные'
        };
        return valueMap[cb.value] || cb.value;
    });
    
    // Добавляем объединенное значение алкоголя
    if (alcoholValues.length > 0) {
        params.append('alcohol_combined', alcoholValues.join(', '));
    } else {
        params.append('alcohol_combined', 'Не указано');
    }
    
    return params;
}

// Функция валидации формы
function validateForm(form) {
    const name = document.getElementById('name')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const attendance = document.querySelector('input[name="attendance"]:checked');
    
    if (!name || name.length < 2) {
        showSimpleNotification('❌ Пожалуйста, введите имя и фамилию');
        return false;
    }
    
    if (!phone || phone.length < 5) {
        showSimpleNotification('❌ Пожалуйста, введите номер телефона');
        return false;
    }
    
    // Простая валидация телефона (можно улучшить)
    const phoneRegex = /^[\d\s\+\-\(\)]{5,}$/;
    if (!phoneRegex.test(phone)) {
        showSimpleNotification('❌ Пожалуйста, введите корректный номер телефона');
        return false;
    }
    
    if (!attendance) {
        showSimpleNotification('❌ Выберите вариант присутствия');
        return false;
    }
    
    return true;
}

// Функция отправки формы
async function submitForm(form) {
    try {
        // Валидация
        if (!validateForm(form)) {
            return;
        }
        
        // Показываем уведомление о отправке
        showSimpleNotification('⏳ Отправка данных...');
        
        // Собираем данные
        const params = serializeForm(form);
        
        // Отправляем данные
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Важно для работы с Google Apps Script
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });
        
        // При no-cors мы не можем прочитать ответ, поэтому показываем успех
        showSimpleNotification('✅ Спасибо! Ваш ответ отправлен.');
        
        // Очищаем форму
        form.reset();
        
        // Дополнительно: можно сохранить в localStorage для отладки
        saveToLocalStorage(params);
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showSimpleNotification('❌ Ошибка при отправке. Попробуйте позже.');
    }
}

// Функция для сохранения данных в localStorage (для отладки)
function saveToLocalStorage(params) {
    try {
        const submissions = JSON.parse(localStorage.getItem('wedding_submissions') || '[]');
        submissions.push({
            timestamp: new Date().toISOString(),
            data: Object.fromEntries(params)
        });
        // Храним только последние 10 записей
        if (submissions.length > 10) {
            submissions.shift();
        }
        localStorage.setItem('wedding_submissions', JSON.stringify(submissions));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// Инициализация формы
function initForm() {
    const form = document.getElementById('weddingForm');
    
    if (!form) return;
    
    // Добавляем маску для телефона (опционально)
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Простая маска для телефона
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 1) {
                    value = `+7 (${value}`;
                } else if (value.length <= 4) {
                    value = `+7 (${value.substring(1, 4)}`;
                } else if (value.length <= 7) {
                    value = `+7 (${value.substring(1, 4)}) ${value.substring(4, 7)}`;
                } else if (value.length <= 9) {
                    value = `+7 (${value.substring(1, 4)}) ${value.substring(4, 7)}-${value.substring(7, 9)}`;
                } else {
                    value = `+7 (${value.substring(1, 4)}) ${value.substring(4, 7)}-${value.substring(7, 9)}-${value.substring(9, 11)}`;
                }
                e.target.value = value;
            }
        });
    }
    
    // Обработчик отправки формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitForm(this);
    });
    
    // Добавляем обработчики для чекбоксов "Выбрать все" (опционально)
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length > 0) {
        const selectAllBtn = document.createElement('button');
        selectAllBtn.type = 'button';
        selectAllBtn.textContent = 'Выбрать все напитки';
        selectAllBtn.className = 'select-all-btn';
        selectAllBtn.style.cssText = `
            background: none;
            border: 1px solid #b7a18b;
            color: #6b4f3a;
            padding: 8px 15px;
            border-radius: 20px;
            margin-top: 10px;
            cursor: pointer;
            font-family: 'Cormorant Garamond', serif;
            font-size: 1rem;
            transition: all 0.3s ease;
        `;
        
        selectAllBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f5efe9';
        });
        
        selectAllBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
        
        selectAllBtn.addEventListener('click', function() {
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => {
                cb.checked = !allChecked;
            });
            this.textContent = allChecked ? 'Выбрать все напитки' : 'Снять все';
        });
        
        // Добавляем кнопку после группы чекбоксов
        const checkboxGroup = document.querySelector('.checkbox-group');
        if (checkboxGroup && !document.querySelector('.select-all-btn')) {
            checkboxGroup.parentNode.insertBefore(selectAllBtn, checkboxGroup.nextSibling);
        }
    }
}

// Предзагрузка изображений
window.addEventListener('load', function() {
    const images = ['7.webp', '1.jpg', '1.png'];
    images.forEach(img => {
        const image = new Image();
        image.src = img;
    });
    
    // Проверяем, есть ли сохраненные данные в localStorage (для отладки)
    const submissions = localStorage.getItem('wedding_submissions');
    if (submissions) {
        console.log('Previous submissions:', JSON.parse(submissions));
    }
});

// Обработка ошибок
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Экспортируем функции для отладки в консоль
window.debug = {
    showSubmissions: function() {
        const submissions = localStorage.getItem('wedding_submissions');
        console.log(submissions ? JSON.parse(submissions) : 'No submissions');
    },
    clearSubmissions: function() {
        localStorage.removeItem('wedding_submissions');
        console.log('Submissions cleared');
    },
    testNotification: function() {
        showSimpleNotification('✅ Тестовое уведомление');
    }
};
