const axios = require('axios');
const fs = require('fs').promises;

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

async function generateHTML(data) {
  const heroesContent = data.heroes ? `<ul>${data.heroes.map(hero => `<li>${hero.name}</li>`).join('')}</ul>` : 'Error loading heroes.';
  const rolesContent = data.roles ? `<ul>${data.roles.map(role => `<li>${role.name}</li>`).join('')}</ul>` : 'Error loading roles.';
  const gamemodesContent = data.gamemodes ? `<ul>${data.gamemodes.map(mode => `<li>${mode.name}</li>`).join('')}</ul>` : 'Error loading gamemodes.';
  const mapsContent = data.maps ? `<ul>${data.maps.map(map => `<li>${map.name}</li>`).join('')}</ul>` : 'Error loading maps.';

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OverFast API Website</title>
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
      <h1>OverFast API Website</h1>
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
          <h2>Player Search</h2>
          <input type="text" id="playerInput" placeholder="Enter player ID">
          <button onclick="searchPlayer()">Search</button>
          <div id="playerResult"></div>
      </div>
      <script>
      function showSection(sectionId) {
          document.querySelectorAll('.content').forEach(el => el.classList.add('hidden'));
          document.getElementById(sectionId).classList.remove('hidden');
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
    const data = {
        heroes: await fetchData('heroes'),
        roles: await fetchData('roles'),
        gamemodes: await fetchData('gamemodes'),
        maps: await fetchData('maps')
    };

    const html = await generateHTML(data);
    await fs.writeFile('index.html', html);
    console.log('index.html has been generated successfully.');
}

main().catch(console.error);