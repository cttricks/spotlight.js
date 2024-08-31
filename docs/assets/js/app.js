const Pages = [
    "installation",
    "quick-start-guide",
    "api-reference"
];

/*
*
* MD Converter by showdown
* GitHub https://github.com/showdownjs/showdown
* CDN unpkg.com
*
*/
var converter = new showdown.Converter();
const contributionContainer = document.querySelector('div.contribution');
const paginationContainer = document.querySelector('div.pagination');

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
    path = path.split('api').join('API');
    return `${path.substring(0,1).toUpperCase()}${path.substring(1)}`;
}

async function loadPage(path){

    // Check if page is listed
    if (!Pages.includes(path)) path = '404';

    // Push history - Ignore if current URL is same
    if(path !== '404') history.replaceState(null, '', `#${path}`);

    // Set page title
    document.title = `${await getTitleFromPath(path)} - Spotlight.js`;
    contributionContainer.style.display = 'none';
    paginationContainer.parentElement.style.display = 'none';

    // Get Content
    let content = await getPageContent(path);
    if(content === 'NOT_FOUND') content = await getPageContent('404');
    document.querySelector('main').innerHTML = converter.makeHtml(content);
    document.getElementById('currentState').innerHTML = (path === '404') ? 'Oops! Article Not Found' : `<span class="badge-path">docs&nbsp;&nbsp;&bull;&nbsp;&nbsp;pages&nbsp;&nbsp;&bull;&nbsp;&nbsp;${path}</span>`;

    // Set active sidebar item
    await setActiveClass(path);

    // Stop here if it's a non existing route
    if(path === '404') return;

    // Format the codes elements
    formatCodeElements();

    // Set Footer
    setFooter(path);

    // Set Pagination
    pagination(path);
    
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
    document.querySelector('main').innerHTML = 'Page Not Found!';
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

async function formatCodeElements() {
    // Get all <code> elements
    const codeElements = document.querySelectorAll('main code');

    codeElements.forEach((codeElement) => {
        // Get the language class (like language-html)
        const languageClass = codeElement.className.match(/language-\w+/);

        if (languageClass) {
            // Extract language name from class
            const language = languageClass[0].split('-')[1];

            // Decode HTML entities to convert back to code
            const codeContent = codeElement.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

            // Format the code using Prism.js or highlight.js
            if (window.Prism) {
                // Prism.js
                const formattedCode = Prism.highlight(codeContent, Prism.languages[language], language);
                codeElement.innerHTML = formattedCode;
            }
        }
    });
}

async function setFooter(path) {

    fetch(`https://api.github.com/repos/cttricks/spotlight.js/commits?path=docs/pages/${path}.md`, {
        headers: {
            'Accept': 'application/vnd.github.v3+json'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    }).then(commits => {
        if (commits.length > 0) {
            const lastCommit = commits[0];

            let [date, contributor] = contributionContainer.querySelectorAll('div.text-end div');
            date.innerHTML = new Date(lastCommit.commit.author.date).toLocaleString();
            contributor.innerHTML = lastCommit.commit.committer.name;
            contributionContainer.querySelector('a').href = `https://github.com/cttricks/spotlight.js/blob/master/docs/pages/${path}.md`;
            contributionContainer.style.display = 'block';
        }
    }).catch(error => {
        console.error('Error fetching data. Please check the console for details.', error);
    });
}

async function pagination(path){
    
    let itemIndex = Pages.indexOf(path);
    let items = paginationContainer.querySelectorAll('div.col');

    items[0].innerHTML = (itemIndex < 1) ? '' : `<div class="fs-7"><span class="arrow left"></span>Previous</div><a class="fw-semibold lh-lg nav-link" href="${Pages[(itemIndex -1)]}" type="link" >${await getTitleFromPath(Pages[(itemIndex -1)])}</a>`;

    items[1].innerHTML = ((itemIndex +1) >= Pages.length) ? '' : `<div class="fs-7">Next<span class="arrow right"></span></div><a class="fw-semibold lh-lg nav-link" href="${Pages[(itemIndex +1)]}" type="link" >${await getTitleFromPath(Pages[(itemIndex +1)])}</a>`;

    paginationContainer.parentElement.style.display = 'block';
}