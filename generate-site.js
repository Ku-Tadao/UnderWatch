const fs = require('fs').promises;
const axios = require('axios');

async function fetchData(endpoint) {
    try {
        const response = await axios.get(`https://overfast-api.tekrop.fr/${endpoint}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error.message);
        return null;
    }
}

async function generateHTML(data) {
    const heroesContent = `<div id="heroGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"></div>`;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OverFast API Website</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1, h2 { color: #333; }
            nav { margin-bottom: 20px; }
            nav a { margin-right: 15px; text-decoration: none; color: #1a73e8; }
            .content { margin-top: 20px; }
            .hidden { display: none; }
        </style>
    </head>
    <body>
        <h1 class="text-2xl font-bold mb-4">OverFast API Website</h1>
        <nav>
            <a href="#" onclick="showSection('heroes')">Heroes</a>
            <a href="#" onclick="showSection('roles')">Roles</a>
            <a href="#" onclick="showSection('gamemodes')">Gamemodes</a>
            <a href="#" onclick="showSection('maps')">Maps</a>
            <a href="#" onclick="showSection('players')">Players</a>
        </nav>
        <div id="heroes" class="content">${heroesContent}</div>
        <div id="roles" class="content hidden">Roles content here</div>
        <div id="gamemodes" class="content hidden">Gamemodes content here</div>
        <div id="maps" class="content hidden">Maps content here</div>
        <div id="players" class="content hidden">
            <h2>Player Search</h2>
            <input type="text" id="playerInput" placeholder="Enter player ID">
            <button onclick="searchPlayer()">Search</button>
            <div id="playerResult"></div>
        </div>
        <script>
        function showSection(sectionId) {
            document.querySelectorAll('.content').forEach(el => el.classList.add('hidden'));
            document.getElementById(sectionId).classList.remove('hidden');
            if (sectionId === 'heroes') {
                loadHeroes();
            }
        }

        async function loadHeroes() {
            const heroGrid = document.getElementById('heroGrid');
            heroGrid.innerHTML = 'Loading...';
            try {
                const response = await fetch('https://overfast-api.tekrop.fr/heroes');
                const heroes = await response.json();
                heroGrid.innerHTML = heroes.map(hero => \`
                    <div class="relative">
                        <img src="\${hero.portrait}" alt="\${hero.name}" class="w-full h-auto rounded-lg">
                        <div class="absolute bottom-0 right-0 bg-black bg-opacity-50 p-1 rounded-tl-lg">
                            \${getRoleIcon(hero.role)}
                        </div>
                        <div class="mt-2">
                            <h3 class="text-lg font-semibold">\${hero.name}</h3>
                        </div>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Error loading heroes:', error);
                heroGrid.innerHTML = 'Error loading heroes.';
            }
        }

        function getRoleIcon(role) {
            const icons = {
                tank: '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2.667l-10.667 5.333v6.667c0 6.147 4.56 11.893 10.667 13.333 6.107-1.44 10.667-7.186 10.667-13.333V8L16 2.667zm0 14.666V5.333l8 4v5.333c0 4.267-3.2 8.267-8 9.6V17.333z" fill="currentColor"/></svg>',
                damage: '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M24.267 13.733L16 8l-8.267 5.733L16 19.467l8.267-5.734zm-16.534 0L16 19.467l8.267-5.734L16 8l-8.267 5.733zm8.534 11.734l8.266-5.734L16 13.733l-8.267 5.733L16 25.467z" fill="currentColor"/></svg>',
                support: '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M22.667 14.667v-4h-4V6h-5.334v4.667h-4v4h4v4.666h5.334v-4.666h4zm-6.667 12c6.627 0 12-5.373 12-12s-5.373-12-12-12s-12 5.373-12 12s5.373 12 12 12z" fill="currentColor"/></svg>'
            };
            return icons[role.toLowerCase()] || '';
        }

        async function searchPlayer() {
            const playerId = document.getElementById('playerInput').value;
            const resultDiv = document.getElementById('playerResult');
            resultDiv.innerHTML = 'Searching...';

            try {
                const response = await fetch(\`https://overfast-api.tekrop.fr/players/\${playerId}\`);
                const player = await response.json();
                resultDiv.innerHTML = \`
                    <h3>\${player.username}</h3>
                    <p>Title: \${player.title || 'N/A'}</p>
                    <p>Endorsement Level: \${player.endorsement ? player.endorsement.level : 'N/A'}</p>
                \`;
            } catch (error) {
                resultDiv.innerHTML = 'Error: Player not found or an error occurred.';
            }
        }

        // Show heroes section by default
        showSection('heroes');
        </script>
    </body>
    </html>
    `;
}

async function main() {
    const html = await generateHTML();
    await fs.writeFile('index.html', html);
    console.log('index.html has been generated successfully.');
}

main().catch(console.error);