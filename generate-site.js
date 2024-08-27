const fs = require('fs').promises;
const axios = require('axios');
const path = require('path');

const API_BASE_URL = 'https://overfast-api.tekrop.fr';

async function fetchData(endpoint) {
    try {
        const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error.message);
        return null;
    }
}

async function generateHTML() {
    const heroes = await fetchData('heroes');
    const roles = await fetchData('roles');
    const gamemodes = await fetchData('gamemodes');
    const maps = await fetchData('maps');

    const heroesContent = generateHeroesContent(heroes);
    const rolesContent = generateRolesContent(roles);
    const gamemodesContent = generateGamemodesContent(gamemodes);
    const mapsContent = generateMapsContent(maps);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UnderWatch</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            :root {
                --background-color: #EEF1EF;
                --text-color: #1C2321;
                --link-color: #5E6572;
                --modal-background: #A9B4C2;
                --modal-text-color: #1C2321;
                --hero-box-background: #7D98A1;
                --hero-box-text-color: #EEF1EF;
                --ability-box-background: #7D98A1;
                --ability-box-text-color: #EEF1EF;
                --nav-background-color: #5E6572;
                --nav-link-color: #EEF1EF;
            }

            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                padding: 20px;
                background-color: var(--background-color);
                color: var(--text-color);
            }

            nav {
                margin-bottom: 20px;
                background-color: var(--nav-background-color);
                padding: 10px;
                border-radius: 8px;
            }

            nav a {
                margin-right: 15px;
                text-decoration: none;
                color: var(--nav-link-color);
            }

            .content {
                margin-top: 20px;
            }

            .hidden {
                display: none;
            }

            .modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }

            .modal-content {
                background-color: var(--modal-background);
                color: var(--modal-text-color);
                padding: 2rem;
                border-radius: 0.5rem;
                max-width: 90%;
                max-height: 90%;
                overflow-y: auto;
            }

            .hero-name-role {
                font-size: 1.5rem;
                font-weight: bold;
                margin-bottom: 1rem;
            }

            .ability-box {
                margin-bottom: 1rem;
                border-radius: 10px;
                border: 1px solid var(--text-color);
                background: var(--ability-box-background);
                padding: 10px;
                color: var(--ability-box-text-color);
            }

            .ability-image {
                width: 70px;
                height: 70px;
                background-color: #1C2321;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 50%;
                margin-right: 15px;
                object-fit: contain;
            }

            .ability-wide-image {
                max-width: 23%;
                height: auto;
                background-color: #1C2321;
                border-radius: 10px;
                margin-bottom: 10px;
                margin-right: 15px;
                object-fit: contain;
            }

            .ability-header {
                font-weight: bold;
                font-size: 1.4rem;
                border-radius: 10px 10px 0px 0px;
                padding: 5px;
                background: var(--link-color);
                display: flex;
                justify-content: space-between;
                color: var(--nav-link-color);
            }

            .ability-details {
                display: flex;
                align-items: center;
                background: var(--hero-box-background);
                padding: 10px;
                border-radius: 0px 0px 10px 10px;
            }

            .hero-portrait img {
                width: 100%;
                height: auto;
                max-width: 100%;
                object-fit: cover;
                transition: transform 0.2s ease-in-out;
                border: 2px solid var(--text-color);
            }

            .hero-portrait img:hover {
                transform: scale(1.05);
            }

            .role-icon, .gamemode-icon {
                width: 50px;
                height: 50px;
                margin-right: 10px;
            }

            .map-image {
                width: 100%;
                height: 200px;
                object-fit: cover;
                border-radius: 8px;
            }

            @media (max-width: 768px) {
                .ability-image {
                    width: 50px;
                    height: 50px;
                }
                .ability-header {
                    font-size: 1.2rem;
                }
            }
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
        <div id="roles" class="content hidden">${rolesContent}</div>
        <div id="gamemodes" class="content hidden">${gamemodesContent}</div>
        <div id="maps" class="content hidden">${mapsContent}</div>
        <div id="players" class="content hidden">
            <h2 class="text-xl font-bold mb-4">Player Search</h2>
            <input type="text" id="playerInput" placeholder="Enter player ID" class="border p-2 mr-2">
            <button onclick="searchPlayer()" class="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
            <div id="playerResult" class="mt-4"></div>
        </div>
        <div id="heroModal" class="modal hidden">
            <div class="modal-content">
                <h2 id="modalHeroName" class="hero-name-role"></h2>
                <div id="modalHeroDetails"></div>
                <button onclick="closeModal()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Close</button>
            </div>
        </div>
        <script>
        const API_BASE_URL = 'https://overfast-api.tekrop.fr';
        let heroes = ${JSON.stringify(heroes)};
        let roles = ${JSON.stringify(roles)};
        let gamemodes = ${JSON.stringify(gamemodes)};
        let maps = ${JSON.stringify(maps)};

        function showSection(sectionId) {
            document.querySelectorAll('.content').forEach(el => el.classList.add('hidden'));
            document.getElementById(sectionId).classList.remove('hidden');
        }

        async function showHeroDetails(heroKey) {
            const hero = heroes.find(h => h.key === heroKey);
            if (!hero) return;

            const modalHeroName = document.getElementById('modalHeroName');
            const modalHeroDetails = document.getElementById('modalHeroDetails');
            const modal = document.getElementById('heroModal');

            modalHeroName.textContent = hero.name + ' | ' + hero.role.charAt(0).toUpperCase() + hero.role.slice(1);
            modalHeroDetails.innerHTML = 'Loading details...';

            try {
                const response = await fetch(API_BASE_URL + '/heroes/' + heroKey);
                const details = await response.json();

                const lore = details.story && details.story.chapters 
                    ? details.story.chapters.map(chapter => '<p>' + chapter.content + '</p>').join('')
                    : 'Lore not available.';

                modalHeroDetails.innerHTML = 
                    '<div class="hero-description">' + details.description + '</div>' +
                    '<h3 class="text-xl font-bold mt-4"></h3>' +
                    '<div class="hero-lore">' + lore + '</div>' +
                    '<h3 class="text-xl font-bold mt-4">Abilities:</h3>' +
                    details.abilities.map((ability, index) => 
                        '<div class="ability-box">' +
                            '<div class="ability-header">' + ability.name + '</div>' +
                            '<div class="ability-details">' +
                                (index === 0 
                                    ? '<img src="' + ability.icon + '" alt="' + ability.name + '" class="ability-wide-image">'
                                    : '<img src="' + ability.icon + '" alt="' + ability.name + '" class="ability-image">'
                                ) +
                                '<div>' + ability.description + '</div>' +
                            '</div>' +
                        '</div>'
                    ).join('');

            } catch (error) {
                console.error('Error loading hero details:', error);
                modalHeroDetails.innerHTML = 'Error loading hero details.';
            }

            modal.classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('heroModal').classList.add('hidden');
        }

        async function searchPlayer() {
            const playerId = document.getElementById('playerInput').value;
            const resultDiv = document.getElementById('playerResult');
            resultDiv.innerHTML = 'Searching...';

            try {
                const response = await fetch(API_BASE_URL + '/players/' + playerId);
                const player = await response.json();
                
                let competitiveRanks = '';
                if (player.summary.competitive) {
                    competitiveRanks = Object.entries(player.summary.competitive)
                        .map(([platform, ranks]) => 
                            '<h4 class="font-bold">' + platform.toUpperCase() + ':</h4>' +
                            '<ul>' +
                                Object.entries(ranks).map(([role, rank]) => 
                                    '<li>' + role + ': ' + rank.division + ' ' + rank.tier + '</li>'
                                ).join('') +
                            '</ul>'
                        ).join('');
                }

                resultDiv.innerHTML = 
                    '<h3 class="text-xl font-bold">' + player.summary.username + '</h3>' +
                    '<img src="' + (player.summary.avatar || 'https://via.placeholder.com/150') + '" alt="Player Avatar" class="w-32 h-32 my-2">' +
                    '<p>Title: ' + (player.summary.title || 'N/A') + '</p>' +
                    '<p>Endorsement Level: ' + (player.summary.endorsement ? player.summary.endorsement.level : 'N/A') + '</p>' +
                    '<h4 class="font-bold mt-4">Competitive Ranks:</h4>' +
                    (competitiveRanks || 'No competitive ranks available');
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

function generateHeroesContent(heroes) {
  return `
      <h2 class="text-xl font-bold mb-4">Heroes</h2>
      <div id="heroGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          ${heroes.map(hero => `
              <div class="relative cursor-pointer hero-portrait" onclick="showHeroDetails('${hero.key}')">
                  <div class="aspect-w-1 aspect-h-1">
                      <img src="${hero.portrait}" alt="${hero.name}" class="w-full h-full object-cover rounded-lg">
                  </div>
                  <div class="absolute bottom-0 right-0 bg-black bg-opacity-50 p-1 rounded-tl-lg">
                      ${getRoleIcon(hero.role)}
                  </div>
                  <div class="mt-2">
                      <h3 class="text-lg font-semibold">${hero.name}</h3>
                  </div>
              </div>
          `).join('')}
      </div>
  `;
}

function generateRolesContent(roles) {
  return `
      <h2 class="text-xl font-bold mb-4">Roles</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${roles.map(role => `
              <div class="bg-gray-100 p-4 rounded-lg">
                  <div class="flex items-center mb-2">
                      <img src="${role.icon}" alt="${role.name}" class="role-icon">
                      <h3 class="text-lg font-semibold">${role.name}</h3>
                  </div>
                  <p>${role.description}</p>
              </div>
          `).join('')}
      </div>
  `;
}

function generateGamemodesContent(gamemodes) {
  return `
      <h2 class="text-xl font-bold mb-4">Gamemodes</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${gamemodes.map(gamemode => `
              <div class="bg-gray-100 p-4 rounded-lg">
                  <div class="flex items-center mb-2">
                      <img src="${gamemode.icon}" alt="${gamemode.name}" class="gamemode-icon">
                      <h3 class="text-lg font-semibold">${gamemode.name}</h3>
                  </div>
                  <p>${gamemode.description}</p>
              </div>
          `).join('')}
      </div>
  `;
}

function generateMapsContent(maps) {
  return `
      <h2 class="text-xl font-bold mb-4">Maps</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${maps.map(map => `
              <div class="bg-gray-100 p-4 rounded-lg">
                  <img src="${map.screenshot}" alt="${map.name}" class="map-image mb-2">
                  <h3 class="text-lg font-semibold">${map.name}</h3>
                  <p>Location: ${map.location}</p>
                  <p>Country: ${map.country_code || 'N/A'}</p>
                  <p>Gamemodes: ${map.gamemodes.join(', ')}</p>
              </div>
          `).join('')}
      </div>
  `;
}

function getRoleIcon(role) {
  const icons = {
      tank: '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2.667l-10.667 5.333v6.667c0 6.147 4.56 11.893 10.667 13.333 6.107-1.44 10.667-7.186 10.667-13.333V8L16 2.667zm0 14.666V5.333l8 4v5.333c0 4.267-3.2 8.267-8 9.6V17.333z" fill="currentColor"/></svg>',
      damage: '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M24.267 13.733L16 8l-8.267 5.733L16 19.467l8.267-5.734zm-16.534 0L16 19.467l8.267-5.734L16 8l-8.267 5.733zm8.534 11.734l8.266-5.734L16 13.733l-8.267 5.733L16 25.467z" fill="currentColor"/></svg>',
      support: '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M22.667 14.667v-4h-4V6h-5.334v4.667h-4v4h4v4.666h5.334v-4.666h4zm-6.667 12c6.627 0 12-5.373 12-12s-5.373-12-12-12s-12 5.373-12 12s5.373 12 12 12z" fill="currentColor"/></svg>'
  };
  return icons[role.toLowerCase()] || '';
}

async function main() {
  const html = await generateHTML();
  const outputDir = process.argv[2] || '.';
  const outputPath = path.join(outputDir, 'index.html');
  await fs.writeFile(outputPath, html);
  console.log(`index.html has been generated successfully at ${outputPath}`);
}

main().catch(console.error);
