const sizeIcon = document.querySelector('.size-icon');
const sizeContent = document.querySelector('.size-content');

sizeIcon.addEventListener('click', () => {
  sizeContent.classList.toggle('show');
});