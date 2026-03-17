import React, { useState, useEffect } from 'react';
import './App.css';
import Card from './components/Card';
import EditPost from './components/EditPost';

type CardType = {
    id: number;
    title: string;
    body: string;
    userId: number;
}

function App() {
    const [currentView, setCurrentView] = useState<'cards' | 'edit'>('cards');
    const [editingPost, setEditingPost] = useState<CardType | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [hasConsent, setHasConsent] = useState<boolean | null>(null);

    useEffect(() => {
        const consent = localStorage.getItem('app_consent');
        setHasConsent(consent === 'true');
    }, []);

    const handleAcceptCookies = () => {
        localStorage.setItem('app_consent', 'true');
        setHasConsent(true);
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

    if (hasConsent === null) return null;

    if (!hasConsent) {
        return (
            <div className="cookie-overlay">
                <div className="cookie-banner">
                    <h2>Cookie Consent</h2>
                    <p>We use cookies to ensure you get the best experience on our website. You must accept all cookies to access the posts.</p>
                    <button onClick={handleAcceptCookies} className="cookie-accept-btn">
                        Accept All Cookies
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="App">
            {currentView === 'cards' ? (
                <Card onEditPost={handleEditPost} refreshTrigger={refreshTrigger} />
            ) : (
                editingPost && <EditPost post={editingPost} onBack={handleBackToCards} onSuccess={handleEditSuccess} />
            )}
        </div>
    );
}

export default App;