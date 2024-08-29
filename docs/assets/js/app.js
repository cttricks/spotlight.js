const Pages = [
    "installation",
    "quick-start-guide"
];

// Controller
document.addEventListener('DOMContentLoaded', () => {

    let currentPage = window.location.pathname.substring(19);
    currentPage = (currentPage.length < 1) ? 'installation' : currentPage;

    // Check if page is listed
    if (!Pages.includes(currentPage)) currentPage = '404';

    //ToDo - Handel clicks to load another page or open external links
    document.addEventListener('click', (e) => {

    });

});

async function loadPage(title, path){
    // ToDo
}