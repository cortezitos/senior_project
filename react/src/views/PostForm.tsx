import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import { Club, Member } from "../types";

interface FormErrors {
    [key: string]: string[];
}

interface Post {
    title: string;
    content: string;
    club_id: string | undefined;
}

export default function PostForm() {
    const { clubId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [club, setClub] = useState<Club | null>(null);
    const [isPreview, setIsPreview] = useState(false);
    const [post, setPost] = useState<Post>({
        title: "",
        content: "",
        club_id: clubId,
    });
    const [errors, setErrors] = useState<FormErrors | null>(null);

    useEffect(() => {
        // Fetch club details to verify president access
        axiosClient
            .get(`/clubs/${clubId}?with_members=true`)
            .then(({ data }) => {
                setClub(data);
                // Verify if current user is president
                const membership = data.members.find(
                    (member: Member) => member.id === currentUser.id
                );
                if (!membership || membership.role !== "president") {
                    navigate(`/clubs/${clubId}`);
                }
            })
            .catch(() => {
                navigate("/clubs");
            });
    }, [clubId, currentUser]);

    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
            ],
            ["link", "image"],
            ["clean"],
        ],
    };

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
    ];

    const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        setErrors(null);
        setLoading(true);

        axiosClient
            .post("/pending-posts", post)
            .then(({ data }) => {
                // Show success message
                alert("Post submitted successfully and is awaiting approval");
                navigate(`/clubs/${clubId}`);
            })
            .catch((err) => {
                setLoading(false);
                const response = err.response;
                if (response && response.status === 422) {
                    // Validation errors
                    setErrors(response.data.errors);
                } else if (response && response.status === 403) {
                    // Authorization error
                    setErrors({
                        authorization: [
                            "You are not authorized to create posts for this club.",
                        ],
                    });
                } else {
                    // General error
                    setErrors({
                        general: [
                            "An error occurred while creating the post. Please try again.",
                        ],
                    });
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
                onChange={(ev) => setPost({ ...post, title: ev.target.value })}
                placeholder="Post Title"
                className="post-title-input"
            />

            <div className="editor-container">
                <ReactQuill
                    theme="snow"
                    value={post.content}
                    onChange={(content: string) =>
                        setPost({ ...post, content })
                    }
                    modules={modules}
                    formats={formats}
                    placeholder="Write your post content here..."
                />
            </div>

            <div className="form-buttons">
                <div className="form-buttons-left">
                    <button
                        type="button"
                        onClick={togglePreview}
                        className="btn-preview"
                    >
                        <i className="fas fa-eye"></i>
                        Preview
                    </button>
                </div>
                <div className="form-buttons-right">
                    <button
                        type="button"
                        onClick={() => navigate(`/clubs/${clubId}`)}
                        className="btn-cancel"
                    >
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
                <h1 className="preview-title">
                    {post.title || "Untitled Post"}
                </h1>
                <div className="preview-meta">
                    <span>By {currentUser.name}</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div
                    className="preview-body"
                    dangerouslySetInnerHTML={{
                        __html: post.content || "No content yet...",
                    }}
                />
            </div>
        </div>
    );

    return (
        <div className="post-form animated fadeInDown">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h1>Create New Post for {club?.name}</h1>
            </div>

            <div className="card">
                {loading && <div className="text-center">Loading...</div>}
                {errors && (
                    <div className="alert">
                        {Object.keys(errors).map((key) => (
                            <p key={key}>{errors[key][0]}</p>
                        ))}
                    </div>
                )}
                {!loading && (isPreview ? renderPreview() : renderEditor())}
            </div>
        </div>
    );
}
