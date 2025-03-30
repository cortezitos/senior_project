import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../axios-client";
import { Club, Member } from "../types";

export default function ClubMemberForm() {
    const { id } = useParams();
    const [club, setClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [newMember, setNewMember] = useState({
        user_id: "",
        role: "member",
    });

    useEffect(() => {
        getClub();
    }, []);

    const getClub = () => {
        setLoading(true);
        axiosClient
            .get(`/clubs/${id}?with_members=true`)
            .then(({ data }: { data: Club }) => {
                setClub(data);
                setMembers(data.members || []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const onSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        setErrors(null);

        axiosClient
            .post(`/clubs/${id}/members`, newMember)
            .then(() => {
                // Refresh the members list
                getClub();
                // Reset the form
                setNewMember({
                    user_id: "",
                    role: "member",
                });
            })
            .catch((err: any) => {
                const response = err.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                }
            });
    };

    const onRemoveMember = (memberId: number) => {
        if (!window.confirm("Are you sure you want to remove this member?")) {
            return;
        }

        axiosClient.delete(`/clubs/${id}/members/${memberId}`).then(() => {
            getClub();
        });
    };

    const onUpdateRole = (memberId: number, newRole: string) => {
        axiosClient
            .put(`/clubs/${id}/members/${memberId}`, { role: newRole })
            .then(() => {
                getClub();
            });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Manage Members: {club?.name}</h1>
            <div className="card animated fadeInDown">
                <div className="members-section">
                    <h2>Current Members</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Joined At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.id}>
                                    <td>{member.id}</td>
                                    <td>{member.name}</td>
                                    <td>
                                        <select
                                            value={member.role}
                                            onChange={(ev) =>
                                                onUpdateRole(
                                                    member.id,
                                                    ev.target.value
                                                )
                                            }
                                        >
                                            <option value="member">
                                                Member
                                            </option>
                                            <option value="president">
                                                President
                                            </option>
                                            <option value="event-manager">
                                                Event Manager
                                            </option>
                                            <option value="treasury">
                                                Treasury
                                            </option>
                                            <option value="pr">PR</option>
                                        </select>
                                    </td>
                                    <td>{member.created_at}</td>
                                    <td>
                                        <button
                                            onClick={() =>
                                                onRemoveMember(member.id)
                                            }
                                            className="btn-delete"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="add-member-section">
                    <h2>Add New Member</h2>
                    {errors && (
                        <div className="alert">
                            {Object.keys(errors).map((key) => (
                                <p key={key}>{errors[key][0]}</p>
                            ))}
                        </div>
                    )}
                    <form onSubmit={onSubmit}>
                        <input
                            type="number"
                            value={newMember.user_id}
                            onChange={(ev) =>
                                setNewMember({
                                    ...newMember,
                                    user_id: ev.target.value,
                                })
                            }
                            placeholder="User ID"
                        />
                        <select
                            value={newMember.role}
                            onChange={(ev) =>
                                setNewMember({
                                    ...newMember,
                                    role: ev.target.value,
                                })
                            }
                        >
                            <option value="member">Member</option>
                            <option value="president">President</option>
                            <option value="event-manager">Event Manager</option>
                            <option value="treasury">Treasury</option>
                            <option value="pr">PR</option>
                        </select>
                        <button type="submit" className="btn">
                            Add Member
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
