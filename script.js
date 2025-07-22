window.addEventListener('load', () => {
  new Masonry('.grid', {
    itemSelector: '.card',
    columnWidth: '.card',
    gutter: 20,
    percentPosition: true
  });
});
