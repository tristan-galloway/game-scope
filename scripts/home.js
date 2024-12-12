const key = "2d44f7929c694e258273a05231317948";
const rawgURL = `https://api.rawg.io/api/games?key=${key}`;

async function apiFetch(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            displayGameCards(data.results);
        } else {
            throw Error(await response.text());
        }
    } catch (error) {
        console.log(error);
    }
}

function displayGameCards(games) {
    const gameGrid = document.querySelector('.game-grid');

    // Clear any existing cards before appending new ones
    gameGrid.innerHTML = '';

    // Loop through the results array and create a card for each game
    games.forEach(game => {
        // Create a new game card element
        const gameCard = document.createElement('div');
        gameCard.classList.add('game-card');

        // Create and append the game title (h3)
        const gameTitle = document.createElement('h3');
        gameTitle.classList.add('game-title')
        gameTitle.textContent = game.name; // Game name
        gameCard.appendChild(gameTitle);

        // Create and append the game image (img)
        const gameImage = document.createElement('img');
        gameImage.classList.add('game-img')
        gameImage.src = game.background_image || 'placeholder';
        gameImage.alt = `${game.name} image`;
        gameImage.loading = 'lazy'
        gameCard.appendChild(gameImage);

        // Create and append the game rating (p) with stars
        const ratingElement = document.createElement('p');
        const rating = game.rating || 0;
        const ratingCount = game.ratings_count || 0;
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - (fullStars + halfStar);

        // Generate the star system
        let starHTML = '';
        for (let i = 0; i < fullStars; i++) {
            starHTML += '★';
        }
        if (halfStar) {
            starHTML += '☆';
        }
        for (let i = 0; i < emptyStars; i++) {
            starHTML += '☆'; //
        }

        // Append the stars and the rating count in the same line
        ratingElement.innerHTML = `${starHTML} (${ratingCount} ratings)`;
        gameCard.appendChild(ratingElement);

        // Create and append the game release date (p)
        const releaseDate = document.createElement('p');
        releaseDate.textContent = `Release Date: ${game.released || 'Not available'}`;
        gameCard.appendChild(releaseDate);

        // Append the new game card to the game grid container
        gameGrid.appendChild(gameCard);
    });
}

// Call the apiFetch function to fetch and display the data
apiFetch(rawgURL);

getCurrentYear();
getLastModified();