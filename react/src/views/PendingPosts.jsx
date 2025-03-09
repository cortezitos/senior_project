import { useEffect, useState } from 'react';
import axiosClient from '../axios-client';
import parse from 'html-react-parser';

export default function PendingPosts() {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        total: 0,
        last_page: 1
    });

    useEffect(() => {
        getPosts();
    }, []);

    const getPosts = (page = 1) => {
        setLoading(true);
        axiosClient.get(`/pending-posts?page=${page}`)
            .then(({ data }) => {
                console.log('API Response:', data);
                setPosts(data.data);
                setPagination({
                    current_page: data.meta.current_page,
                    total: data.meta.total,
                    last_page: data.meta.last_page
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error('API Error:', err);
                setError('Error loading pending posts');
                setLoading(false);
            });
    };

    const onPageClick = (page) => {
        getPosts(page);
    };

    // Function to process HTML content and handle images
    const processContent = (content) => {
        return parse(content, {
            replace: (domNode) => {
                if (domNode.name === 'img') {
                    return (
                        <img
                            src={domNode.attribs.src}
                            alt={domNode.attribs.alt || 'Post image'}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-image.png'; // You can add a placeholder image
                            }}
                            style={{ maxWidth: '100%', height: 'auto' }}
                        />
                    );
                }
            }
        });
    };

    return (
        <div className="animated fadeInDown">
            <h1>Pending Posts</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <div style={{ flex: '0 0 350px' }}>
                    <div className="card">
                        <div className="card-header">
                            <h2>Posts Awaiting Approval</h2>
                        </div>
                        <div className="post-list">
                            {loading && <div className="text-center">Loading...</div>}
                            {!loading && posts.length === 0 && (
                                <div className="text-center">No pending posts found</div>
                            )}
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className={`post-item ${selectedPost?.id === post.id ? 'active' : ''}`}
                                    onClick={() => setSelectedPost(post)}
                                >
                                    <h3>{post.title}</h3>
                                    <small>
                                        By {post.club?.name} - {new Date(post.created_at).toLocaleDateString()}
                                    </small>
                                </div>
                            ))}
                        </div>
                        {!loading && pagination.last_page > 1 && (
                            <div className="card-footer">
                                <div className="pagination">
                                    {Array.from({length: pagination.last_page}, (_, i) => i + 1).map((page) => (
                                        <button 
                                            key={page} 
                                            className={`pagination-button ${pagination.current_page === page ? 'active' : ''}`}
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
                <div style={{ flex: '1' }}>
                    <div className="card">
                        {selectedPost ? (
                            <>
                                <div className="card-header">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h2>{selectedPost.title}</h2>
                                        <small>
                                            Submitted by {selectedPost.club?.name}
                                        </small>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="post-content">
                                        {processContent(selectedPost.content)}
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        {/* Buttons will be implemented later */}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center" style={{ padding: '40px' }}>
                                <h3>Select a post to review</h3>
                                <p>Click on a post from the list to view its content</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 