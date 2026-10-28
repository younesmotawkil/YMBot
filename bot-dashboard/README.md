# Bot Dashboard

This project is a web-based dashboard for managing bot commands for specific servers. It provides an intuitive interface for users to authenticate, select servers, and manage commands effectively.

## Features

- User authentication
- Server selection
- Command management
- Responsive layout

## Project Structure

```
bot-dashboard
├── src
│   ├── app
│   │   ├── dashboard
│   │   │   └── page.tsx        # Main dashboard component
│   │   ├── login
│   │   │   └── page.tsx        # User login component
│   │   ├── layout.tsx          # Application layout structure
│   │   └── page.tsx            # Entry point for the application
│   ├── components
│   │   ├── CommandList.tsx      # Displays a list of commands
│   │   ├── ServerSelector.tsx    # Allows server selection
│   │   └── Sidebar.tsx           # Navigation sidebar
│   ├── lib
│   │   ├── api.ts                # API call functions
│   │   └── auth.ts               # Authentication logic
│   └── types
│       └── index.ts              # TypeScript interfaces and types
├── public                         # Static assets
├── package.json                  # npm configuration
├── tsconfig.json                 # TypeScript configuration
├── .env.example                  # Example environment variables
└── README.md                     # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/bot-dashboard.git
   ```
2. Navigate to the project directory:
   ```
   cd bot-dashboard
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Start the development server:
   ```
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000` to access the dashboard.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.