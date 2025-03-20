import { useEffect, useState } from 'react';
import axiosClient from '../axios-client';
import parse from 'html-react-parser';

export default function Dashboard() {
	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useState([]);
	const [error, setError] = useState('');
	const [expandedPosts, setExpandedPosts] = useState({});
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
		axiosClient.get(`/posts?page=${page}`)
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
				setError('Error loading posts');
				setLoading(false);
			});
	};

	const onPageClick = (page) => {
		getPosts(page);
		// Reset expanded posts when changing pages
		setExpandedPosts({});
	};

	// Format date to a readable format
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
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

	// Function to get a text-only preview of the content
	const getTextPreview = (htmlContent, maxLength = 500) => {
		// Create a div to hold the HTML content
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = htmlContent;
		// Extract text content
		let textContent = tempDiv.textContent || tempDiv.innerText || '';
		// Trim and limit length
		textContent = textContent.trim();
		if (textContent.length > maxLength) {
			textContent = textContent.substring(0, maxLength) + '...';
		}
		return textContent;
	};

	// Check if content is long enough to need expansion
	const isContentLong = (htmlContent) => {
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = htmlContent;
		const textContent = tempDiv.textContent || tempDiv.innerText || '';
		return textContent.trim().length > 500;
	};

	// Toggle expanded state of a post
	const togglePostExpansion = (postId) => {
		setExpandedPosts(prev => ({
			...prev,
			[postId]: !prev[postId]
		}));
	};

	return (
		<div className="animated fadeInDown">
			<h1>News Feed</h1>
			{error && <div className="alert alert-danger">{error}</div>}
			
			{loading ? (
				<div className="text-center" style={{ padding: '40px' }}>
					<h3>Loading news feed...</h3>
				</div>
			) : posts.length === 0 ? (
				<div className="text-center" style={{ padding: '40px' }}>
					<h3>No posts available</h3>
					<p>There are no published posts yet.</p>
				</div>
			) : (
				<div>
					<div className="news-feed" style={{ maxWidth: '800px', margin: '0 auto' }}>
						{posts.map((post) => {
							const contentIsLong = isContentLong(post.content);
							const isExpanded = expandedPosts[post.id] || false;

							return (
								<div 
									key={post.id} 
									className="card news-item" 
									style={{ 
										marginBottom: '25px',
										borderRadius: '8px',
										overflow: 'hidden',
										boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
									}}
								>
									<div className="card-body" style={{ padding: '20px' }}>
										<div style={{ 
											color: '#666', 
											fontSize: '0.9em', 
											marginBottom: '10px',
											display: 'flex',
											justifyContent: 'space-between'
										}}>
											<span>
												<strong>{post.club?.name}</strong>
											</span>
											<span>{formatDate(post.published_at)}</span>
										</div>
										
										<h2 style={{ 
											fontSize: '1.8em', 
											marginBottom: '15px',
											color: '#333'
										}}>
											{post.title}
										</h2>
										
										<div className="post-content" style={{ color: '#555', lineHeight: '1.6' }}>
											{isExpanded ? (
												// Show full content when expanded
												<div>{processContent(post.content)}</div>
											) : (
												// Show limited content when collapsed
												<div>
													{contentIsLong ? (
														<div>{getTextPreview(post.content, 500)}</div>
													) : (
														<div>{processContent(post.content)}</div>
													)}
												</div>
											)}
										</div>
										
										{contentIsLong && (
											<div style={{ 
												marginTop: '15px', 
												textAlign: 'center'
											}}>
												<button 
													onClick={() => togglePostExpansion(post.id)}
													style={{
														backgroundColor: 'transparent',
														border: '1px solid #5b08a7',
														color: '#5b08a7',
														padding: '8px 16px',
														borderRadius: '4px',
														fontWeight: '500',
														cursor: 'pointer',
														transition: 'all 0.2s ease'
													}}
													onMouseOver={(e) => {
														e.currentTarget.style.backgroundColor = '#f9f5ff';
													}}
													onMouseOut={(e) => {
														e.currentTarget.style.backgroundColor = 'transparent';
													}}
												>
													{isExpanded ? 'Show Less' : 'See All'}
												</button>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>

					{pagination.last_page > 1 && (
						<div style={{ 
							marginTop: '30px', 
							marginBottom: '40px',
							display: 'flex', 
							justifyContent: 'center' 
						}}>
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
			)}
		</div>
	);
}
