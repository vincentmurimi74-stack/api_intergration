import React, { useState } from 'react';
import './App.css';
import Card from './components/Card.tsx';
import EditPost from './components/EditPost.tsx';

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