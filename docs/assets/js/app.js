const Pages = [
    "installation",
    "quick-start-guide"
];

/*
*
* MD Converter by showdown
* GitHub https://github.com/showdownjs/showdown
* CDN unpkg.com
*
*/
var converter = new showdown.Converter();

// Controller
document.addEventListener('DOMContentLoaded', async () => {

    // Load Sidebar
    await composeSideBar();

    // Load page on start
    let currentPage = window.location.hash.substring(1);
    currentPage = (currentPage.length < 1) ? Pages[0] : currentPage;

    await loadPage(currentPage);

    // Handel clicks to load another page or open external links
    document.addEventListener('click', (e) => {

        // Catch target element
        let elm = e.target;

        // Skip if there is no link attribute available, 
        if(!elm.getAttribute('type')) return;
        if(elm.getAttribute('type') !== 'link') return;

        // Prevent default behavior
        e.preventDefault();

        // Goto given page
        loadPage(elm.getAttribute('href'));
    });

});

async function getTitleFromPath(path){
    path = path.split('-').join(' ');
    return `${path.substring(0,1).toUpperCase()}${path.substring(1)}`;
}

async function loadPage(path){

    // Check if page is listed
    if (!Pages.includes(path)) path = '404';

    // Push history - Ignore if current URL is same
    if(path !== '404') history.replaceState(null, '', `#${path}`);

    // Set page title
    document.title = `${await getTitleFromPath(path)} - Spotlight.js`;;

    // Get Content
    let content = await getPageContent(path);
    if(content === 'NOT_FOUND') content = await getPageContent('404');
    document.querySelector('article').innerHTML = converter.makeHtml(content);

    // Set active sidebar item
    await setActiveClass(path);
    
}

async function getPageContent(path) {
    return new Promise(async (resolve, reject) => {
        try {
            let content = '';
            fetch(`./pages/${path}.md`, {
                method: 'GET'
            }).then(response => {
                return (!response.ok) ? 'NOT_FOUND' : response.text();
            }).then(text => {
                content = text
            }).catch(error => {
                content `Fatal Error: ${error}`;
            }).finally(() => resolve(content));
        } catch (error) {
            reject(error);  // Reject the promise if an error occurs
        }
    });
}

async function pageNotFound(path){
    document.querySelector('article').innerHTML = 'Page Not Found!';
}

async function composeSideBar() {
    return new Promise(async (resolve, reject) => {
        try {
            let sideBarContainer = document.querySelector('aside ul');
            sideBarContainer.innerHTML = '';

            for (let item of Pages) {
                let li = document.createElement('li');
                li.classList.add('nav-item', 'me-2', 'fw-normal');

                let a = document.createElement('a');
                a.href = item;
                a.innerHTML = await getTitleFromPath(item);
                a.setAttribute('type', 'link');
                a.classList.add('nav-link');

                li.appendChild(a);
                sideBarContainer.appendChild(li);
            }

            resolve();  // Resolve the promise after the loop is done
        } catch (error) {
            reject(error);  // Reject the promise if an error occurs
        }
    });
}

async function setActiveClass(path){

    document.querySelectorAll('aside ul li a').forEach(item => {
        item.classList.remove('active');
        if(item.getAttribute('href') === path) item.classList.add('active');
    });

}