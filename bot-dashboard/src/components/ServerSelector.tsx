import React, { useEffect, useState } from 'react';
import { fetchServers } from '../lib/api';
import { Server } from '../types';

const ServerSelector: React.FC<{ onSelect: (server: Server) => void }> = ({ onSelect }) => {
    const [servers, setServers] = useState<Server[]>([]);
    const [selectedServer, setSelectedServer] = useState<Server | null>(null);

    useEffect(() => {
        const loadServers = async () => {
            const serverList = await fetchServers();
            setServers(serverList);
        };

        loadServers();
    }, []);

    const handleServerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const serverId = event.target.value;
        const server = servers.find(s => s.id === serverId) || null;
        setSelectedServer(server);
        if (server) {
            onSelect(server);
        }
    };

    return (
        <div>
            <label htmlFor="server-select">Select a Server:</label>
            <select id="server-select" value={selectedServer?.id || ''} onChange={handleServerChange}>
                <option value="" disabled>Select a server</option>
                {servers.map(server => (
                    <option key={server.id} value={server.id}>
                        {server.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ServerSelector;