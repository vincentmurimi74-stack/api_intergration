import React, {useEffect, useState, useCallback} from "react";
import cardService from "../services/cardService";
import styles from "./Card.module.css";
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Search } from 'lucide-react';


type PostType = {
    id: number;
    title: string;
    body: string;
    userId: number;
}

const Card: React.FC<{ onEditPost: (post: PostType) => void; refreshTrigger: number }> = ({ onEditPost, refreshTrigger }) => {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(4);
    const [searchQuery, setSearchQuery] = useState("");


    // Form state for new post
    const [formTitle, setFormTitle] = useState("");
    const [formBody, setFormBody] = useState("");
    const [formUserId, setFormUserId] = useState<string>("1");
    const [isCreating, setIsCreating] = useState(false);
    const [viewingPost, setViewingPost] = useState<PostType | null>(null);

    // Snackbar state
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; postId: number | null } | null>(null);

    const loadPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await cardService.getPosts<PostType[]>(page, limit);
            if (data) {
                setPosts(data);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load posts");
        } finally {
            setLoading(false);
        }
    }, [page, limit]);


    useEffect(() => {
        if (page > 0 && limit > 0) {
            loadPosts();
        }
    }, [loadPosts, refreshTrigger, page, limit]);

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
            const created = await cardService.createPost<PostType>(newPost);
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

    const limitWords = (text: string, count: number) => {
        const words = text.split(' ');
        if (words.length <= count) return text;
        return words.slice(0, count).join(' ') + '...';
    };

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.body.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && posts.length === 0) return <div className={styles.loadingMessage}>Loading posts...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.mainTitle}>
                    <span className={styles.cardWord}>Card</span>
                    <span className={styles.postWord}>Post</span>
                </h2>
                <button
                    onClick={startCreating}
                    className={styles.newPostBtn}
                >
                    <Plus size={18} className={styles.btnIconLeft} />
                    <span className={styles.btnText}>Post</span>
                </button>
            </div>

            <div className={styles.searchContainer}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
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
                                    className={`${styles.formInput} ${!formTitle.trim() ? styles.errorInput : ""}`}
                                />
                                {!formTitle.trim() && (
                                    <span className={styles.validationWarning}>Title is required</span>
                                )}
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="createBody" className={styles.formLabel}>Body</label>
                                <textarea
                                    id="createBody"
                                    value={formBody}
                                    onChange={(e) => setFormBody(e.target.value)}
                                    placeholder="Enter post content"
                                    className={`${styles.formTextarea} ${!formBody.trim() ? styles.errorTextarea : ""}`}
                                />
                                {!formBody.trim() && (
                                    <span className={styles.validationWarning}>Body content is required</span>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button 
                                onClick={handleCreate} 
                                className={styles.btnPrimary}
                                disabled={loading || !formTitle.trim() || !formBody.trim()}
                            >
                                {loading ? "Creating..." : "Create (POST)"}
                            </button>
                            <button onClick={() => { setIsCreating(false); setFormTitle(""); setFormBody(""); setFormUserId("1"); }} className={styles.btnCancel}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.postsGrid}>
                {filteredPosts.map(post => (
                    <div key={post.id} className={styles.postCard} onClick={() => setViewingPost(post)}>
                        <div className={styles.postContent}>
                            <h4 className={styles.postTitle}>{limitWords(post.title, 2)}</h4>
                            <p className={styles.postBody}>{post.body}</p>
                        </div>
                        <div className={styles.postActions}>
                            <button
                                onClick={(e) => { e.stopPropagation(); onEditPost(post); }}
                                className={styles.btnIcon}
                                aria-label="Edit post"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(post.id); }}
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
                <div className={styles.googlePagination}>
                    {/* C a r d P */}
                    <span className={`${styles.googleText} ${styles.g1}`}>C</span>
                    <span className={`${styles.googleText} ${styles.l}`}>a</span>
                    <span className={`${styles.googleText} ${styles.e}`}>r</span>
                    <span className={`${styles.googleText} ${styles.g1}`}>d</span>
                    <span className={`${styles.googleText} ${styles.e}`}>P</span>

                    <div 
                        className={styles.pageItem}
                        onClick={() => page > 1 && setPage(p => p - 1)}
                    >
                        <span className={`${styles.googleO} ${page === 1 ? styles['o-active'] : styles['o-inactive']}`}>o</span>
                    </div>

                    {/* Generate 'o's for pages */}
                    {Array.from({ length: Math.min(10, Math.ceil(posts.length / limit) || 1) }).map((_, i) => {
                        const pageNum = i + 1;
                        const isCurrentPage = page === pageNum;
                        
                        return (
                            <div 
                                key={pageNum} 
                                className={styles.pageItem}
                                onClick={() => setPage(pageNum)}
                            >
                                <span className={`${styles.googleO} ${isCurrentPage ? styles['o-active'] : styles['o-inactive']}`}>
                                    o
                                </span>
                                <span className={isCurrentPage ? styles.pageNumberActive : styles.pageNumber}>
                                    {pageNum}
                                </span>
                            </div>
                        );
                    })}

                    <span className={`${styles.googleText} ${styles.l}`}>s</span>
                    <span className={`${styles.googleText} ${styles.g1}`}>t</span>
                </div>

                <div className={styles.navLinks}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className={styles.navLink}
                        aria-label="Previous Page"
                    >
                        <ChevronLeft size={16} />
                        Prev
                    </button>
                    
                    <button
                        disabled={posts.length < limit}
                        onClick={() => setPage(p => p + 1)}
                        className={styles.navLink}
                        aria-label="Next Page"
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className={styles.paginationMeta}>
                    <div className={styles.paginationSection}>
                        <label htmlFor="limitInput">Limit:</label>
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
                    <span>
                        Total: {posts.length} entries
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

            {viewingPost && (
                <div className={styles.modalOverlay} onClick={() => setViewingPost(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Post Details</h3>
                            <button 
                                className={styles.closeBtn}
                                onClick={() => setViewingPost(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailItem}>
                                <div className={styles.detailUserId}>Post #{viewingPost.id}</div>
                            </div>
                            <div className={styles.detailItem}>
                                <h4 className={styles.postTitle} style={{ minHeight: 'auto', WebkitLineClamp: 'unset', height: 'auto', textAlign: 'left' }}>
                                    {viewingPost.title}
                                </h4>
                            </div>
                            <div className={styles.detailItem}>
                                <p className={styles.postBody} style={{ minHeight: 'auto', WebkitLineClamp: 'unset', height: 'auto', textAlign: 'left' }}>
                                    {viewingPost.body}
                                </p>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button onClick={() => setViewingPost(null)} className={styles.btnPrimary}>Close</button>
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
