function submitForm() {
    const groupID = document.getElementById('group_id').value;

    if (groupID < 0) {
        return;
    }

    if (groupID == "") {
        return;
    }

    localStorage.setItem('lastGroupId', groupID);

    let elementToDelete = document.getElementById('statistics-container');
    if (elementToDelete) {
        elementToDelete.parentNode.removeChild(elementToDelete);
    }
    elementToDelete = document.getElementById('individual-statistics-container');
    if (elementToDelete) {
        elementToDelete.parentNode.removeChild(elementToDelete);
    }

    const apiUrl = `https://ndevapi.com/group-games/${groupID}`;
    const gameApiUrl = `https://ndevapi.com/game-info/`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                alert(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const idArray = data.data.map(item => item.id);

            const combinedIds = idArray.join(',');

            const newRequestUrl = gameApiUrl + combinedIds;

            return fetch(newRequestUrl);
        })
        .then(response => {
            if (!response.ok) {
                alert(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const firstGame = data.data[0];

            const groupName = firstGame.creator.name;

            const combinedStatistics = {
                visits: 0,
                playing: 0,
                favoritedCount: 0,
                estimatedRevenue: 0,
            };

            let oldestGameCreatedDate = new Date();

            data.data.forEach(item => {
                combinedStatistics.visits += item.visits;
                combinedStatistics.playing += item.playing;
                combinedStatistics.favoritedCount += item.favoritedCount;
                combinedStatistics.estimatedRevenue += item.visits * 0.18;

                const createdDate = new Date(item.created);
                if (createdDate < oldestGameCreatedDate) {
                    oldestGameCreatedDate = createdDate;
                }
            });

            const today = new Date();
            const dayDifference = Math.ceil((today - oldestGameCreatedDate) / (1000 * 60 * 60 * 24));

            const estimatedDailyAverage = dayDifference > 0 ? combinedStatistics.estimatedRevenue / dayDifference : 0;

            const statisticsContainer = document.createElement("div");
            statisticsContainer.id = "statistics-container";

            const statisticsElement = document.createElement("div");

            statisticsElement.innerHTML = `
                <h2>${groupName}'s Statistics:</h2>
                <p>Visits: ${combinedStatistics.visits.toLocaleString()}</p>
                <p>Playing: ${combinedStatistics.playing.toLocaleString()}</p>
                <p>Favorited Count: ${combinedStatistics.favoritedCount.toLocaleString()}</p>
                <p>Estimated Revenue: R$ ${combinedStatistics.estimatedRevenue.toLocaleString()} | € ${((combinedStatistics.estimatedRevenue*0.003).toFixed(2))}</p>
                <p>Estimated Daily Average Revenue: R$ ${estimatedDailyAverage.toFixed(2)}  | € ${((estimatedDailyAverage*0.003).toFixed(2))}</p>
            `;

            statisticsContainer.appendChild(statisticsElement);
            document.body.appendChild(statisticsContainer);

            const individualStatisticsContainer = document.createElement("div");
            individualStatisticsContainer.id = "individual-statistics-container";

            data.data.forEach(item => {
                const individualStatisticsElement = document.createElement("div");
                const estimatedRevenue = item.visits * 0.18;
                individualStatisticsElement.innerHTML = `
                    <h2>${item.name} Statistics:</h2>
                    <p>Visits: ${item.visits.toLocaleString()}</p>
                    <p>Playing: ${item.playing.toLocaleString()}</p>
                    <p>Favorited Count: ${item.favoritedCount.toLocaleString()}</p>
                    <p>Estimated Revenue: R$ ${estimatedRevenue.toLocaleString()} | € ${((estimatedRevenue*0.003).toFixed(2)).toLocaleString()}</p>
                `;

                individualStatisticsContainer.appendChild(individualStatisticsElement);
            });

            document.body.appendChild(individualStatisticsContainer);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

const savedNumber = localStorage.getItem('lastGroupId');
const groupID = document.getElementById('group_id');
groupID.value = savedNumber