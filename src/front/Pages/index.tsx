import { useState } from "react";
import { FiMessageCircle, FiUsers, FiSettings, FiBell, FiSearch, FiFileText, FiPlus, FiUpload } from "react-icons/fi";
import Card from "../components/ui/card";
import Button  from "../components/ui/button";
import CardContent from "../components/ui/card";

export default function SupChat() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="sidebar">
        <FiUsers className="icon" onClick={() => setActiveTab("workspaces")} />
        <FiMessageCircle className="icon" onClick={() => setActiveTab("chat")} />
        <FiFileText className="icon" onClick={() => setActiveTab("files")} />
        <FiBell className="icon" onClick={() => setActiveTab("notifications")} />
        <FiSettings className="icon" onClick={() => setActiveTab("settings")} />
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h1>SUPCHAT</h1>
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input className="search-bar" type="text" placeholder="Search..." />
            <Button className="button">+ Nouveau Message</Button>
          </div>
        </div>

        {/* Content */}
        <div className="chat-window">
          {activeTab === "chat" && <ChatWindow />}
          {activeTab === "workspaces" && <Workspaces />}
          {activeTab === "files" && <Files />}
          {activeTab === "notifications" && <Notifications />}
          {activeTab === "settings" && <Settings />}
        </div>
      </div>
    </div>
  );
}


function ChatWindow() {
  return (
    <Card className="p-4 bg-gray-800">
      <CardContent>
        <div className="space-y-3">
          <p className="text-gray-400">Conversation active dans #projet</p>
          <div className="bg-gray-700 p-3 rounded">
            <strong>Jean Dupont:</strong> Salut tout le monde ! Où en est le projet ?
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <strong>Marie Curie:</strong> On avance bien, il reste quelques corrections à faire !
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <input type="text" className="p-2 w-full bg-gray-700 rounded" placeholder="Tapez votre message..." />
          <Button>Envoyer</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Workspaces() {
  return (
    <Card className="p-4 bg-gray-800">
      <CardContent>
        <p className="text-gray-400">Vos espaces de travail :</p>
        <ul className="mt-4 space-y-2 text-gray-300">
          <li># Développement</li>
          <li># Marketing</li>
          <li># Design</li>
        </ul>
        <Button className="mt-4">Créer un nouvel espace</Button>
      </CardContent>
    </Card>
  );
}

function Files() {
  return (
    <Card className="p-4 bg-gray-800">
      <CardContent>
        <p className="text-gray-400">Fichiers partagés :</p>
        <ul className="mt-4 space-y-2 text-gray-300">
          <li>rapport_projet.pdf - 2.3MB</li>
          <li>maquette_ui.png - 1.2MB</li>
          <li>presentation.pptx - 5.4MB</li>
        </ul>
        <div className="mt-4 flex space-x-2">
          <FiUpload className="text-2xl" />
          <Button>Importer un fichier</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Notifications() {
  return (
    <Card className="p-4 bg-gray-800">
      <CardContent>
        <p className="text-gray-400">Dernières notifications :</p>
        <ul className="mt-4 list-disc list-inside text-gray-300">
          <li>Nouvelle mention dans #projet</li>
          <li>Message privé reçu de Alice</li>
          <li>Nouvelle demande d’adhésion à votre espace</li>
        </ul>
      </CardContent>
    </Card>
  );
}

function Settings() {
  return (
    <Card className="p-4 bg-gray-800">
      <CardContent>
        <p className="text-gray-400">Paramètres utilisateur :</p>
        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox" />
            <span>Activer les notifications</span>
          </label>
          <label className="flex items-center space-x-2 mt-2">
            <input type="checkbox" className="form-checkbox" />
            <span>Thème sombre</span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
