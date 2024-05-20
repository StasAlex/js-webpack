import $ from 'jquery';
import "./scss/index.scss";
async function fetchDataFromGoogleSheets() {
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbwOz0pRAqb9bTXvXq_KS-oEKXdNajPKcpGeSz6t0lqx5CnvTKxRLTt9NXLzgWsG8qZgcw/exec");

        return await response.json()
    } catch (error) {
        console.error('Error retrieving data from Google Sheets:', error);
        return null;
    }
}
function createCard(container, product) {
    const card = document.createElement('div');
    card.classList.add('card');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const title = document.createElement('h5');
    title.classList.add('card-title');
    title.textContent = product.title;
    cardBody.appendChild(title);

    const description = document.createElement('p');
    description.classList.add('card-text');
    description.textContent = product.description;
    cardBody.appendChild(description);

    const category = document.createElement('p');
    category.classList.add('card-category');
    category.textContent = 'Category: ' + product.category;
    cardBody.appendChild(category);

    const origin = document.createElement('p');
    origin.classList.add('card-text');
    origin.textContent = 'Origin: ' + product.Origin;
    cardBody.appendChild(origin);

    const rating = document.createElement('p');
    rating.classList.add('card-text');
    rating.textContent = 'Rating: ' + product.rating;
    cardBody.appendChild(rating);

    card.appendChild(cardBody);

    container.appendChild(card);
}
function createSection(container, product) {
    const card = document.createElement('div');
    card.classList.add('card');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const title = document.createElement('h5');
    title.classList.add('card-title');
    title.textContent = product;
    cardBody.appendChild(title);

    card.appendChild(cardBody);

    container.appendChild(card);
}
function addSection(root, sectionData) {
    const section = document.createElement('section');
    const headerClassName = sectionData.header.replace(/ /g, '-').toLowerCase(); // replace spaces with dashes
    if(headerClassName.length) {
        section.classList.add(headerClassName);
    }

    const container = document.createElement('div');
    container.classList.add('container');
    section.appendChild(container);

    const row = document.createElement('div');
    row.classList.add('row');
    container.appendChild(row);

    const heading = document.createElement('h2');
    heading.textContent = sectionData.header;
    row.appendChild(heading);

    const dataContainer = document.createElement('div');
    dataContainer.classList.add('data-container');

    if(typeof sectionData.data === 'object' && sectionData.data[0].hasOwnProperty('title')) {
        sectionData.data.forEach(item => {
            createCard(dataContainer, item)
        });
    } else if(typeof sectionData.data === 'object' && !sectionData.data[0].hasOwnProperty('title')) {
        sectionData.data.forEach(item => {
            createSection(dataContainer, item)
        });
    }

    row.appendChild(dataContainer);
    document.getElementById('root').appendChild(section);
}
function genCharArray(charA, charZ) {
    var a = [], i = charA.charCodeAt(0), j = charZ.charCodeAt(0);
    for (; i <= j; ++i) {
        a.push(String.fromCharCode(i).toUpperCase());
    }
    return a;
}
function clearFilterAdd(section) {
    const clearButton = document.createElement('span');
    clearButton.classList.add('clear-filter');
    clearButton.textContent = 'Clear all x';
    section.find('.row').append(clearButton);
    $(clearButton).on('click', function () {
        $('.products .card').each((index, product) => {
            $(product).removeClass('hide')
        });
        $(this).remove();
    })
}
function addSpinner() {
    const spinner = document.createElement('div');
    spinner.id = 'spinner';
    spinner.innerHTML = `<div class="spinner-inner"></div>`;
    const root = document.getElementById('root');
    root.appendChild(spinner);

    return spinner;
}
function  onClearButtonCreate(section) {
    const clearButton = $('.clear-filter');
    if(!clearButton.length) {
        clearFilterAdd($(section));
    } else {
        clearButton.remove();
        clearFilterAdd($(section));
    }
}
async function init() {
    addSpinner();
    const products = await fetchDataFromGoogleSheets();
    const categories = await products.map(product =>  {
        return product.category.split(',').map(category => category.trim().toUpperCase());
    })
    const nonRepeatingCategories = [...new Set(categories.flat())];

    addSection('header', {
        header: 'Skincare Ingredients'
    })
    addSection('category', {
        header: 'Categories',
        data: nonRepeatingCategories
    });
    addSection('filter', {
        header: 'Filter',
        data: genCharArray('a', 'z')
    });
    addSection('products', {
        header: 'Products',
        data: products
    });

    $('#spinner').hide();

    const productCards = $('.products .card');
    const filterCards = $('.filter .card');

    filterCards.each((index, filterCard) => {
        let letter = $(filterCard).find('.card-title').text().trim();
        let hasMatchingProduct = false;

        productCards.each((index, productCard) => {
            if ($(productCard).text().trim().charAt(0).toUpperCase() === letter) {
                hasMatchingProduct = true;
                return false;
            }
        });

        if (!hasMatchingProduct) {
            $(filterCard).addClass('disabled');
        }
    });

    $('.categories .card-title').on('click', function() {
        const clickedCat = $(this).text().toLowerCase();
        productCards.each((index, product) => {
            $(product).removeClass('hide')
        });
        productCards.each((index, product) => {
            let category = $(product).find('.card-category').text().split(':').slice(1)[0].toLowerCase();
            if(!category.includes(clickedCat)) {
                $(product).addClass('hide')
            }
        });

        onClearButtonCreate('.categories')
    })

    $('.filter .card-title').on('click', function() {
        const clickedLetter = $(this).text().toLowerCase();
        productCards.each((index, product) => {
            $(product).removeClass('hide')
        });
        productCards.each((index, product) => {
            let productFirstLetter = $(product).find('.card-title').text().charAt(0).toLowerCase();
            if(productFirstLetter !== clickedLetter) {
                $(product).addClass('hide')
            }
        });

        onClearButtonCreate('.filter')
    })
}
init();
