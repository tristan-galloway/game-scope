const key = "2d44f7929c694e258273a05231317948";
let currentPageUrl = `https://api.rawg.io/api/games?key=${key}`;
let nextPageUrl = null;
let prevPageUrl = null;

/**
 * Fetch data from the given API URL and handle the response.
 */
async function fetchData(url, callback) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(await response.text());

        const data = await response.json();
        callback(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

/**
 * Update the states of pagination buttons.
 */
function updatePaginationButtons() {
    const nextBtns = document.querySelectorAll(".pagination-btn[id^='next-btn']");
    const prevBtns = document.querySelectorAll(".pagination-btn[id^='prev-btn']");

    nextBtns.forEach(btn => btn.disabled = !nextPageUrl);
    prevBtns.forEach(btn => {
        btn.disabled = !prevPageUrl;
        btn.style.display = prevPageUrl ? "inline-block" : "none";
    });
}

/**
 * Display game cards in the grid.
 * @param {Array} games - List of games to display.
 */
function displayGameCards(games) {
    const gameGrid = document.querySelector('.game-grid');
    gameGrid.innerHTML = ''; // Clear existing cards

    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.classList.add('game-card');

        gameCard.innerHTML = `
            <img class="game-img" src="${game.background_image || 'placeholder'}" alt="${game.name} image" loading="lazy">
            <h3 class="game-title">${game.name}</h3>
            <p>${generateStarRating(game.rating, game.ratings_count)}</p>
            <p>Release: ${game.released || 'Not available'}</p>
        `;

        gameGrid.appendChild(gameCard);
    });
}

/**
 * Generate star rating HTML based on the rating and count.
 */
function generateStarRating(rating = 0, ratingCount = 0) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - (fullStars + halfStar);

    return `${'★'.repeat(fullStars)}${'☆'.repeat(halfStar)}${'☆'.repeat(emptyStars)} (${ratingCount} ratings)`;
}

/**
 * Fetch and display a list of games.
 */
function gameListFetch(url) {
    fetchData(url, data => {
        displayGameCards(data.results);
        nextPageUrl = data.next;
        prevPageUrl = data.previous;
        updatePaginationButtons();
    });
}

/**
 * Scroll to the top of the main container.
 */
function scrollToTop() {
    document.querySelector('main').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Set up event listeners for all pagination buttons.
 */
function setupPaginationListeners() {
    const nextBtns = document.querySelectorAll(".pagination-btn[id^='next-btn']");
    const prevBtns = document.querySelectorAll(".pagination-btn[id^='prev-btn']");

    nextBtns.forEach(btn => btn.addEventListener('click', () => {
        if (nextPageUrl) {
            gameListFetch(nextPageUrl);
            scrollToTop();
        }
    }));

    prevBtns.forEach(btn => btn.addEventListener('click', () => {
        if (prevPageUrl) {
            gameListFetch(prevPageUrl);
            scrollToTop();
        }
    }));
}

/**
 * Fetch and display the featured game.
 */
function featuredGameFetch() {
    fetchData(`https://api.rawg.io/api/games?key=${key}`, data => {
        if (!data.results || data.results.length === 0) {
            console.error("No games found in the API response.");
            return;
        }

        const randomGame = data.results[Math.floor(Math.random() * data.results.length)];
        fetchData(`https://api.rawg.io/api/games/${randomGame.id}?key=${key}`, displayFeaturedGame);
    });
}

/**
 * Display the featured game details.
 */
function displayFeaturedGame(game) {
    const title = document.getElementById("title");
    const releaseDate = document.getElementById("release");
    const rating = document.getElementById("rating");
    const platforms = document.getElementById("platform");
    const description = document.getElementById("description");
    const featuredImage = document.getElementById("featured-game-banner");

    title.textContent = game.name || "No title available";
    releaseDate.textContent = game.released || "TBA";
    rating.innerHTML = generateStarRating(game.rating, game.ratings_count);
    platforms.textContent = game.platforms ? game.platforms.map(p => p.platform.name).join(", ") : "N/A";

    const descriptionText = game.description || "No description available.";
    const maxLength = 200;

    function updateDescription(isExpanded) {
        description.innerHTML = isExpanded
            ? `${descriptionText} <button class="show-toggle-btn">Show Less</button>`
            : `${descriptionText.substring(0, maxLength)}... <button class="show-toggle-btn">Show More</button>`;
        
        const toggleButton = description.querySelector('.show-toggle-btn');
        toggleButton.addEventListener('click', () => updateDescription(!isExpanded));
    }

    updateDescription(false); // Initialize with collapsed description

    featuredImage.src = game.background_image || "images/rivals.jpg";
    featuredImage.alt = `Featured Game Banner: ${game.name}`;
}

// Initialize the app
featuredGameFetch();
gameListFetch(currentPageUrl);
setupPaginationListeners();