function getFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favoriteGames")) || [];
    console.log("Favorite Game IDs:", favorites);
    return favorites;
}
