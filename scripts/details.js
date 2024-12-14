const key = "2d44f7929c694e258273a05231317948";
let currentPageUrl = `https://api.rawg.io/api/games?key=${key}&page_size=1&page=1`; // Start with the first page of games

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
 * Format a date string into MM-DD-YYYY format.
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (01-12)
    const day = String(date.getDate()).padStart(2, '0'); // Get day (01-31)
    const year = date.getFullYear(); // Get full year (YYYY)
    return `${month}-${day}-${year}`;
}

/**
 * Generate a star rating string based on the rating value.
 * @param {number} rating - The numeric rating (0-5).
 * @param {number} ratingCount - The total number of ratings.
 * @returns {string} A string with stars and rating count.
 */
function generateStarRating(rating = 0, ratingCount = 0) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - (fullStars + halfStar);

    return `${'★'.repeat(fullStars)}${'☆'.repeat(halfStar)}${'☆'.repeat(emptyStars)} (${ratingCount} ratings)`;
}

/**
 * Truncate an array to a specified length and append an ellipsis if there are more items.
 * @param {Array} items - The array of items to truncate.
 * @param {number} limit - The maximum number of items to display.
 * @returns {string} A string of items, truncated if necessary, followed by "..." if more items exist.
 */
function truncateItems(items, limit) {
    if (!items || items.length === 0) return "Not available";
    const truncated = items.slice(0, limit);
    const displayText = truncated.join(", ");
    return items.length > limit ? `${displayText}...` : displayText;
}

/**
 * Display game details in the HTML.
 */
function displayGameDetails(gameData) {
    // Fill in the game title
    const gameTitleElement = document.getElementById("game-title");
    gameTitleElement.textContent = gameData.name || "Unknown Title"; // Use "Unknown Title" if no title is provided

    // Fill in the banner image
    const gameBanner = document.getElementById("game-banner");
    gameBanner.src = gameData.background_image || "placeholder"; // Use a default if no image

    // Add ESRB rating to details (before date released)
    const esrbRating = gameData.esrb_rating ? gameData.esrb_rating.name : "Not rated";
    document.getElementById("esrb-rating").textContent = esrbRating;

    // Fill in the game details
    document.getElementById("released").textContent = gameData.released ? formatDate(gameData.released) : "Not available";
    document.getElementById("publishers").textContent = gameData.publishers ? gameData.publishers.map(publisher => publisher.name).join(", ") : "Not available";
    
    // Generate and display the rating using the star system
    const rating = gameData.rating || 0;
    const ratingCount = gameData.ratings_count || 0;
    document.getElementById("rating").innerHTML = generateStarRating(rating, ratingCount);
    
    // Limit and display genres (max 5 items, with "..." if more)
    const genreText = truncateItems(gameData.genres ? gameData.genres.map(genre => genre.name) : [], 5);
    document.getElementById("genre").textContent = genreText;
    
    // Limit and display tags (max 5 items, with "..." if more)
    const tagText = truncateItems(gameData.tags ? gameData.tags.map(tag => tag.name) : [], 5);
    document.getElementById("tags").textContent = tagText;
    
    // Fill in the description (using innerHTML)
    const description = document.getElementById("description");
    description.innerHTML = gameData.description || "No description available";

    // Fill in the game website link
    const gameWebsiteLink = document.getElementById("game-website-link");
    gameWebsiteLink.href = gameData.website || "#";
    gameWebsiteLink.textContent = gameData.website ? "Visit Game Website" : "Website not available";

    // Handle platforms: Create a separate tile for each platform
    const platformsContainer = document.querySelector(".platforms");
    platformsContainer.innerHTML = ""; // Clear previous platforms (if any)

    if (gameData.platforms && gameData.platforms.length > 0) {
        gameData.platforms.forEach(platform => {
            const platformTile = document.createElement("div");
            platformTile.classList.add("platform-tile");
            platformTile.innerHTML = `<p>${platform.platform.name}</p>`;
            platformsContainer.appendChild(platformTile);
        });
    } else {
        platformsContainer.innerHTML = "<p>No platforms available</p>";
    }

    // Rotating gallery (you can add actual images if available)
    const rotatingGallery = document.querySelector(".rotating-gallery img");
    rotatingGallery.src = gameData.background_image || "placeholder";
}


/**
 * Fetch a random game and display its details.
 */
async function loadRandomGame() {
    const randomGameUrl = `https://api.rawg.io/api/games?key=${key}&page_size=1&page=${Math.floor(Math.random() * 10) + 1}`; // Random page number from 1 to 10
    const randomGameResponse = await fetch(randomGameUrl);
    const randomGameData = await randomGameResponse.json();
    
    if (randomGameData.results && randomGameData.results.length > 0) {
        const gameID = randomGameData.results[0].id;
        const currentPageUrl = `https://api.rawg.io/api/games/${gameID}?key=${key}`;
        fetchData(currentPageUrl, displayGameDetails);
    } else {
        alert("No random game found");
    }
}

/**
 * Perform a search based on the user's input and fetch the game details.
 */
async function searchGame() {
    const searchInput = document.getElementById("game-search").value.trim();
    const dropdown = document.getElementById("search-dropdown");

    if (searchInput) {
        const searchUrl = `https://api.rawg.io/api/games?key=${key}&page_size=5&search=${searchInput}`;
        const gameResponse = await fetch(searchUrl);
        const gameData = await gameResponse.json();

        // Clear previous suggestions
        dropdown.innerHTML = "";

        if (gameData.results && gameData.results.length > 0) {
            gameData.results.forEach(game => {
                const option = document.createElement("div");
                option.className = "dropdown-item";
                option.textContent = game.name;
                option.dataset.id = game.id; // Store game ID for later use
                option.addEventListener("click", () => {
                    const gameID = option.dataset.id;
                    const currentPageUrl = `https://api.rawg.io/api/games/${gameID}?key=${key}`;
                    fetchData(currentPageUrl, displayGameDetails);
                    dropdown.innerHTML = ""; // Clear dropdown after selection
                });
                dropdown.appendChild(option);
            });
        } else {
            // No results found
            const noResults = document.createElement("div");
            noResults.className = "dropdown-item no-results";
            noResults.textContent = "No games found";
            dropdown.appendChild(noResults);
        }

        // Show the dropdown
        dropdown.style.display = "block";
    } else {
        // Hide the dropdown if input is empty
        dropdown.style.display = "none";
    }
}

// Hide the dropdown if the user clicks outside
window.addEventListener("click", (event) => {
    const dropdown = document.getElementById("search-dropdown");
    if (!event.target.closest("#game-search-container")) {
        dropdown.style.display = "none";
    }
});

// Event listener for the search button
document.getElementById("search-button").addEventListener("click", searchGame);

// Event listener for Enter key in search input
document.getElementById("game-search").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        searchGame();
    }
});

// Load a random game when the page loads
window.onload = loadRandomGame;
