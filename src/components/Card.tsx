import react, {useEffect, useState} from "react";
import cardService from "../services/cardService.ts";
import styles from "./Card.module.css";


type Card = {
    id: number;
    title: string;
    body: string;
    userId: number;
}

const Card: React.FC = () => {
    const [posts, setPosts] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const limit = 4;

    // Form state for new/edit post
    const [editingPost, setEditingPost] = useState<Card | null>(null);
    const [formTitle, setFormTitle] = useState("");
    const [formBody, setFormBody] = useState("");
    const [formUserId, setFormUserId] = useState<string>("1");
    const [isCreating, setIsCreating] = useState(false);

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
        loadPosts();
    }, [page]);

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
                alert(`Post created (POST) successfully with received ID: ${created.id}. Note: API does not persist data.`);
                setFormTitle("");
                setFormBody("");
                setFormUserId("1");
                setIsCreating(false);
                // Refresh or just let the user know it was sent
                await loadPosts();
            }
        } catch (err: any) {
            setError(err.message || "Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (method: "PUT" | "PATCH") => {
        if (!editingPost) return;
        try {
            setLoading(true);
            let updated: Card | undefined;
            if (method === "PUT") {
                // PUT: update all fields
                updated = await cardService.replacePost<Card>(editingPost.id, {
                    id: editingPost.id,
                    title: formTitle,
                    body: formBody,
                    userId: parseInt(formUserId) || editingPost.userId
                });
                if (updated) {
                    setPosts(prevPosts => prevPosts.map(p => p.id === updated!.id ? updated! : p));
                }
            } else {
                // PATCH: update only the title
                updated = await cardService.updatePost<Card>(editingPost.id, {
                    title: formTitle
                });
                if (updated) {
                    setPosts(prevPosts => prevPosts.map(p => p.id === updated!.id ? { ...p, title: updated!.title } : p));
                }
            }

            if (updated) {
                alert(`Post ${method === "PUT" ? "replaced" : "updated"} successfully!`);
                setEditingPost(null);
                setFormTitle("");
                setFormBody("");
                setFormUserId("1");
            }
        } catch (err: any) {
            setError(err.message || "Failed to update post");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            setLoading(true);
            await cardService.deletePost(id);

            // JSONPlaceholder doesn't persist deletes, so we must update local state
            setPosts(prevPosts => prevPosts.filter(post => post.id !== id));

            alert("Post deleted successfully (DELETE)!");
            // No need to call loadPosts() as it would fetch the old data from mock API
        } catch (err: any) {
            setError(err.message || "Failed to delete post");
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (post: Card) => {
        setEditingPost(post);
        setFormTitle(post.title);
        setFormBody(post.body);
        setFormUserId(post.userId.toString());
        setIsCreating(false);
    };

    const startCreating = () => {
        setIsCreating(true);
        setEditingPost(null);
        setFormTitle("");
        setFormBody("");
        setFormUserId("1");
    };

    if (loading && posts.length === 0) return <div className={styles.loadingMessage}>Loading posts...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Card Editor (Page {page})</h2>
                <button
                    onClick={startCreating}
                    className={styles.newPostBtn}
                >
                    + New Card
                </button>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            {(isCreating || editingPost) && (
                <div className={styles.formContainer}>
                    <h3>{isCreating ? "Create New Post" : `Edit Post #${editingPost?.id}`}</h3>
                    <div className={styles.formGroup}>
                        <label htmlFor="userId" className={styles.formLabel}>User ID</label>
                        <input
                            id="userId"
                            type="number"
                            value={formUserId}
                            onChange={(e) => setFormUserId(e.target.value)}
                            placeholder="Enter user ID"
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="title" className={styles.formLabel}>Title</label>
                        <input
                            id="title"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            placeholder="Enter post title"
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="body" className={styles.formLabel}>Body</label>
                        <textarea
                            id="body"
                            value={formBody}
                            onChange={(e) => setFormBody(e.target.value)}
                            placeholder="Enter post content"
                            className={styles.formTextarea}
                        />
                    </div>
                    <div className={styles.formButtonGroup}>
                        {isCreating ? (
                            <button onClick={handleCreate} className={styles.btnPrimary}>Create (POST)</button>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleUpdate("PATCH")}
                                    className={styles.btnPrimary}
                                    disabled={!editingPost}
                                >
                                    Update (PATCH)
                                </button>
                                <button
                                    onClick={() => handleUpdate("PUT")}
                                    className={styles.btnSecondary}
                                    disabled={!editingPost}
                                >
                                    Update  (PUT)
                                </button>
                            </>
                        )}
                        <button onClick={() => { setIsCreating(false); setEditingPost(null); }} className={styles.btnCancel}>Cancel</button>
                    </div>
                </div>
            )}

            <div className={styles.postsGrid}>
                {posts.map(post => (
                    <div key={post.id} className={styles.postCard}>
                        <div className={styles.postHeader}>
                            <h4 className={styles.postTitle}>{post.title}</h4>
                            <span className={styles.postId}>ID: {post.id}</span>
                        </div>
                        <p className={styles.postBody}>{post.body}</p>
                        <div className={styles.postActions}>
                            <button
                                onClick={() => {
                                    setEditingPost(post);
                                    setFormTitle(post.title);
                                    setFormBody(post.body);
                                    setFormUserId(post.userId.toString());
                                    setIsCreating(false);
                                }}
                                className={styles.btnSecondary}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(post.id)}
                                className={styles.btnDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.pagination}>
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className={page === 1 ? styles.btnPaginationDisabled : styles.btnPagination}
                >
                    Previous
                </button>
                <label htmlFor="pageInput">Page </label>
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
                    placeholder="Enter page number"
                    className={styles.paginationInput}
                />
                <button
                    disabled={posts.length < limit}
                    onClick={() => setPage(p => p + 1)}
                    className={posts.length < limit ? styles.btnPaginationDisabled : styles.btnPagination}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Card;


