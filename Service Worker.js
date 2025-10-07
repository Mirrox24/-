// Название для нашего кеша
const CACHE_NAME = 'sberenok-cache-v1';

// Список файлов, которые нужно кешировать при первой установке
const urlsToCache = [
  './сберенок2.txt', 
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0/dist/chartjs-plugin-datalabels.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
  // Обратите внимание: ресурсы Firebase и Gemini API не кешируются, 
  // так как они должны быть актуальными (Network First, или только Network).
];

// Установка (Install) - Кешируем основные ресурсы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Кеширование основных ресурсов.');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[ServiceWorker] Ошибка кеширования при установке:', err);
      })
  );
});

// Активация (Activate) - Удаляем старые кеши
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[ServiceWorker] Удаление старого кеша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch - Стратегия "Сначала кеш, затем сеть" для статических ресурсов
self.addEventListener('fetch', (event) => {
  // Игнорируем запросы к сторонним API (Firebase, Gemini) - всегда идем в сеть
  if (
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('gstatic.com') ||
    event.request.url.includes('firebasejs') ||
    event.request.url.includes('placehold.co')
  ) {
    return; // Пропускаем эти запросы мимо Service Worker
  }
    
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если ресурс есть в кеше, отдаем его
        if (response) {
          return response;
        }
        // Если нет, идем в сеть
        return fetch(event.request);
      })
  );
});
