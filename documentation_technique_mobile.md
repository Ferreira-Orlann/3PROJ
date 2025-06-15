# Documentation Technique - Application Mobile 3PROJ

## Table des matières
1. [Introduction](#introduction)
2. [Architecture de l'application](#architecture-de-lapplication)
3. [Prérequis et dépendances](#prérequis-et-dépendances)
4. [Configuration de l'environnement](#configuration-de-lenvironnement)
5. [Guide de déploiement](#guide-de-déploiement)
6. [Structure du projet](#structure-du-projet)
7. [Fonctionnalités principales](#fonctionnalités-principales)
8. [Gestion d'authentification](#gestion-dauthentification)
9. [Communication avec le backend](#communication-avec-le-backend)
10. [Gestion des WebSockets](#gestion-des-websockets)
11. [Diagrammes UML](#diagrammes-uml)
12. [Schéma de la base de données](#schéma-de-la-base-de-données)
13. [Justification des choix techniques](#justification-des-choix-techniques)

## Introduction

Cette documentation technique détaille l'application mobile 3PROJ, une application de messagerie et de collaboration en temps réel développée avec React Native et Expo. L'application permet aux utilisateurs de communiquer via des canaux de discussion, des messages privés, et de gérer des espaces de travail collaboratifs.

## Architecture de l'application

L'application mobile 3PROJ est construite selon une architecture modulaire basée sur React Native avec Expo. Elle utilise:

- **React Native**: Framework de développement mobile cross-platform
- **Expo**: Plateforme simplifiant le développement React Native
- **TypeScript**: Langage de programmation typé pour une meilleure maintenabilité
- **Redux Toolkit**: Gestion d'état global de l'application
- **RTK Query**: Gestion des requêtes API et du cache
- **Socket.IO**: Communication en temps réel avec le backend
- **React Navigation**: Navigation entre les écrans

L'architecture suit un modèle de conception basé sur les composants avec séparation des préoccupations:
- **Composants**: Interface utilisateur réutilisable
- **Écrans**: Pages de l'application
- **Services**: Logique métier et communication avec l'API
- **Hooks**: Logique réutilisable et gestion d'état
- **Contextes**: État global partagé entre composants
- **Store**: État global Redux

## Prérequis et dépendances

### Environnement de développement
- Node.js (v16.x ou supérieur)
- npm ou pnpm
- Expo CLI
- Android Studio (pour le développement Android)
- Xcode (pour le développement iOS, macOS uniquement)

### Dépendances principales
```json
{
  "dependencies": {
    "@babel/runtime": "^7.27.0",
    "@expo/vector-icons": "^14.1.0",
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-navigation/bottom-tabs": "^7.3.10",
    "@react-navigation/native": "^7.1.6",
    "@reduxjs/toolkit": "^2.8.2",
    "axios": "^1.8.4",
    "expo": "~53.0.7",
    "expo-blur": "~14.1.4",
    "expo-constants": "~17.1.5",
    "expo-font": "~13.3.1",
    "expo-haptics": "~14.1.4",
    "expo-image-picker": "^16.1.4",
    "expo-linking": "~7.1.4",
    "expo-router": "~5.0.5",
    "expo-splash-screen": "~0.30.8",
    "expo-status-bar": "~2.2.3",
    "expo-symbols": "~0.4.4",
    "expo-system-ui": "~5.0.7",
    "expo-web-browser": "~14.1.6",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-native": "0.79.2",
    "react-native-gesture-handler": "~2.24.0",
    "react-native-reanimated": "~3.17.4",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "~4.10.0",
    "react-native-web": "^0.20.0",
    "react-native-webview": "13.13.5",
    "react-redux": "^9.2.0",
    "redux-persist": "^6.0.0",
    "socket.io-client": "^4.8.1"
  }
}
```

## Configuration de l'environnement

### Variables d'environnement

L'application utilise un fichier de configuration pour gérer les variables d'environnement. Ce fichier se trouve dans `app/services/api/config.ts`.

```typescript
// Exemple de configuration
export const API_BASE_URL = `http://${HOST}:${PORT}`;
export const DEFAULT_TIMEOUT = 3000;
export const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    Accept: "application/json",
};
```

> **IMPORTANT**: Pour le déploiement en production, vous devez modifier le fichier `config.ts` pour pointer vers votre serveur de production. Remplacez la variable `HOST` par l'adresse IP ou le nom de domaine de votre serveur backend.

### Configuration pour le développement

Pour le développement local, l'application est configurée pour se connecter à un serveur de développement sur:
- Android: `10.0.2.2:3000` (émulateur Android)
- iOS: `localhost:3000` (émulateur iOS)
- Appareil physique: `192.168.1.177:3000` (adresse IP locale)

## Guide de déploiement

### Prérequis pour le déploiement
- Compte Expo (https://expo.dev)
- EAS CLI installé (`npm install -g eas-cli`)
- Configuration du projet sur Expo

### Étapes de déploiement

1. **Configuration initiale**

   Connectez-vous à votre compte Expo:
   ```bash
   eas login
   ```

2. **Configuration du projet**

   Initialisez la configuration EAS:
   ```bash
   eas build:configure
   ```

3. **Mise à jour de la configuration API**

   Modifiez le fichier `app/services/api/config.ts` pour pointer vers votre serveur de production:
   ```typescript
   export const API_BASE_URL = 'https://votre-serveur-production.com';
   ```

4. **Construction de l'application**

   Pour Android:
   ```bash
   eas build --platform android
   ```

   Pour iOS:
   ```bash
   eas build --platform ios
   ```

5. **Soumission aux stores**

   Pour Android (Google Play Store):
   ```bash
   eas submit -p android
   ```

   Pour iOS (Apple App Store):
   ```bash
   eas submit -p ios
   ```

## Structure du projet

```
src/mobile/
├── app/
│   ├── assets/            # Images, polices et autres ressources statiques
│   ├── components/        # Composants réutilisables
│   │   ├── chat/          # Composants liés au chat
│   │   ├── common/        # Composants génériques
│   │   ├── debug/         # Outils de débogage
│   │   └── layout/        # Composants de mise en page
│   ├── constants/         # Constantes de l'application
│   ├── context/           # Contextes React (AuthContext, etc.)
│   ├── hooks/             # Hooks personnalisés
│   ├── screens/           # Écrans de l'application
│   │   ├── auth/          # Écrans d'authentification
│   │   ├── Profile/       # Écrans de profil utilisateur
│   │   ├── workspaces/    # Écrans de gestion des espaces de travail
│   │   └── ...
│   ├── services/          # Services d'API et logique métier
│   │   ├── api/           # Configuration et endpoints API
│   │   └── websocket/     # Service WebSocket
│   ├── store/             # Configuration Redux
│   │   ├── api/           # RTK Query API
│   │   └── slices/        # Slices Redux
│   ├── styles/            # Styles globaux
│   └── types/             # Types TypeScript
├── package.json           # Dépendances du projet
└── tsconfig.json          # Configuration TypeScript
```

## Fonctionnalités principales

### 1. Authentification et gestion des utilisateurs
- Inscription et connexion
- Gestion de profil utilisateur
- Gestion de photo de profil
- Authentification OAuth (Google, GitHub, Microsoft)

### 2. Espaces de travail et canaux
- Création et gestion d'espaces de travail
- Création et gestion de canaux de discussion
- Gestion des membres et des permissions

### 3. Messagerie
- Messages en temps réel
- Messages privés
- Réactions aux messages
- Pièces jointes et fichiers

### 4. Notifications
- Notifications en temps réel
- Préférences de notification
- Historique des notifications

## Gestion d'authentification

L'authentification est gérée via le contexte `AuthContext` qui fournit:

- Connexion/déconnexion
- Inscription
- Stockage sécurisé du token JWT
- Persistance de la session utilisateur

```typescript
// Exemple d'utilisation du contexte d'authentification
const { user, token, login, logout, register } = useAuth();
```

Le token d'authentification est stocké localement via AsyncStorage et automatiquement injecté dans les en-têtes des requêtes API via un intercepteur Axios.

## Communication avec le backend

### Configuration du client API

L'application utilise Axios pour les requêtes HTTP et RTK Query pour la gestion du cache et des requêtes.

```typescript
// Configuration du client Axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: DEFAULT_HEADERS,
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### Endpoints API

Les services API sont organisés par domaine fonctionnel:

- `auth.ts`: Authentification (login, register)
- `users.ts`: Gestion des utilisateurs
- `workspaces.ts`: Gestion des espaces de travail
- `channels.ts`: Gestion des canaux
- `messages.ts`: Gestion des messages
- `files.ts`: Gestion des fichiers et pièces jointes

## Gestion des WebSockets

La communication en temps réel est gérée via Socket.IO. Le service WebSocket gère:

- Connexion/déconnexion
- Envoi et réception d'événements
- Reconnexion automatique
- Mappage des événements entre le backend et le frontend

```typescript
// Exemple d'utilisation du service WebSocket
WebSocketService.connect(token);
WebSocketService.on("message_sent", handleNewMessage);
WebSocketService.emit("send_message", messageData);
```

Les événements WebSocket sont mappés entre le backend et le frontend pour assurer la compatibilité:

```typescript
// Mapping des événements backend vers les événements mobile
const BACKEND_TO_MOBILE_EVENTS = {
    "message.created": "message_sent",
    "message.updated": "message_updated",
    "message.removed": "message_removed",
    // ...
};
```

## Diagrammes UML

### Diagramme de classes simplifié

```
+----------------+       +---------------+       +----------------+
|  AuthContext   |       |  ApiClient    |       | WebSocketService |
+----------------+       +---------------+       +----------------+
| - user         |       | - baseURL     |       | - socket       |
| - token        |       | - headers     |       | - token        |
| + login()      |       | + get()       |       | + connect()    |
| + register()   |       | + post()      |       | + disconnect() |
| + logout()     |       | + put()       |       | + emit()       |
+-------+--------+       | + delete()    |       | + on()         |
        |                +-------+-------+       +-------+--------+
        |                        |                       |
        v                        v                       v
+----------------+       +---------------+       +----------------+
| UserProfile    |       | ApiEndpoints  |       | SocketEvents   |
+----------------+       +---------------+       +----------------+
| - username     |       | + auth        |       | - messageEvents|
| - email        |       | + users       |       | - userEvents   |
| - avatar       |       | + workspaces  |       | - channelEvents|
| + updateProfile()|      | + channels    |       | + mapEvents() |
+----------------+       | + messages    |       +----------------+
                        +---------------+
```

### Diagramme de flux d'authentification

```
+--------+    +-------------+    +--------+    +-------------+
| Client |    | AuthContext |    |  API   |    | AsyncStorage|
+--------+    +-------------+    +--------+    +-------------+
    |               |               |               |
    | login(email,  |               |               |
    |  password)    |               |               |
    |-------------->|               |               |
    |               | POST /auth/login              |
    |               |-------------->|               |
    |               |               |               |
    |               | token, user   |               |
    |               |<--------------|               |
    |               |                               |
    |               | store token                   |
    |               |------------------------------>|
    |               |                               |
    |               | store user                    |
    |               |------------------------------>|
    |               |                               |
    | user, token   |                               |
    |<--------------|                               |
    |               |                               |
```

## Schéma de la base de données

L'application mobile interagit avec une base de données PostgreSQL gérée par le backend NestJS. Voici les principales entités:

### Utilisateurs
- `uuid`: Identifiant unique (UUID)
- `username`: Nom d'utilisateur
- `email`: Adresse email
- `password`: Mot de passe hashé
- `firstname`: Prénom
- `lastname`: Nom de famille
- `status`: Statut de l'utilisateur (en ligne, absent, hors ligne)
- `avatar`: UUID du fichier d'avatar

### Espaces de travail
- `uuid`: Identifiant unique (UUID)
- `name`: Nom de l'espace de travail
- `description`: Description
- `owner`: Référence à l'utilisateur propriétaire

### Canaux
- `uuid`: Identifiant unique (UUID)
- `name`: Nom du canal
- `description`: Description
- `is_public`: Visibilité du canal
- `workspace_uuid`: Référence à l'espace de travail

### Messages
- `uuid`: Identifiant unique (UUID)
- `content`: Contenu du message
- `created_at`: Date de création
- `updated_at`: Date de mise à jour
- `source`: Référence à l'utilisateur émetteur
- `destination_channel`: Référence au canal (optionnel)
- `destination_user`: Référence à l'utilisateur destinataire (optionnel)

### Pièces jointes
- `uuid`: Identifiant unique (UUID)
- `filename`: Nom du fichier
- `mimetype`: Type MIME
- `size`: Taille en octets
- `message_uuid`: Référence au message

### Réactions
- `uuid`: Identifiant unique (UUID)
- `emoji`: Emoji de la réaction
- `message_uuid`: Référence au message
- `user_uuid`: Référence à l'utilisateur

## Justification des choix techniques

### React Native avec Expo
React Native a été choisi pour permettre le développement cross-platform (iOS et Android) avec une base de code unique. Expo accélère le développement en fournissant des outils et des APIs prêts à l'emploi pour les fonctionnalités natives comme la sélection d'images et les notifications.

### TypeScript
TypeScript apporte la sécurité de type et améliore la maintenabilité du code, particulièrement important pour une application complexe avec de nombreuses interactions entre composants.

### Redux Toolkit et RTK Query
Redux Toolkit simplifie la gestion d'état global et RTK Query offre une solution complète pour la gestion des requêtes API avec mise en cache automatique, réduisant la quantité de code boilerplate et améliorant les performances.

### Socket.IO
Socket.IO a été choisi pour la communication en temps réel en raison de sa robustesse, sa gestion automatique des reconnexions et sa compatibilité avec le backend NestJS.

### Expo Router
Expo Router offre une navigation basée sur les fichiers similaire à Next.js, simplifiant la structure de navigation et permettant des URLs partagées entre plateformes.

### AsyncStorage
AsyncStorage est utilisé pour la persistance des données locales comme les tokens d'authentification et les préférences utilisateur, offrant une API simple et asynchrone.

### Expo Image Picker
Cette bibliothèque a été choisie pour la gestion des photos de profil car elle simplifie l'accès à la galerie et à l'appareil photo, avec des fonctionnalités de recadrage intégrées.
