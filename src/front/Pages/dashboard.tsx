import React from "react";
import Sidebar from "../components/layout/Sidebar";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="main-content">
                <ChatList />
                <ChatWindow />
            </div>
        </div>
    );
};

export default Dashboard;
