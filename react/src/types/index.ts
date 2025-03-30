import Club from "./Club";
import Member from "./Member";
import Post from "./Post";
import User from "./User";

interface PaginationMeta {
    current_page: number;
    total: number;
    last_page: number;
}

interface ApiResponse {
    data: Post[];
    meta: PaginationMeta;
}

export type { Club, Member, Post, PaginationMeta, ApiResponse, User };
