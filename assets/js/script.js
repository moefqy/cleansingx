const themeToggle = document.getElementById('theme-toggle');
const icon = themeToggle.querySelector('i');

themeToggle.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme',
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    );
    icon.classList.toggle('fa-sun');
    icon.classList.toggle('fa-moon');
});