import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axiosClient from '../axios-client';
import { useStateContext } from '../contexts/ContextProvider';

export default function PostForm() {
    const { clubId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [club, setClub] = useState(null);
    const [isPreview, setIsPreview] = useState(false);
    const [post, setPost] = useState({
        title: '',
        content: '',
        club_id: clubId
    });
    const [errors, setErrors] = useState(null);

    useEffect(() => {
        // Fetch club details to verify president access
        axiosClient.get(`/clubs/${clubId}?with_members=true`)
            .then(({ data }) => {
                setClub(data);
                // Verify if current user is president
                const membership = data.members.find(member => member.id === currentUser.id);
                if (!membership || membership.role !== 'president') {
                    navigate(`/clubs/${clubId}`);
                }
            })
            .catch(() => {
                navigate('/clubs');
            });
    }, [clubId, currentUser]);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ];

    const onSubmit = (ev) => {
        ev.preventDefault();
        setErrors(null);
        setLoading(true);

        axiosClient.post('/posts', post)
            .then(() => {
                navigate(`/clubs/${clubId}`);
            })
            .catch(err => {
                setLoading(false);
                const response = err.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                }
            });
    };

    const togglePreview = () => {
        setIsPreview(!isPreview);
    };

    const renderEditor = () => (
        <form onSubmit={onSubmit}>
            <input
                value={post.title}
                onChange={ev => setPost({...post, title: ev.target.value})}
                placeholder="Post Title"
                className="post-title-input"
            />
            
            <div className="editor-container">
                <ReactQuill
                    theme="snow"
                    value={post.content}
                    onChange={(content) => setPost({...post, content})}
                    modules={modules}
                    formats={formats}
                    placeholder="Write your post content here..."
                />
            </div>
            
            <div className="form-buttons">
                <div className="form-buttons-left">
                    <button type="button" onClick={togglePreview} className="btn-preview">
                        <i className="fas fa-eye"></i>
                        Preview
                    </button>
                </div>
                <div className="form-buttons-right">
                    <button type="button" onClick={() => navigate(`/clubs/${clubId}`)} className="btn-cancel">
                        Cancel
                    </button>
                    <button type="submit" className="btn-submit">
                        Create Post
                    </button>
                </div>
            </div>
        </form>
    );

    const renderPreview = () => (
        <div className="post-preview">
            <div className="preview-header">
                <span className="preview-label">Preview Mode</span>
                <button onClick={togglePreview} className="btn-preview">
                    <i className="fas fa-edit"></i>
                    Back to Edit
                </button>
            </div>
            <div className="preview-content">
                <h1 className="preview-title">{post.title || 'Untitled Post'}</h1>
                <div className="preview-meta">
                    <span>By {currentUser.name}</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div 
                    className="preview-body"
                    dangerouslySetInnerHTML={{ __html: post.content || 'No content yet...' }}
                />
            </div>
        </div>
    );

    return (
        <div className="post-form animated fadeInDown">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>Create New Post for {club?.name}</h1>
            </div>
            
            <div className="card">
                {loading && (
                    <div className="text-center">Loading...</div>
                )}
                {errors && <div className="alert">
                    {Object.keys(errors).map(key => (
                        <p key={key}>{errors[key][0]}</p>
                    ))}
                </div>}
                {!loading && (
                    isPreview ? renderPreview() : renderEditor()
                )}
            </div>
        </div>
    );
} 