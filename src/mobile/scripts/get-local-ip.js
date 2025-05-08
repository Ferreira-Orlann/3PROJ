const { networkInterfaces } = require("os");
const fs = require("fs");
const path = require("path");

// Fonction pour obtenir l'adresse IP Wi-Fi locale
function getLocalIpAddress() {
    const nets = networkInterfaces();
    const results = {};

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Ignorer les interfaces loopback et non IPv4
            if (net.family === "IPv4" && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }

    // Rechercher l'interface Wi-Fi
    let wifiIp = null;

    // Rechercher d'abord les interfaces qui contiennent "Wi-Fi" ou "Wireless" dans leur nom
    for (const [name, addresses] of Object.entries(results)) {
        if (
            name.toLowerCase().includes("wi-fi") ||
            name.toLowerCase().includes("wireless")
        ) {
            wifiIp = addresses[0];
            break;
        }
    }

    // Si aucune interface Wi-Fi n'est trouvée, prendre la première interface non-loopback
    if (!wifiIp) {
        for (const addresses of Object.values(results)) {
            if (addresses.length > 0) {
                wifiIp = addresses[0];
                break;
            }
        }
    }

    return wifiIp || "localhost";
}

// Obtenir l'adresse IP
const localIp = getLocalIpAddress();
console.log(`Adresse IP locale détectée : ${localIp}`);

// Créer ou mettre à jour le fichier .env.local avec l'adresse IP détectée
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = `EXPO_PUBLIC_API_URL=http://${localIp}:3000\n`;

fs.writeFileSync(envPath, envContent);
console.log(`Fichier .env.local mis à jour avec l'adresse IP : ${localIp}`);
