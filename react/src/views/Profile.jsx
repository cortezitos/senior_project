import { useStateContext } from "../contexts/ContextProvider";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosClient from "../axios-client";

export default function Profile() {
    const { user: currentUser } = useStateContext();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (id) {
            // If ID is provided, fetch that specific user
            setLoading(true);
            axiosClient.get(`/users/${id}`)
                .then(({ data }) => {
                    setUser(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        } else {
            // If no ID, show current user's profile
            setUser(currentUser);
        }
    }, [id, currentUser]);

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div className="card animated fadeInDown">
            <h1>Profile</h1>
            <table>
                <tbody>
                    <tr>
                        <td><strong>Name:</strong></td>
                        <td>{user.name}</td>
                    </tr>
                    <tr>
                        <td><strong>Email:</strong></td>
                        <td>{user.email}</td>
                    </tr>
                    <tr>
                        <td><strong>Role:</strong></td>
                        <td>{user.role}</td>
                    </tr>
                    {user.role === 'student' && (
                        <>
                            <tr>
                                <td><strong>School:</strong></td>
                                <td>{user.school}</td>
                            </tr>
                            <tr>
                                <td><strong>Major:</strong></td>
                                <td>{user.major}</td>
                            </tr>
                            <tr>
                                <td><strong>Year of Study:</strong></td>
                                <td>{user.year_of_study}</td>
                            </tr>
                        </>
                    )}
                </tbody>
            </table>
        </div>
    );
}