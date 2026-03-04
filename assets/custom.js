document.addEventListener('DOMContentLoaded', function () {
  // Subcategory Accordion Logic
  const subToggles = document.querySelectorAll('.category-item__toggle');
  if (subToggles.length > 0) {
    subToggles.forEach(button => {
      button.addEventListener('click', () => {
        const parentItem = button.closest('.category-item');
        const subList = parentItem.querySelector('.subcategory-list');

        // 他のアコーディオンを閉じたい場合はここでループ処理を入れる

        const isOpen = parentItem.classList.toggle('is-open');
        button.setAttribute('aria-expanded', isOpen);

        if (isOpen) {
          // 中身の実際の高さを取得してセット
          subList.style.height = subList.scrollHeight + 'px';
        } else {
          // 高さを0に戻す
          subList.style.height = '0';
        }
      });
    });
  }

  // Top-level Category Accordion Logic
  const accordion = document.querySelector('.category-accordion');
  if (accordion) {
    const header = accordion.querySelector('.category-accordion__header');
    const content = accordion.querySelector('.category-accordion__content');

    if (header && content) {
      header.addEventListener('click', function () {
        const isOpen = accordion.classList.toggle('is-open');

        if (isOpen) {
          content.style.height = content.scrollHeight + 'px';
          // After transition ends, set to auto to allow inner content expansion
          content.addEventListener('transitionend', function handler() {
            if (accordion.classList.contains('is-open')) {
              content.style.height = 'auto';
            }
            content.removeEventListener('transitionend', handler);
          }, { once: true });
        } else {
          // Before closing, set to pixel height so it can transition from auto
          content.style.height = content.scrollHeight + 'px';
          // Force layout reflow
          content.offsetHeight;
          content.style.height = '0';
        }
      });
    }
  }
});
