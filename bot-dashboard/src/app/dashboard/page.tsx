import React, { useEffect, useState } from 'react';
import CommandList from '../../components/CommandList';
import ServerSelector from '../../components/ServerSelector';
import { fetchCommands } from '../../lib/api';
import { Command } from '../../types';

const Dashboard: React.FC = () => {
    const [selectedServer, setSelectedServer] = useState<string | null>(null);
    const [commands, setCommands] = useState<Command[]>([]);
    
    useEffect(() => {
        if (selectedServer) {
            const loadCommands = async () => {
                const fetchedCommands = await fetchCommands(selectedServer);
                setCommands(fetchedCommands);
            };
            loadCommands();
        }
    }, [selectedServer]);

    return (
        <div>
            <h1>Bot Dashboard</h1>
            <ServerSelector onSelect={setSelectedServer} />
            {selectedServer && <CommandList commands={commands} />}
        </div>
    );
};

export default Dashboard;