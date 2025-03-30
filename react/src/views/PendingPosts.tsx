import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import parse from "html-react-parser";
import { DOMNode } from "html-react-parser";
import { Post, PaginationMeta } from "../types";

export default function PendingPosts() {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        type: "",
    });
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        total: 0,
        last_page: 1,
    });

    useEffect(() => {
        getPosts();
    }, []);

    // Auto-hide notification after 3 seconds
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const getPosts = (page = 1) => {
        setLoading(true);
        axiosClient
            .get(`/pending-posts?page=${page}`)
            .then(({ data }) => {
                console.log("API Response:", data);
                setPosts(data.data);
                setPagination({
                    current_page: data.meta.current_page,
                    total: data.meta.total,
                    last_page: data.meta.last_page,
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error("API Error:", err);
                setError("Error loading pending posts");
                setLoading(false);
            });
    };

    const onPageClick = (page: number) => {
        getPosts(page);
    };

    // Function to accept a post
    const handleAcceptPost = () => {
        if (!selectedPost) return;

        if (
            !confirm(
                `Are you sure you want to accept the post "${selectedPost.title}"?`
            )
        ) {
            return;
        }

        setActionLoading(true);

        // Make API call to approve the post
        axiosClient
            .put(`/pending-posts/${selectedPost.id}`, {
                status: "approved",
            })
            .then((response) => {
                console.log("Post accepted:", response.data);

                // Remove the post from the list
                setPosts(posts.filter((post) => post.id !== selectedPost.id));
                setNotification({
                    show: true,
                    message:
                        "Post has been accepted and published successfully",
                    type: "success",
                });
                setSelectedPost(null);
                setActionLoading(false);
            })
            .catch((error) => {
                console.error("Error accepting post:", error);
                setNotification({
                    show: true,
                    message:
                        "Failed to accept post: " +
                        (error.response?.data?.message || "Unknown error"),
                    type: "warning",
                });
                setActionLoading(false);
            });
    };

    // Function to discard/reject a post
    const handleDiscardPost = () => {
        if (!selectedPost) return;

        if (
            !confirm(
                `Are you sure you want to discard the post "${selectedPost.title}"?`
            )
        ) {
            return;
        }

        setActionLoading(true);

        // Make API call to delete the post
        axiosClient
            .delete(`/pending-posts/${selectedPost.id}`)
            .then((response) => {
                console.log("Post discarded:", response.data);

                // Remove the post from the list
                setPosts(posts.filter((post) => post.id !== selectedPost.id));
                setNotification({
                    show: true,
                    message: "Post has been discarded successfully",
                    type: "success",
                });
                setSelectedPost(null);
                setActionLoading(false);
            })
            .catch((error) => {
                console.error("Error discarding post:", error);
                setNotification({
                    show: true,
                    message:
                        "Failed to discard post: " +
                        (error.response?.data?.message || "Unknown error"),
                    type: "warning",
                });
                setActionLoading(false);
            });
    };

    // Function to process HTML content and handle images
    const processContent = (content: string) => {
        return parse(content, {
            replace: (domNode: DOMNode) => {
                if (
                    domNode &&
                    typeof domNode === "object" &&
                    "name" in domNode &&
                    domNode.name === "img"
                ) {
                    const imgNode = domNode as unknown as {
                        name: string;
                        attribs: { src: string; alt?: string };
                    };
                    return (
                        <img
                            src={imgNode.attribs.src}
                            alt={imgNode.attribs.alt || "Post image"}
                            onError={(
                                e: React.SyntheticEvent<HTMLImageElement, Event>
                            ) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "/placeholder-image.png";
                            }}
                            style={{ maxWidth: "100%", height: "auto" }}
                        />
                    );
                }
                return domNode;
            },
        });
    };

    return (
        <div className="animated fadeInDown">
            <h1>Pending Posts</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {notification.show && (
                <div className={`alert alert-${notification.type}`}>
                    {notification.message}
                </div>
            )}
            <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                <div style={{ flex: "0 0 350px" }}>
                    <div className="card">
                        <div className="card-header">
                            <h2>Posts Awaiting Approval</h2>
                        </div>
                        <div className="post-list">
                            {loading && (
                                <div className="text-center">Loading...</div>
                            )}
                            {!loading && posts.length === 0 && (
                                <div className="text-center">
                                    No pending posts found
                                </div>
                            )}
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className={`post-item ${
                                        selectedPost?.id === post.id
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() => setSelectedPost(post)}
                                >
                                    <h3>{post.title}</h3>
                                    <small>
                                        By {post.club?.name} -{" "}
                                        {new Date(
                                            post.created_at
                                        ).toLocaleDateString()}
                                    </small>
                                </div>
                            ))}
                        </div>
                        {!loading && pagination.last_page > 1 && (
                            <div className="card-footer">
                                <div className="pagination">
                                    {Array.from(
                                        { length: pagination.last_page },
                                        (_, i) => i + 1
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            className={`pagination-button ${
                                                pagination.current_page === page
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() => onPageClick(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ flex: "1" }}>
                    <div className="card">
                        {selectedPost ? (
                            <>
                                <div className="card-header">
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <h2>{selectedPost.title}</h2>
                                        <small>
                                            Submitted by{" "}
                                            {selectedPost.club?.name}
                                        </small>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="post-content">
                                        {processContent(selectedPost.content)}
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: "15px",
                                        }}
                                    >
                                        <button
                                            className="btn-delete"
                                            onClick={handleDiscardPost}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading
                                                ? "Processing..."
                                                : "Discard"}
                                        </button>
                                        <button
                                            className="btn-edit"
                                            onClick={handleAcceptPost}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading
                                                ? "Processing..."
                                                : "Accept"}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div
                                className="text-center"
                                style={{ padding: "40px" }}
                            >
                                <h3>Select a post to review</h3>
                                <p>
                                    Click on a post from the list to view its
                                    content
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
