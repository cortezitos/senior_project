import Club from "./Club";

interface Post {
    id: number;
    title: string;
    content: string;
    published_at: string;
    club?: Club;
    created_at: string;
}

export default Post;
