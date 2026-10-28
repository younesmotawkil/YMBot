import React, { useEffect, useState } from 'react';
import { fetchCommands } from '../lib/api';
import { Command } from '../types';

const CommandList: React.FC<{ serverId: string }> = ({ serverId }) => {
    const [commands, setCommands] = useState<Command[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCommands = async () => {
            try {
                setLoading(true);
                const fetchedCommands = await fetchCommands(serverId);
                setCommands(fetchedCommands);
            } catch (err) {
                setError('Failed to load commands');
            } finally {
                setLoading(false);
            }
        };

        if (serverId) {
            loadCommands();
        }
    }, [serverId]);

    if (loading) {
        return <div>Loading commands...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Command List</h2>
            <ul>
                {commands.map((command) => (
                    <li key={command.id}>
                        <span>{command.name}</span>
                        <button onClick={() => {/* Add command action here */}}>Edit</button>
                        <button onClick={() => {/* Delete command action here */}}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommandList;