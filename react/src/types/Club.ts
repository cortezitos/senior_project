import Member from "./Member";

interface Club {
    id: number;
    name: string;
    description: string;
    logo_url: string;
    created_at: string;
    members: Member[];
    members_count: number;
}

export default Club;
