import React, { useState, useEffect } from "react";
import cardService from "../services/cardService.ts";
import userService from "../services/userService.ts";
import styles from "./Card.module.css";

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
}

const EditPost: React.FC<EditPostProps> = ({ post, onBack, onSuccess }) => {
    const [formTitle, setFormTitle] = useState(post.title);
    const [formBody, setFormBody] = useState(post.body);
    const [formUserId, setFormUserId] = useState(post.userId.toString());
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [users, setUsers] = useState<{id:number;name:string}[]>([]);

    useEffect(() => {
        // fetch users
        userService.getUsers<{id:number;name:string}[]>()
            .then(res => res && setUsers(res))
            .catch(console.error);
    }, []);

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
                <button 
                    className={styles.editPageCloseBtn}
                    onClick={onBack}
                >
                    ← Back to Cards
                </button>
                <div className={styles.editPageContent}>
                    {/* <div className={styles.editPagePreview}>
                        <h2>Current Post</h2>
                        <div className={styles.previewBox}>
                            <div className={styles.previewField}>
                                <label>ID:</label>
                                <p>{post.id}</p>
                            </div>
                            <div className={styles.previewField}>
                                <label>User:</label>
                                <p>{users.find(u => u.id === post.userId)?.name || post.userId}</p>
                            </div>
                            <div className={styles.previewField}>
                                <label>Title:</label>
                                <p>{post.title}</p>
                            </div>
                            <div className={styles.previewField}>
                                <label>Body:</label>
                                <p>{post.body}</p>
                            </div>
                        </div>
                    </div> */}
                    <div className={styles.editPageForm}>
                        <h2>Edit Post</h2>
                        <div className={styles.formGroup}>
                            <label htmlFor="editUserId" className={styles.formLabel}>User</label>
                            <select
                                id="editUserId"
                                value={formUserId}
                                onChange={(e) => setFormUserId(e.target.value)}
                                className={styles.formInput}
                            >
                                <option value="">Select user</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="editTitle" className={styles.formLabel}>Title</label>
                            <input
                                id="editTitle"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="Enter post title"
                                className={styles.formInput}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="editBody" className={styles.formLabel}>Body</label>
                            <textarea
                                id="editBody"
                                value={formBody}
                                onChange={(e) => setFormBody(e.target.value)}
                                placeholder="Enter post content"
                                className={styles.formTextarea}
                            />
                        </div>
                        <div className={styles.editPageButtonGroup}>
                            <button
                                onClick={() => handleUpdate("PATCH")}
                                className={styles.btnPrimary}
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Update (PATCH)"}
                            </button>
                            <button
                                onClick={() => handleUpdate("PUT")}
                                className={styles.btnSecondary}
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Update (PUT)"}
                            </button>
                            <button onClick={onBack} className={styles.btnCancel} disabled={loading}>Cancel</button>
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
