import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <h2>Dashboard</h2>
            <ul>
                <li>
                    <Link to="/dashboard/commands">Manage Commands</Link>
                </li>
                <li>
                    <Link to="/dashboard/servers">Select Server</Link>
                </li>
                <li>
                    <Link to="/dashboard/settings">Settings</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;