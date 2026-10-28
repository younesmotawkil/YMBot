import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Sidebar } from '../components/Sidebar';

const Layout: React.FC = ({ children }) => {
    return (
        <div className="layout">
            <Header />
            <div className="main-content">
                <Sidebar />
                <main>{children}</main>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;