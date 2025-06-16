import React from "react";
import Sidebar from "../components/layout/Sidebar";

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <Sidebar activeTab={""} setActiveTab={function (tab: string): void {
                throw new Error("Function not implemented.");
            } } />
            <div className="main-content">
            </div>
        </div>
    );
};

export default Dashboard;
