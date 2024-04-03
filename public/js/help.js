const helpIcon = document.querySelector('.help-icon');
const helpContent = document.querySelector('.help-content');

helpIcon.addEventListener('click', () => {
    helpContent.classList.toggle('show');
});