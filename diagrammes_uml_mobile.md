# Diagrammes UML - Application Mobile 3PROJ

## Table des matières
1. [Diagramme de classes](#diagramme-de-classes)
2. [Diagramme de séquence - Authentification](#diagramme-de-séquence---authentification)
3. [Diagramme de séquence - Envoi de message](#diagramme-de-séquence---envoi-de-message)
4. [Diagramme de cas d'utilisation](#diagramme-de-cas-dutilisation)
5. [Diagramme d'architecture](#diagramme-darchitecture)
6. [Diagramme de composants](#diagramme-de-composants)

## Diagramme de classes

```
+-------------------+       +-------------------+       +-------------------+
|    AuthContext    |       |    ApiService     |       | WebSocketService  |
+-------------------+       +-------------------+       +-------------------+
| - user: User      |       | - baseURL: string |       | - socket: Socket  |
| - token: string   |<----->| - headers: object |<----->| - token: string   |
| - isAuth: boolean |       | - timeout: number |       | - connected: bool |
+-------------------+       +-------------------+       +-------------------+
| + login()         |       | + get()           |       | + connect()       |
| + register()      |       | + post()          |       | + disconnect()    |
| + logout()        |       | + put()           |       | + emit()          |
| + updateUser()    |       | + delete()        |       | + on()            |
+--------^----------+       +--------^----------+       +--------^----------+
         |                           |                           |
         |                           |                           |
+--------v----------+       +--------v----------+       +--------v----------+
|       User        |       |    ApiEndpoint    |       |   SocketEvent     |
+-------------------+       +-------------------+       +-------------------+
| - uuid: UUID      |       | - path: string    |       | - name: string    |
| - username: string|       | - method: string  |       | - handler: func   |
| - email: string   |       | - auth: boolean   |       | - once: boolean   |
| - avatar: string  |       +-------------------+       +-------------------+
| - status: string  |       | + execute()       |       | + trigger()       |
+-------------------+       +-------------------+       +-------------------+
         ^                           ^                           ^
         |                           |                           |
+--------v----------+       +--------v----------+       +--------v----------+
|    UserProfile    |       |  ApiEndpoints     |       |   EventMapping    |
+-------------------+       +-------------------+       +-------------------+
| - firstName: str  |       | + auth            |       | + backendToMobile |
| - lastName: string|       | + users           |       | + mobileToBackend |
| - bio: string     |       | + workspaces      |       | + combined        |
| - avatarFile: File|       | + channels        |       +-------------------+
+-------------------+       | + messages        |       | + mapEvent()      |
| + updateProfile() |       +-------------------+       +-------------------+
+-------------------+       +-------------------+       +-------------------+

+-------------------+       +-------------------+       +-------------------+
|     Message       |       |     Channel       |       |    Workspace      |
+-------------------+       +-------------------+       +-------------------+
| - uuid: UUID      |       | - uuid: UUID      |       | - uuid: UUID      |
| - content: string |       | - name: string    |       | - name: string    |
| - createdAt: Date |       | - description: str|       | - description: str|
| - updatedAt: Date |       | - isPublic: bool  |       | - owner: UUID     |
| - sender: UUID    |       | - workspace: UUID |       | - members: UUID[] |
+-------------------+       +-------------------+       +-------------------+
| + format()        |       | + join()          |       | + addMember()     |
| + react()         |       | + leave()         |       | + removeMember()  |
| + edit()          |       | + invite()        |       | + updateInfo()    |
| + delete()        |       +-------------------+       +-------------------+
+-------------------+

+-------------------+       +-------------------+       +-------------------+
|    Attachment     |       |     Reaction      |       |   Notification    |
+-------------------+       +-------------------+       +-------------------+
| - uuid: UUID      |       | - uuid: UUID      |       | - uuid: UUID      |
| - filename: string|       | - emoji: string   |       | - type: string    |
| - mimetype: string|       | - message: UUID   |       | - content: object |
| - size: number    |       | - user: UUID      |       | - read: boolean   |
| - message: UUID   |       +-------------------+       | - createdAt: Date |
+-------------------+       | + toggle()        |       +-------------------+
| + download()      |       +-------------------+       | + markAsRead()    |
+-------------------+                                   +-------------------+
```

## Diagramme de séquence - Authentification

```
+--------+    +-------------+    +--------+    +-------------+    +--------+
| Client |    | AuthContext |    |  API   |    | AsyncStorage|    |  Redux |
+--------+    +-------------+    +--------+    +-------------+    +--------+
    |               |               |               |               |
    | login(email,  |               |               |               |
    |  password)    |               |               |               |
    |-------------->|               |               |               |
    |               | POST /auth/login              |               |
    |               |-------------->|               |               |
    |               |               |               |               |
    |               | token, user   |               |               |
    |               |<--------------|               |               |
    |               |                               |               |
    |               | store token                   |               |
    |               |------------------------------>|               |
    |               |                               |               |
    |               | store user                    |               |
    |               |------------------------------>|               |
    |               |                               |               |
    |               | dispatch(setUser)             |               |
    |               |---------------------------------------------->|
    |               |                               |               |
    |               | dispatch(setAuth)             |               |
    |               |---------------------------------------------->|
    |               |                               |               |
    | user, token   |                               |               |
    |<--------------|                               |               |
    |               |                               |               |
    | navigate to   |                               |               |
    | home screen   |                               |               |
    |-------------->|                               |               |
    |               |                               |               |
```

## Diagramme de séquence - Envoi de message

```
+--------+    +-------------+    +---------+    +--------+    +--------+
| Client |    | ChatInput   |    | ApiSvc  |    |  WS    |    | Redux  |
+--------+    +-------------+    +---------+    +--------+    +--------+
    |               |               |              |             |
    | type message  |               |              |             |
    |-------------->|               |              |             |
    |               |               |              |             |
    | press send    |               |              |             |
    |-------------->|               |              |             |
    |               | sendMessage() |              |             |
    |               |-------------->|              |             |
    |               |               | POST /messages             |
    |               |               |------------->|             |
    |               |               |              |             |
    |               |               | message data |             |
    |               |               |<-------------|             |
    |               |               |              |             |
    |               |               | emit message |             |
    |               |               |------------->|             |
    |               |               |              |             |
    |               |               | dispatch(addMessage)       |
    |               |               |--------------------------->|
    |               |               |              |             |
    |               | clear input   |              |             |
    |               |-------------->|              |             |
    |               |               |              |             |
    | message       |               |              |             |
    | appears in UI |               |              |             |
    |<--------------|               |              |             |
    |               |               |              |             |
```

## Diagramme de cas d'utilisation

```
                        +-------------------+
                        |    Application    |
                        |      Mobile       |
                        +-------------------+
                                 |
          +--------------------+-+--+-------------------+
          |                    |    |                   |
+---------v---------+ +--------v--------+  +-----------v-----------+
|   Authentification | |  Communication  |  |  Gestion de profil    |
+-------------------+ +----------------+  +---------------------+
| - S'inscrire      | | - Envoyer message| | - Modifier profil    |
| - Se connecter    | | - Réagir message | | - Changer mot de passe|
| - Se déconnecter  | | - Joindre fichier| | - Gérer avatar        |
| - Connexion OAuth | | - Créer canal    | | - Connexions OAuth    |
+-------------------+ | - Gérer workspace| +---------------------+
                      +----------------+
```

## Diagramme d'architecture

```
+-------------------------------------------------------------+
|                     Interface Utilisateur                    |
|  +-------------+  +-------------+  +-------------+           |
|  |   Écrans    |  | Composants  |  |  Navigation |           |
|  +-------------+  +-------------+  +-------------+           |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                     Logique Applicative                      |
|  +-------------+  +-------------+  +-------------+           |
|  |   Hooks     |  |  Contextes  |  |   Redux     |           |
|  +-------------+  +-------------+  +-------------+           |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                     Services & Communication                 |
|  +-------------+  +-------------+  +-------------+           |
|  | API Service |  |  WebSocket  |  |  Storage    |           |
|  +-------------+  +-------------+  +-------------+           |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                     Backend (NestJS)                         |
|  +-------------+  +-------------+  +-------------+           |
|  |    API      |  |  WebSocket  |  |  Database   |           |
|  +-------------+  +-------------+  +-------------+           |
+-------------------------------------------------------------+
```

## Diagramme de composants

```
+---------------------+        +----------------------+
|     AuthContext     |<------>|    ApiService        |
+---------------------+        +----------------------+
          ^                              ^
          |                              |
          v                              v
+---------------------+        +----------------------+
|    Redux Store      |<------>|   WebSocketService   |
+---------------------+        +----------------------+
          ^                              ^
          |                              |
          v                              v
+---------------------+        +----------------------+
|   Screen Components |<------>|  Shared Components   |
+---------------------+        +----------------------+
          ^                              ^
          |                              |
          v                              v
+---------------------+        +----------------------+
|   Navigation        |<------>|   Custom Hooks       |
+---------------------+        +----------------------+
```

Ces diagrammes UML représentent la structure et les interactions principales de l'application mobile 3PROJ. Ils peuvent être utilisés comme référence pour comprendre l'architecture du système et faciliter la maintenance ou l'évolution de l'application.
