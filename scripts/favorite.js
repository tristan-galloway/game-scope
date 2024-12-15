const key = "2d44f7929c694e258273a05231317948";
let gameToRemoveId = null; // Store the ID of the game to be removed

// Function to display favorite games
async function displayFavoriteGames() {
    const favorites = getFavorites(); // Get the favorite games from localStorage
    const favoritesMain = document.getElementById('favorites-main'); // Main container for the favorite games

    // Clear the current content of the container
    favoritesMain.innerHTML = "";

    if (favorites.length === 0) {
        favoritesMain.innerHTML = "<p>No favorite games found.</p>";
    } else {
        // Loop through each favorite game ID and fetch game details
        for (const gameId of favorites) {
            const url = `https://api.rawg.io/api/games/${gameId}?key=${key}`;
            await fetchData(url, (gameData) => {
                // Create the game card
                const gameCard = document.createElement('div');
                gameCard.classList.add('favorite-game-container');

                // Create the game name
                const gameName = document.createElement('h2');
                gameName.classList.add('game-name');
                gameName.textContent = gameData.name || "Loading..."; // Set a fallback text if name is missing

                // Create the game image
                const gameImg = document.createElement('img');
                gameImg.classList.add('game-img');
                gameImg.src = gameData.background_image || ''; // Fallback to an empty string if image is missing
                gameImg.alt = gameData.name || 'Game image'; // Fallback alt text

                // Create the "Learn More" link or fallback text if no website is provided
                const gameSite = document.createElement('a');
                gameSite.classList.add('game-site');
                if (gameData.website) {
                    gameSite.href = gameData.website;
                    gameSite.textContent = 'Learn More';
                } else {
                    gameSite.textContent = 'Website not available';
                    gameSite.style.backgroundColor = 'gray'; // Optional: style to indicate no website
                }

                // Create the remove button (previously the favorite button)
                const removeButton = document.createElement('button');
                removeButton.id = `remove-button-${gameData.id}`;
                removeButton.classList.add('favorite-button');
                removeButton.textContent = 'Remove from Favorites';

                // Append all elements to the card
                gameCard.appendChild(gameName);
                gameCard.appendChild(gameImg);
                gameCard.appendChild(gameSite);
                gameCard.appendChild(removeButton);

                // Append the game card to the container
                favoritesMain.appendChild(gameCard);

                // Attach event listener to remove button
                removeButton.addEventListener('click', () => {
                    // Set the game ID to be removed
                    gameToRemoveId = gameData.id;

                    // Show the confirmation modal
                    document.getElementById('confirmation-modal').style.display = 'flex';
                });
            });
        }
    }
}


// Function to fetch data from the rawg API
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

// Get favorites from localStorage
function getFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favoriteGames")) || [];
    console.log("Favorite Game IDs:", favorites);
    return favorites;
}

// Remove game from favorites and reload the cards
function removeFavoriteGame() {
    let favorites = getFavorites();
    favorites = favorites.filter((id) => id !== gameToRemoveId); // Remove the game ID

    // Save the updated favorites to localStorage
    localStorage.setItem("favoriteGames", JSON.stringify(favorites));

    // Reload the favorite games
    displayFavoriteGames();

    // Hide the confirmation modal
    document.getElementById('confirmation-modal').style.display = 'none';
}

// Close the confirmation modal if the user cancels
document.getElementById('cancel-remove').addEventListener('click', () => {
    document.getElementById('confirmation-modal').style.display = 'none';
});

// Confirm removal when the user clicks "Yes"
document.getElementById('confirm-remove').addEventListener('click', removeFavoriteGame);

// Call the function to display the favorite games when the page loads
displayFavoriteGames();