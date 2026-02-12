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
//    ПРОСТОЕ УВЕДОМЛЕНИЕ ПРИ НАЖАТИИ КНОПКИ
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
function showSimpleNotification() {
    notificationDiv.style.transform = 'translateX(0)';
    
    setTimeout(() => {
        notificationDiv.style.transform = 'translateX(150%)';
    }, 4000);
}

// Обработчик отправки формы
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('weddingForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Валидация
            const name = document.getElementById('name')?.value.trim();
            const phone = document.getElementById('phone')?.value.trim();
            const attendance = document.querySelector('input[name="attendance"]:checked');
            
            if (!name || !phone) {
                alert('Пожалуйста, заполните имя и телефон');
                return;
            }
            
            if (!attendance) {
                alert('Выберите вариант присутствия');
                return;
            }
            
            // ПОКАЗЫВАЕМ УВЕДОМЛЕНИЕ
            showSimpleNotification();
            
            // Сбрасываем форму
            form.reset();
            
            // Отправляем данные если нужно (но уведомление уже показано)
            try {
                const formData = new FormData(form);
                fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                }).catch(() => {});
            } catch (e) {}
        });
    }
});

// Предзагрузка изображений
window.addEventListener('load', function() {
    const images = ['7.webp', '1.jpg', '1.png'];
    images.forEach(img => {
        const image = new Image();
        image.src = img;
    });
});
