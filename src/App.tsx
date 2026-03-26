import React, { useState, useEffect } from 'react';
import './App.css';
import Card from './components/Card';
import EditPost from './components/EditPost';
import Auth from './components/Auth';

type CardType = {
    id: number;
    title: string;
    body: string;
    userId: number;
}

function App() {
    const [currentView, setCurrentView] = useState<'cards' | 'edit' | 'auth'>('cards');
    const [editingPost, setEditingPost] = useState<CardType | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'add' | 'view', post?: CardType } | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        const authState = localStorage.getItem('is_authenticated');
        setIsAuthenticated(authState === 'true');
    }, []);

    const handleLogin = () => {
        localStorage.setItem('is_authenticated', 'true');
        setIsAuthenticated(true);
        setCurrentView('cards');
        setAuthError(null);
    };

    const handleActionResolved = () => {
        setPendingAction(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('is_authenticated');
        setIsAuthenticated(false);
        setCurrentView('cards');
        setEditingPost(null);
        setPendingAction(null);
    };

    const handleAuthRequired = (action?: { type: 'edit' | 'add' | 'view', post?: CardType }) => {
        if (action) setPendingAction(action);
        setCurrentView('auth');
    };

    const handleAuthError = (error: string) => {
        setAuthError(error);
        setCurrentView('cards'); // Redirect back to show error below search bar
    };

    const handleEditPost = (post: CardType) => {
        setEditingPost(post);
        setCurrentView('edit');
    };

    const handleBackToCards = () => {
        setCurrentView('cards');
        setEditingPost(null);
    };

    const handleEditSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (isAuthenticated === null) return null;

    return (
        <div className="App">
            {currentView === 'cards' && (
                <Card 
                    onEditPost={handleEditPost} 
                    refreshTrigger={refreshTrigger} 
                    onLogout={handleLogout}
                    isAuthenticated={!!isAuthenticated}
                    onLoginRequired={handleAuthRequired}
                    authError={authError}
                    pendingAction={pendingAction}
                    onActionResolved={handleActionResolved}
                />
            )}
            {currentView === 'edit' && editingPost && (
                <EditPost 
                    post={editingPost} 
                    onBack={handleBackToCards} 
                    onSuccess={handleEditSuccess}
                    isAuthenticated={!!isAuthenticated}
                    onLoginRequired={() => handleAuthRequired()}
                    onLogout={handleLogout}
                />
            )}
            {currentView === 'auth' && (
                <Auth 
                    onLogin={handleLogin} 
                    onError={handleAuthError}
                />
            )}
        </div>
    );
}

export default App;