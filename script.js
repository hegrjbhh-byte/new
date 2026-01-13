// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Константы для расчета стоимости
const BASE_PRICE = 150;
const ADDITIONAL_POINT_PRICE = 100;

// Список направлений за город с ценами
// Формат: { название: цена }
const OUT_CITY_LOCATIONS = {
    'Азовское': 1000,
    'Акимовка': 400,
    'Буревестник': 400,
    'Великоселье': 1300,
    'Владиславовка': 600,
    'Демьяновка': 400,
    'Дворовое': 800,
    'Двуречье': 400,
    'Дрофино': 800,
    'Емельяновка': 800,
    'Желябовка': 300,
    'Жемчужина': 800,
    'Заливное': 800,
    'Заречье': 400,
    'Зелёное': 200,
    'Зоркино': 700,
    'Ивановка': 400,
    'Изобильное': 1000,
    'Кировское': 400,
    'Коврово': 800,
    'Коренное': 600,
    'Косточковка': 700,
    'Кукурузное': 1000,
    'Кулики': 800,
    'Кунцево': 500,
    'Линейное': 300,
    'Лиственное': 400,
    'Ломоносовка': 400,
    'Луговое': 800,
    'Лужки': 700,
    'Любимовка': 1200,
    'Межевое': 500,
    'Митрофановка': 300,
    'Михайловка': 400,
    'Мускатное': 800,
    'Нижнегорский': 0, // Город - базовый тариф
    'Нежинское': 800,
    'Новогригорьевка': 500,
    'Новоивановка': 400,
    'Охотское': 600,
    'Пены': 900,
    'Плодовое': 200,
    'Приречное': 1000,
    'Пшеничное': 1300,
    'Разливы': 200,
    'Родники': 600,
    'Садовое': 700,
    'Семенное': 200,
    'Серое': 700,
    'Сливянка': 1500,
    'Степановка': 800,
    'Стрепетово': 900,
    'Тамбовка': 400,
    'Тарасовка': 600,
    'Уваровка': 300,
    'Уютное': 600,
    'Фрунзе': 800,
    'Цветущее': 600,
    'Червонное': 400,
    'Чкалово': 1000,
    'Широкое': 900,
    'Ястребки': 1000,
    'Яблонька': 200,
    'Советский': 1000,
    'Некрасовка': 1200,
    'Дмитровка': 1500,
    'Раздольное': 700,
    'Заветное': 1000,
    'Чапаевка': 1200,
    'Чернозёмное': 700,
    'Пруды': 1500,
    'Октябрьское': 1200,
    'Урожайное': 1500,
    'Алмазное': 600,
    'Варваровка': 1000
};

// Элементы DOM
const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const fromOutcitySelect = document.getElementById('from-outcity');
const toOutcitySelect = document.getElementById('to-outcity');
const addPointBtn = document.getElementById('add-point-btn');
const addOutcityPointBtn = document.getElementById('add-outcity-point-btn');
const additionalPointsContainer = document.getElementById('additional-points-container');
const outcityAdditionalPointsContainer = document.getElementById('outcity-additional-points-container');
const totalPriceElement = document.getElementById('total-price');
const orderBtn = document.getElementById('order-btn');
const routeCityBtn = document.getElementById('route-city');
const routeOutcityBtn = document.getElementById('route-outcity');
const cityForm = document.getElementById('city-form');
const outcityForm = document.getElementById('outcity-form');

// Массивы дополнительных точек
let additionalPoints = [];
let outcityAdditionalPoints = [];

// Текущий тип маршрута
let currentRouteType = 'city';

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initializeOutcitySelects();
    updateTotalPrice();
    setupEventListeners();
});

