const key = "2d44f7929c694e258273a05231317948";

let currentPageUrl = `https://api.rawg.io/api/games?key=${key}`;
let nextPageUrl = null;
let prevPageUrl = null;

async function gameListFetch(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            console.log(data);

            // Display the game cards
            displayGameCards(data.results);

            // Update pagination URLs
            nextPageUrl = data.next;
            prevPageUrl = data.previous;

            // Update the pagination button states
            document.getElementById("next-btn").disabled = !nextPageUrl;
            document.getElementById("prev-btn").disabled = !prevPageUrl;

            // Show/hide the Previous button based on prevPageUrl
            document.getElementById("prev-btn").style.display = prevPageUrl ? 'inline-block' : 'none';
        } else {
            throw new Error(await response.text());
        }
    } catch (error) {
        console.log(error);
    }
}

function displayGameCards(games) {
    const gameGrid = document.querySelector('.game-grid');

    // Clear any existing cards before appending new ones
    gameGrid.innerHTML = '';

    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.classList.add('game-card');

        const gameTitle = document.createElement('h3');
        gameTitle.classList.add('game-title');
        gameTitle.textContent = game.name;
        gameCard.appendChild(gameTitle);

        const gameImage = document.createElement('img');
        gameImage.classList.add('game-img');
        gameImage.src = game.background_image || 'placeholder';
        gameImage.alt = `${game.name} image`;
        gameImage.loading = 'lazy';
        gameCard.appendChild(gameImage);

        const ratingElement = document.createElement('p');
        ratingElement.innerHTML = generateStarRating(game.rating, game.ratings_count);
        gameCard.appendChild(ratingElement);

        const releaseDate = document.createElement('p');
        releaseDate.textContent = `Release: ${game.released || 'Not available'}`;
        gameCard.appendChild(releaseDate);

        // Create an invisible element to store the game's ID
        const gameIdElement = document.createElement('span');
        gameIdElement.classList.add('game-id');
        gameIdElement.textContent = game.id;
        gameIdElement.style.display = 'none';
        gameCard.appendChild(gameIdElement);

        gameGrid.appendChild(gameCard);
    });
}

// Set up event listeners for the pagination buttons
document.getElementById("next-btn").addEventListener("click", () => {
    if (nextPageUrl) {
        gameListFetch(nextPageUrl);
    }
});

document.getElementById("prev-btn").addEventListener("click", () => {
    if (prevPageUrl) {
        gameListFetch(prevPageUrl);
    }
});

// Initially load the game list from the first page
gameListFetch(currentPageUrl);



async function featuredGameFetch() {
    try {
        // Fetch a list of games
        const response = await fetch(`https://api.rawg.io/api/games?key=${key}`);
        if (!response.ok) {
            throw new Error("Failed to fetch the games list.");
        }

        const data = await response.json();

        // Check if the results array exists and has items
        if (data.results && data.results.length > 0) {
            // Pick a random game ID
            const randomIndex = Math.floor(Math.random() * data.results.length);
            const randomGame = data.results[randomIndex];
            const id = randomGame.id;

            console.log(`Randomly selected Game ID: ${id}`);

            // Fetch the details of the selected game
            const featuredGameResponse = await fetch(`https://api.rawg.io/api/games/${id}?key=${key}`);
            if (!featuredGameResponse.ok) {
                throw new Error("Failed to fetch the featured game details.");
            }

            const featuredGameData = await featuredGameResponse.json();

            console.log("Featured Game Data:", featuredGameData);

            // Display the featured game (assumes displayFeaturedGame uses featuredGameData)
            displayFeaturedGame(featuredGameData);
        } else {
            console.error("No games found in the API response.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function generateStarRating(rating, ratingCount) {
    const fullStars = Math.floor(rating || 0);
    const halfStar = (rating || 0) % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - (fullStars + halfStar);

    let starHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starHTML += '★';
    }
    if (halfStar) {
        starHTML += '☆';
    }
    for (let i = 0; i < emptyStars; i++) {
        starHTML += '☆';
    }

    return `${starHTML} (${ratingCount || 0} ratings)`;
}

function displayFeaturedGame(GameObject) {
    const title = document.getElementById("title");
    const releaseDate = document.getElementById("release");
    const rating = document.getElementById("rating");
    const platforms = document.getElementById("platform");
    const description = document.getElementById("description");

    // Set the Title
    title.textContent = GameObject.name || "No title available";

    // Set the Release Date
    releaseDate.textContent = GameObject.released || "TBA";

    // Set the Rating using the generateStarRating function
    rating.innerHTML = generateStarRating(GameObject.rating, GameObject.ratings_count);

    // Set the Platforms
    platforms.textContent = GameObject.platforms
        ? GameObject.platforms.map((p) => p.platform.name).join(", ")
        : "N/A";

    // Set the Description with character limit and Show More/Show Less button
    const descriptionText = GameObject.description || "No description available.";
    const maxLength = 200; // Limit the description to 200 characters
    let displayDescription = descriptionText;
    
    // Clear previous content in the description element
    description.innerHTML = ''; 

    // Create a button to toggle between Show More and Show Less
    const toggleButton = document.createElement('button');
    toggleButton.classList.add('show-toggle-btn');
    toggleButton.textContent = 'Show More';

    // Check if the description is longer than the limit
    if (descriptionText.length > maxLength) {
        displayDescription = descriptionText.substring(0, maxLength) + '...';

        // Append truncated description and the Show More button
        description.innerHTML = displayDescription;
        description.appendChild(toggleButton);

        // Add click event to toggle between Show More and Show Less
        toggleButton.addEventListener('click', () => {
            if (toggleButton.textContent === 'Show More') {
                // Show full description and change button text to "Show Less"
                description.innerHTML = descriptionText;
                description.appendChild(toggleButton); // Keep the button
                toggleButton.textContent = 'Show Less';
            } else {
                // Show truncated description and change button text to "Show More"
                description.innerHTML = displayDescription;
                description.appendChild(toggleButton); // Keep the button
                toggleButton.textContent = 'Show More';
            }
        });
    } else {
        // If the description is not too long, display it fully
        description.innerHTML = displayDescription;
    }

    // Set the Featured Game Banner Image
    const featuredImage = document.getElementById("featured-game-banner");
    featuredImage.src = GameObject.background_image || "images/rivals.jpg"; // Default image if none provided
    featuredImage.alt = `Featured Game Banner: ${GameObject.name}`;
}


// Call the apiFetch function to fetch and display the data
gameListFetch();
featuredGameFetch();