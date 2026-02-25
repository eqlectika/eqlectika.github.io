if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Используем абсолютный путь от корня, чтобы скрипт работал из любой папки
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Распорядитель на месте:', reg.scope))
      .catch(err => console.log('Служба дала сбой:', err));
  });
}