// Инициализация селектов для направлений за город
function initializeOutcitySelects() {
    // Заполняем селекты направлениями
    Object.keys(OUT_CITY_LOCATIONS).forEach(location => {
        const price = OUT_CITY_LOCATIONS[location];
        const optionFrom = document.createElement('option');
        optionFrom.value = location;
        optionFrom.textContent = `${location} (${price} ₽)`;
        fromOutcitySelect.appendChild(optionFrom);
        
        const optionTo = document.createElement('option');
        optionTo.value = location;
        optionTo.textContent = `${location} (${price} ₽)`;
        toOutcitySelect.appendChild(optionTo);
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Переключение типа маршрута
    routeCityBtn.addEventListener('click', () => switchRouteType('city'));
    routeOutcityBtn.addEventListener('click', () => switchRouteType('outcity'));
    
    // Обновление цены при изменении полей (по городу)
    fromInput.addEventListener('input', updateTotalPrice);
    toInput.addEventListener('input', updateTotalPrice);
    
    // Обновление цены при изменении селектов (за город)
    fromOutcitySelect.addEventListener('change', updateTotalPrice);
    toOutcitySelect.addEventListener('change', updateTotalPrice);
    
    // Кнопки добавления точек
    addPointBtn.addEventListener('click', addAdditionalPoint);
    addOutcityPointBtn.addEventListener('click', addOutcityAdditionalPoint);
    
    // Кнопка заказа
    orderBtn.addEventListener('click', handleOrder);
}

// Переключение типа маршрута
function switchRouteType(type) {
    currentRouteType = type;
    
    // Обновляем кнопки
    if (type === 'city') {
        routeCityBtn.classList.add('active');
        routeOutcityBtn.classList.remove('active');
        cityForm.style.display = 'block';
        outcityForm.style.display = 'none';
    } else {
        routeCityBtn.classList.remove('active');
        routeOutcityBtn.classList.add('active');
        cityForm.style.display = 'none';
        outcityForm.style.display = 'block';
    }
    
    // Очищаем поля при переключении
    if (type === 'city') {
        fromOutcitySelect.value = '';
        toOutcitySelect.value = '';
        clearOutcityAdditionalPoints();
    } else {
        fromInput.value = '';
        toInput.value = '';
        clearAdditionalPoints();
    }
    
    updateTotalPrice();
}

// Добавление дополнительной точки
function addAdditionalPoint() {
    const pointIndex = additionalPoints.length;
    const pointId = `point-${pointIndex}`;
    
    // Создаем элемент точки
    const pointDiv = document.createElement('div');
    pointDiv.className = 'additional-point';
    pointDiv.id = pointId;
    
    pointDiv.innerHTML = `
        <div class="input-group">
            <label for="${pointId}-input">Дополнительная точка ${pointIndex + 1}</label>
            <input 
                type="text" 
                id="${pointId}-input" 
                placeholder="Введите адрес дополнительной точки" 
                required
            >
            <button type="button" class="remove-point-btn" onclick="removePoint('${pointId}')">×</button>
        </div>
    `;
    
    additionalPointsContainer.appendChild(pointDiv);
    additionalPoints.push({
        id: pointId,
        value: ''
    });
    
    // Добавляем обработчик изменения для новой точки
    const input = document.getElementById(`${pointId}-input`);
    input.addEventListener('input', (e) => {
        const point = additionalPoints.find(p => p.id === pointId);
        if (point) {
            point.value = e.target.value;
        }
        updateTotalPrice();
    });
    
    updateTotalPrice();
}

// Удаление дополнительной точки
function removePoint(pointId) {
    const pointElement = document.getElementById(pointId);
    if (pointElement) {
        pointElement.remove();
        additionalPoints = additionalPoints.filter(p => p.id !== pointId);
        // Перенумеровываем оставшиеся точки
        renumberPoints();
        updateTotalPrice();
    }
}

// Перенумерация точек после удаления
function renumberPoints() {
    const pointElements = additionalPointsContainer.querySelectorAll('.additional-point');
    pointElements.forEach((element, index) => {
        const label = element.querySelector('label');
        if (label) {
            label.textContent = `Дополнительная точка ${index + 1}`;
        }
    });
}

// Очистка дополнительных точек по городу
function clearAdditionalPoints() {
    additionalPointsContainer.innerHTML = '';
    additionalPoints = [];
}

// Очистка дополнительных точек за город
function clearOutcityAdditionalPoints() {
    outcityAdditionalPointsContainer.innerHTML = '';
    outcityAdditionalPoints = [];
}

// Добавление дополнительной точки за город (точка по городу)
function addOutcityAdditionalPoint() {
    const pointIndex = outcityAdditionalPoints.length;
    const pointId = `outcity-point-${pointIndex}`;
    
    // Создаем элемент точки
    const pointDiv = document.createElement('div');
    pointDiv.className = 'additional-point';
    pointDiv.id = pointId;
    
    pointDiv.innerHTML = `
        <div class="input-group">
            <label for="${pointId}-input">Точка по городу ${pointIndex + 1}</label>
            <input 
                type="text" 
                id="${pointId}-input" 
                placeholder="Введите адрес точки по городу" 
                required
            >
            <button type="button" class="remove-point-btn" onclick="removeOutcityPoint('${pointId}')">×</button>
        </div>
    `;
    
    outcityAdditionalPointsContainer.appendChild(pointDiv);
    outcityAdditionalPoints.push({
        id: pointId,
        value: ''
    });
    
    // Добавляем обработчик изменения для новой точки
    const input = document.getElementById(`${pointId}-input`);
    input.addEventListener('input', (e) => {
        const point = outcityAdditionalPoints.find(p => p.id === pointId);
        if (point) {
            point.value = e.target.value;
        }
        updateTotalPrice();
    });
    
    updateTotalPrice();
}

// Удаление дополнительной точки за город
function removeOutcityPoint(pointId) {
    const pointElement = document.getElementById(pointId);
    if (pointElement) {
        pointElement.remove();
        outcityAdditionalPoints = outcityAdditionalPoints.filter(p => p.id !== pointId);
        renumberOutcityPoints();
        updateTotalPrice();
    }
}

// Перенумерация точек за город после удаления
function renumberOutcityPoints() {
    const pointElements = outcityAdditionalPointsContainer.querySelectorAll('.additional-point');
    pointElements.forEach((element, index) => {
        const label = element.querySelector('label');
        if (label) {
            label.textContent = `Точка по городу ${index + 1}`;
        }
    });
}

// Расчет общей стоимости
function calculateTotalPrice() {
    let total = 0;
    
    if (currentRouteType === 'city') {
        // Заказ по городу
        if (fromInput.value.trim() && toInput.value.trim()) {
            total = BASE_PRICE;
            total += additionalPoints.length * ADDITIONAL_POINT_PRICE;
        }
    } else {
        // Заказ за город
        const fromLocation = fromOutcitySelect.value;
        const toLocation = toOutcitySelect.value;
        
        if (fromLocation && toLocation) {
            // Если с одного села в другое - прибавляются две цены
            if (fromLocation !== toLocation) {
                const fromPrice = OUT_CITY_LOCATIONS[fromLocation] || 0;
                const toPrice = OUT_CITY_LOCATIONS[toLocation] || 0;
                total = fromPrice + toPrice;
            } else {
                // Если одно и то же место - одна цена
                total = OUT_CITY_LOCATIONS[fromLocation] || 0;
            }
            
            // Добавляем стоимость точек по городу (если есть)
            total += outcityAdditionalPoints.length * ADDITIONAL_POINT_PRICE;
        }
    }
    
    return total;
}

// Обновление отображения цены
function updateTotalPrice() {
    const total = calculateTotalPrice();
    totalPriceElement.textContent = `${total} ₽`;
    
    // Проверяем, можно ли отправить заказ
    let canOrder = false;
    
    if (currentRouteType === 'city') {
        canOrder = fromInput.value.trim() && toInput.value.trim();
    } else {
        canOrder = fromOutcitySelect.value && toOutcitySelect.value;
    }
    
    orderBtn.disabled = !canOrder;
}

// Обработка заказа
function handleOrder() {
    let orderData = {};
    
    if (currentRouteType === 'city') {
        // Валидация полей для заказа по городу
        const from = fromInput.value.trim();
        const to = toInput.value.trim();
        
        if (!from || !to) {
            tg.showAlert('Пожалуйста, заполните поля "Откуда" и "Куда"');
            return;
        }
        
        // Собираем данные заказа по городу
        orderData = {
            route_type: 'city',
            from: from,
            to: to,
            additional_points: additionalPoints
                .map(point => {
                    const input = document.getElementById(`${point.id}-input`);
                    return input ? input.value.trim() : '';
                })
                .filter(point => point !== ''),
            total_price: calculateTotalPrice()
        };
    } else {
        // Валидация полей для заказа за город
        const fromLocation = fromOutcitySelect.value;
        const toLocation = toOutcitySelect.value;
        
        if (!fromLocation || !toLocation) {
            tg.showAlert('Пожалуйста, выберите пункты отправления и назначения');
            return;
        }
        
        // Собираем данные заказа за город
        orderData = {
            route_type: 'outcity',
            from: fromLocation,
            to: toLocation,
            from_price: OUT_CITY_LOCATIONS[fromLocation] || 0,
            to_price: OUT_CITY_LOCATIONS[toLocation] || 0,
            city_points: outcityAdditionalPoints
                .map(point => {
                    const input = document.getElementById(`${point.id}-input`);
                    return input ? input.value.trim() : '';
                })
                .filter(point => point !== ''),
            total_price: calculateTotalPrice()
        };
    }
    
    // Отправляем данные в бот
    try {
        tg.sendData(JSON.stringify(orderData));
        
        // Закрываем Mini App
        tg.close();
    } catch (error) {
        console.error('Ошибка отправки данных:', error);
        tg.showAlert('Произошла ошибка при отправке заказа. Попробуйте еще раз.');
    }
}

// Предотвращение масштабирования при двойном тапе
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Предотвращение скроллинга на body
document.body.addEventListener('touchmove', (e) => {
    // Разрешаем скроллинг только внутри формы
    const formSection = document.querySelector('.form-section');
    if (!formSection.contains(e.target)) {
        e.preventDefault();
    }
}, { passive: false });
