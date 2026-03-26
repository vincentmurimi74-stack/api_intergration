import React, { useState, useEffect } from "react";
import cardService from "../services/cardService";
import userService from "../services/userService";
import styles from "./Card.module.css";
import { X, MessageSquare, Send } from 'lucide-react';

type Card = {
    id: number;
    title: string;
    body: string;
    userId: number;
}

type EditPostProps = {
    post: Card;
    onBack: () => void;
    onSuccess: () => void;
    isAuthenticated: boolean;
    onLoginRequired: () => void;
    onLogout: () => void;
}

const EditPost: React.FC<EditPostProps> = ({ post, onBack, onSuccess, isAuthenticated, onLoginRequired, onLogout }) => {
    const [formTitle, setFormTitle] = useState(post.title);
    const [formBody, setFormBody] = useState(post.body);
    const [formUserId, setFormUserId] = useState(post.userId.toString());
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [users, setUsers] = useState<{id:number;name:string}[]>([]);
    const [comments, setComments] = useState<{id:number;name:string;email:string;body:string}[]>([]);
    const [newComment, setNewComment] = useState({name: '', email: '', body: ''});

    useEffect(() => {
        // fetch users
        userService.getUsers<{id:number;name:string}[]>()
            .then((res: any) => res && setUsers(res))
            .catch(console.error);
        // fetch comments for this post
        cardService.getComments<{id:number;name:string;email:string;body:string}[]>(post.id)
            .then((res: any) => res && setComments(res))
            .catch(console.error);
    }, [post.id]);

    const handleUpdate = async (method: "PUT" | "PATCH") => {
        // detect no changes
        const currentUserId = parseInt(formUserId) || post.userId;
        if (
            formTitle === post.title &&
            formBody === post.body &&
            currentUserId === post.userId
        ) {
            setSnackbar({ message: "No changes made to the post.", type: 'error' });
            setTimeout(() => setSnackbar(null), 3000);
            return;
        }

        try {
            setLoading(true);
            let updated: Card | undefined;
            if (method === "PUT") {
                // PUT: update all fields
                updated = await cardService.replacePost<Card>(post.id, {
                    id: post.id,
                    title: formTitle,
                    body: formBody,
                    userId: currentUserId
                });
            } else {
                // PATCH: update only the title
                updated = await cardService.updatePost<Card>(post.id, {
                    title: formTitle
                });
            }

            if (updated) {
                setSnackbar({ message: `User updated successfully!`, type: 'success' });
                setTimeout(() => {
                    setSnackbar(null);
                    onSuccess();
                    onBack();
                }, 1500);
            }
        } catch (err: any) {
            setSnackbar({ message: err.message || "Failed to update post", type: 'error' });
            setTimeout(() => setSnackbar(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.editPageOverlay}>
            <div className={styles.editPageContainer}>
                <div className={styles.editPageHeader}>
                    <h1 className={styles.editPageTitle}>Edit Post</h1>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {!isAuthenticated ? (
                            <button 
                                onClick={onLoginRequired}
                                className={styles.newPostBtn}
                                style={{ padding: '8px 16px' }}
                            >
                                Login
                            </button>
                        ) : (
                            <button 
                                onClick={onLogout}
                                className={styles.newPostBtn}
                                style={{ padding: '8px 16px', background: '#f1f5f9', color: '#64748b' }}
                                title="Log Out"
                            >
                                <X size={16} />
                                Logout
                            </button>
                        )}
                        <button 
                            className={styles.editPageCloseIconBtn}
                            onClick={onBack}
                            aria-label="Close"
                            title="Close / Back to Home"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className={styles.editPageContent}>
                    <div className={styles.editPageForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="editUserId" className={styles.formLabelCentered}>User</label>
                            <select
                                id="editUserId"
                                value={formUserId}
                                onChange={(e) => setFormUserId(e.target.value)}
                                className={`${styles.formInput} ${!formUserId.trim() ? styles.errorInput : ""}`}
                            >
                                <option value="">Select user</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            {!formUserId.trim() && (
                                <span className={styles.validationWarning}>Please select a user</span>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="editTitle" className={styles.formLabelCentered}>Title</label>
                            <input
                                id="editTitle"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="Enter post title"
                                className={`${styles.formInput} ${!formTitle.trim() ? styles.errorInput : ""}`}
                            />
                            {!formTitle.trim() && (
                                <span className={styles.validationWarningBelow}>Title is required</span>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="editBody" className={styles.formLabelCentered}>Body</label>
                            <textarea
                                id="editBody"
                                value={formBody}
                                onChange={(e) => setFormBody(e.target.value)}
                                placeholder="Enter post content"
                                className={`${styles.formTextarea} ${!formBody.trim() ? styles.errorTextarea : ""}`}
                            />
                            {!formBody.trim() && (
                                <span className={styles.validationWarningBelow}>Body content is required</span>
                            )}
                        </div>
                        <div className={styles.editPageFooter}>
                                <button
                                    onClick={() => handleUpdate("PUT")}
                                    className={styles.btnGrayPill}
                                    disabled={loading || !formTitle.trim() || !formBody.trim() || !formUserId.trim()}
                                >
                                    {loading ? "Updating..." : "Update (POST)"}
                                </button>
                                <button 
                                    className={styles.btnCancelText}
                                    onClick={onBack}
                                >
                                    Cancel
                                </button>
                        </div>
                    </div>

                    {/* comments section */}
                    <div className={styles.commentSection}>
                        <h3 className={styles.commentHeaderTitle} title="Comments">
                            <MessageSquare size={20} />
                            Comments ({comments.length})
                        </h3>

                        <form
                            className={styles.commentForm}
                            onSubmit={async e => {
                                e.preventDefault();
                                try {
                                    const created = await cardService.createComment<{id:number;name:string;email:string;body:string}>(
                                        { ...newComment, postId: post.id }
                                    );
                                    if (created) {
                                        setComments(prev => [...prev, created]);
                                        setNewComment({ name: '', email: '', body: '' });
                                        setSnackbar({ message: 'Comment added!', type: 'success' });
                                        setTimeout(() => setSnackbar(null), 3000);
                                    }
                                } catch (err: any) {
                                    setSnackbar({ message: err.message || 'Failed to add comment', type: 'error' });
                                    setTimeout(() => setSnackbar(null), 3000);
                                }
                            }}
                        >
                            <div className={styles.commentFormGrid}>
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={newComment.name}
                                    onChange={e => setNewComment(prev => ({ ...prev, name: e.target.value }))}
                                    className={styles.formInput}
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    value={newComment.email}
                                    onChange={e => setNewComment(prev => ({ ...prev, email: e.target.value }))}
                                    className={styles.formInput}
                                    required
                                />
                            </div>
                            <textarea
                                placeholder="Write your thoughts..."
                                value={newComment.body}
                                onChange={e => setNewComment(prev => ({ ...prev, body: e.target.value }))}
                                className={styles.formTextarea}
                                required
                            />
                            <button type="submit" className={styles.btnPrimary}>
                                <Send size={16} />
                                Post Comment
                            </button>
                        </form>
                        
                        <div className={styles.commentList}>
                            {comments.map(c => (
                                <div 
                                    key={c.id} 
                                    className={styles.commentItem}
                                    onClick={() => setSnackbar({ message: `Viewing details for comment by ${c.name}`, type: 'success' })}
                                >
                                    <div className={styles.commentAvatar}>
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.commentContent}>
                                        <div className={styles.commentItemHeader}>
                                            <span className={styles.commentAuthor}>{c.name}</span>
                                            <span className={styles.commentEmail}>{c.email}</span>
                                        </div>
                                        <p className={styles.commentBody}>{c.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {snackbar && (
                <div className={`${styles.snackbar} ${styles[snackbar.type]}`}>
                    {snackbar.message}
                </div>
            )}
        </div>
    );
};

export default EditPost;
