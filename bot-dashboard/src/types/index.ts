export interface Command {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
}

export interface Server {
    id: string;
    name: string;
    commands: Command[];
}