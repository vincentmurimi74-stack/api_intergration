import React, {useEffect, useState} from "react";
import cardService from "../services/cardService";
import styles from "./Card.module.css";
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';


type Card = {
    id: number;
    title: string;
    body: string;
    userId: number;
}

const Card: React.FC<{ onEditPost: (post: Card) => void; refreshTrigger: number }> = ({ onEditPost, refreshTrigger }) => {
    const [posts, setPosts] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(4);


    // Form state for new post
    const [formTitle, setFormTitle] = useState("");
    const [formBody, setFormBody] = useState("");
    const [formUserId, setFormUserId] = useState<string>("1");
    const [isCreating, setIsCreating] = useState(false);

    // Snackbar state
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; postId: number | null } | null>(null);

    const loadPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await cardService.getPosts<Card[]>(page, limit);
            if (data) {
                setPosts(data);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load posts");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (page > 0 && limit > 0) {
            loadPosts();
        }
    }, [page, limit, refreshTrigger]);

    const handleLimitChange = (val: string) => {
        if (val === "") {
            setLimit(0); // Allow empty state
            return;
        }
        const num = parseInt(val);
        if (!isNaN(num) && num > 0) {
            setLimit(num);
            setPage(1);
        }
    };

    const handleCreate = async () => {
        try {
            setLoading(true);
            const newPost = {
                title: formTitle,
                body: formBody,
                userId: parseInt(formUserId) || 1,
            };
            const created = await cardService.createPost<Card>(newPost);
            if (created) {
                setSnackbar({ message: `Post created successfully!`, type: 'success' });
                setTimeout(() => setSnackbar(null), 3000);
                setFormTitle("");
                setFormBody("");
                setFormUserId("1");
                setIsCreating(false);
                // Refresh or just let the user know it was sent
                await loadPosts();
            }
        } catch (err: any) {
            setSnackbar({ message: err.message || "Failed to create post", type: 'error' });
            setTimeout(() => setSnackbar(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteConfirm({ isOpen: true, postId: id });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm?.postId) return;
        const id = deleteConfirm.postId;
        setDeleteConfirm(null);
        
        try {
            setLoading(true);
            await cardService.deletePost(id);

            // JSONPlaceholder doesn't persist deletes, so we must update local state
            setPosts(prevPosts => prevPosts.filter(post => post.id !== id));

            setSnackbar({ message: "Post deleted successfully!", type: 'success' });
            setTimeout(() => setSnackbar(null), 3000);
            // No need to call loadPosts() as it would fetch the old data from mock API
        } catch (err: any) {
            setSnackbar({ message: err.message || "Failed to delete post", type: 'error' });
            setTimeout(() => setSnackbar(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm(null);
    };

    const startCreating = () => {
        setIsCreating(true);
        setFormTitle("");
        setFormBody("");
        setFormUserId("1");
    };

    if (loading && posts.length === 0) return <div className={styles.loadingMessage}>Loading posts...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Card Post</h2>
                <button
                    onClick={startCreating}
                    className={styles.newPostBtn}
                >
                    <Plus size={18} className={styles.btnIconLeft} />
                    Post
                </button>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            {isCreating && (
                <div className={styles.modalOverlay} onClick={() => { setIsCreating(false); setFormTitle(""); setFormBody(""); setFormUserId("1"); }}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Create New Post</h3>
                            <button 
                                className={styles.closeBtn}
                                onClick={() => { setIsCreating(false); setFormTitle(""); setFormBody(""); setFormUserId("1"); }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.modalBody}>

                            <div className={styles.formGroup}>
                                <label htmlFor="createTitle" className={styles.formLabel}>Title</label>
                                <input
                                    id="createTitle"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Enter post title"
                                    className={styles.formInput}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="createBody" className={styles.formLabel}>Body</label>
                                <textarea
                                    id="createBody"
                                    value={formBody}
                                    onChange={(e) => setFormBody(e.target.value)}
                                    placeholder="Enter post content"
                                    className={styles.formTextarea}
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button onClick={handleCreate} className={styles.btnPrimary}>Create (POST)</button>
                            <button onClick={() => { setIsCreating(false); setFormTitle(""); setFormBody(""); setFormUserId("1"); }} className={styles.btnCancel}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.postsGrid}>
                {posts.map(post => (
                    <div key={post.id} className={styles.postCard}>
                        <div className={styles.postContent}>
                            <h4 className={styles.postTitle}>{post.title}</h4>
                            <p className={styles.postBody}>{post.body}</p>
                        </div>
                        <div className={styles.postActions}>
                            <button
                                onClick={() => onEditPost(post)}
                                className={styles.btnIcon}
                                aria-label="Edit post"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={() => handleDeleteClick(post.id)}
                                className={styles.btnIconDelete}
                                aria-label="Delete post"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.pagination}>
                <div className={styles.paginationSection}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className={page === 1 ? styles.btnPaginationDisabled : styles.btnPagination}
                    >
                        <ChevronLeft size={16} />
                        Prev
                    </button>
                    <div className={styles.paginationSection}>
                        <label htmlFor="pageInput">Page</label>
                        <input
                            id="pageInput"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={page === 0 ? '' : page}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === '' || /^[0-9]+$/.test(val)) {
                                    setPage(val === '' ? 0 : Number(val));
                                }
                            }}
                            className={styles.paginationInput}
                        />
                    </div>
                    <button
                        disabled={posts.length < limit}
                        onClick={() => setPage(p => p + 1)}
                        className={posts.length < limit ? styles.btnPaginationDisabled : styles.btnPagination}
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className={styles.paginationSection}>
                    <div className={styles.paginationSection}>
                        <label htmlFor="limitInput" className={styles.paginationLabel}>Limit</label>
                        <input
                            id="limitInput"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={limit === 0 ? '' : limit}
                            onChange={(e) => handleLimitChange(e.target.value)}
                            className={styles.limitInput}
                        />
                    </div>
                    <span className={styles.paginationInfo}>
                        {posts.length} entries
                    </span>
                </div>
            </div>

            {deleteConfirm?.isOpen && (
                <div className={styles.confirmModalOverlay} onClick={handleDeleteCancel}>
                    <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.confirmTitle}>Delete Post?</h3>
                        <p className={styles.confirmMessage}>
                            Are you sure you want to delete this post? This action cannot be undone.
                        </p>
                        <div className={styles.confirmButtonGroup}>
                            <button 
                                onClick={handleDeleteConfirm}
                                className={styles.btnDeleteConfirm}
                            >
                                Delete
                            </button>
                            <button 
                                onClick={handleDeleteCancel}
                                className={styles.btnCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {snackbar && (
                <div className={`${styles.snackbar} ${styles[snackbar.type]}`}>
                    {snackbar.message}
                </div>
            )}
        </div>
    );
};

export default Card;
