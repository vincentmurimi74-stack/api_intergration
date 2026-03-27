import React, {useEffect, useState, useCallback} from "react";
import cardService from "../services/cardService";
import styles from "./Card.module.css";
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Search, Sparkles, Image, Tag, MapPin, User, Moon, Sun, LogOut, Settings, LayoutGrid, List } from 'lucide-react';


type PostType = {
    id: number;
    title: string;
    body: string;
    userId: number;
}

const Card: React.FC<{ 
    onEditPost: (post: PostType) => void; 
    refreshTrigger: number; 
    onLogout: () => void;
    isAuthenticated: boolean;
    onLoginRequired: (action?: { type: 'edit' | 'add' | 'view', post?: PostType }) => void;
    authError: string | null;
    pendingAction: { type: 'edit' | 'add' | 'view', post?: PostType } | null;
    onActionResolved: () => void;
}> = ({ onEditPost, refreshTrigger, onLogout, isAuthenticated, onLoginRequired, authError, pendingAction, onActionResolved }) => {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(4);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isContextExpanded, setIsContextExpanded] = useState(false);


    // Form state for new post
    const [formTitle, setFormTitle] = useState("");
    const [formBody, setFormBody] = useState("");
    const [formUserId, setFormUserId] = useState<string>("1");
    const [isCreating, setIsCreating] = useState(false);
    const [viewingPost, setViewingPost] = useState<PostType | null>(null);

    // Snackbar state
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; postId: number | null } | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 480);
        window.addEventListener('resize', handleResize);
        
        // Initialize search from URL
        const params = new URLSearchParams(window.location.search);
        const urlSearch = params.get('q');
        if (urlSearch) {
            setSearchQuery(urlSearch);
        }

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (searchQuery) {
            params.set('q', searchQuery);
        } else {
            params.delete('q');
        }
        const newRelativePathQuery = window.location.pathname + '?' + params.toString();
        window.history.replaceState(null, '', newRelativePathQuery);
    }, [searchQuery]);

    useEffect(() => {
        if (isAuthenticated && pendingAction) {
            if (pendingAction.type === 'add') {
                setIsCreating(true);
            } else if (pendingAction.type === 'edit' && pendingAction.post) {
                onEditPost(pendingAction.post);
            } else if (pendingAction.type === 'view' && pendingAction.post) {
                setViewingPost(pendingAction.post);
            }
            onActionResolved();
        }
    }, [isAuthenticated, pendingAction, onEditPost, onActionResolved]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

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
        if (!isAuthenticated) {
            onLoginRequired({ type: 'add' });
            return;
        }
        setSubmitAttempted(true);
        if (!formTitle.trim() || !formBody.trim()) return;

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
                setSubmitAttempted(false);
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
        if (!isAuthenticated) {
            onLoginRequired({ type: 'add' });
            return;
        }
        setIsCreating(true);
        setFormTitle("");
        setFormBody("");
        setFormUserId("1");
        setSubmitAttempted(false);
    };

    const handleContextClick = (action: string) => {
        setSnackbar({ message: `Navigating to ${action}...`, type: 'success' });
        setTimeout(() => setSnackbar(null), 3000);
        setIsContextExpanded(false);
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
                <div className={styles.headerActions}>
                    <div className={styles.profileContainer}>
                        {!isAuthenticated ? (
                            <button 
                                onClick={() => onLoginRequired()}
                                className={styles.newPostBtn}
                            >
                                <User size={18} className={styles.btnIconLeft} />
                                <span className={styles.btnText}>Login</span>
                            </button>
                        ) : (
                            <>
                                <button 
                                    className={styles.profileTrigger}
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    title="Profile Settings"
                                >
                                    <div className={styles.avatarMini}>VM</div>
                                </button>
                                
                                {isProfileOpen && (
                                    <>
                                        <div className={styles.dropdownOverlay} onClick={() => setIsProfileOpen(false)} />
                                        <div className={styles.profileDropdown}>
                                            <div className={styles.dropdownHeader}>
                                                <div className={styles.avatarLarge}>VM</div>
                                                <div className={styles.userInfo}>
                                                    <div className={styles.userName}>Vincent Murimi</div>
                                                    <div className={styles.userEmail}>vincent@example.com</div>
                                                </div>
                                            </div>
                                            <div className={styles.dropdownDivider} />
                                            <div className={styles.dropdownItem} onClick={() => { toggleTheme(); setIsProfileOpen(false); }}>
                                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                                                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                                            </div>
                                            <div className={styles.dropdownItem} onClick={() => setIsProfileOpen(false)}>
                                                <Settings size={18} />
                                                <span>Settings</span>
                                            </div>
                                            <div className={styles.dropdownDivider} />
                                            <div className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={() => { setIsProfileOpen(false); onLogout(); }}>
                                                <LogOut size={18} />
                                                <span>Logout</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.searchContainer}>
                <div className={styles.searchWrapper} title="Search">
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.floatingActions}>
                    <div className={styles.viewToggle}>
                        <button 
                            onClick={() => setViewMode('grid')} 
                            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeView : ''}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')} 
                            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.activeView : ''}`}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <button
                        onClick={startCreating}
                        className={styles.newPostBtn}
                        title="Create"
                    >
                        <Plus size={18} className={styles.btnIconLeft} />
                        <span className={styles.btnText}>Create</span>
                    </button>
                </div>
            </div>
            {authError && (
                <div className={styles.searchAlert} style={{ color: '#ef4444', marginBottom: '24px' }}>
                    {authError}
                </div>
            )}

            {error && <div className={styles.errorMessage}>{error}</div>}

            {isCreating && (
                <div className={styles.modalOverlay} onClick={() => { setIsCreating(false); setFormTitle(""); setFormBody(""); setFormUserId("1"); setSubmitAttempted(false); }}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Create</h3>
                            <button 
                                className={styles.closeBtn}
                                onClick={() => { setIsCreating(false); setFormTitle(""); setFormBody(""); setFormUserId("1"); setSubmitAttempted(false); }}
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
                                    className={`${styles.formInput} ${submitAttempted && !formTitle.trim() ? styles.errorInput : ""}`}
                                />
                                {submitAttempted && !formTitle.trim() && (
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
                                    className={`${styles.formTextarea} ${submitAttempted && !formBody.trim() ? styles.errorTextarea : ""}`}
                                />
                                {submitAttempted && !formBody.trim() && (
                                    <span className={styles.validationWarning}>Body content is required</span>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button 
                                onClick={handleCreate} 
                                className={styles.btnPrimary}
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Create"}
                            </button>
                            <button onClick={() => { setIsCreating(false); setFormTitle(""); setFormBody(""); setFormUserId("1"); setSubmitAttempted(false); }} className={styles.btnCancel}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`${styles.postsGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
                {filteredPosts.map(post => (
                    <div key={post.id} className={styles.postCard} onClick={() => {
                        if (!isAuthenticated) {
                            onLoginRequired({ type: 'view', post });
                        } else {
                            setViewingPost(post);
                        }
                    }}>
                        <div className={styles.postContent}>
                            <h4 className={styles.postTitle}>{post.title}</h4>
                            <p className={styles.postBody}>{post.body}</p>
                        </div>
                        <div className={styles.postActions}>
                            <button
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (!isAuthenticated) {
                                        onLoginRequired({ type: 'edit', post });
                                    } else {
                                        onEditPost(post);
                                    }
                                }}
                                className={styles.btnIcon}
                                aria-label="Edit post"
                                title="Edit Post"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(post.id); }}
                                className={styles.btnIconDelete}
                                aria-label="Delete post"
                                title="Delete Post"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.pagination}>
                <div className={styles.paginationBranding}>
                    <span className={styles.cardText}>Card</span>
                    <span className={styles.postText}>Post</span>
                </div>
                <div className={styles.paginationControls}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className={styles.navLink}
                        aria-label="Previous Page"
                        title="Previous Page"
                    >
                        <ChevronLeft size={18} strokeWidth={2.5} />
                        <span>Prev</span>
                    </button>

                    <div className={styles.pageNumbers}>
                        {(() => {
                            const totalPages = Math.ceil(posts.length / limit) || 1;
                            const maxVisible = isMobile ? 3 : 10;
                            const range = Math.floor(maxVisible / 2);
                            
                            let start = Math.max(1, page - range);
                            let end = Math.min(totalPages, start + maxVisible - 1);
                            
                            if (end - start + 1 < maxVisible) {
                                start = Math.max(1, end - maxVisible + 1);
                            }

                            const pages = [];
                            for (let i = start; i <= end; i++) {
                                pages.push(i);
                            }
                            
                            return pages.map(pageNum => {
                                const isCurrentPage = page === pageNum;
                                return (
                                    <button 
                                        key={pageNum} 
                                        className={`${styles.pageItem} ${isCurrentPage ? styles.pageItemActive : ""}`}
                                        onClick={() => setPage(pageNum)}
                                        title={`Go to page ${pageNum}`}
                                    >
                                        <span className={isCurrentPage ? styles.pageNumberActive : styles.pageNumber}>
                                            {pageNum}
                                        </span>
                                    </button>
                                );
                            });
                        })()}
                    </div>
                    
                    <button
                        disabled={posts.length < limit}
                        onClick={() => setPage(p => p + 1)}
                        className={styles.navLink}
                        aria-label="Next Page"
                    >
                        <span>Next</span>
                        <ChevronRight size={18} strokeWidth={2.5} />
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
