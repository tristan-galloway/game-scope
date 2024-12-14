const key = "2d44f7929c694e258273a05231317948";

const rawgURL = `https://api.rawg.io/api/games?key=${key}`

async function apiFetch(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            console.log(data);
        } else {
            throw Error(await response.text());
        }
    } catch (error) {
        console.log(error);
    }
};