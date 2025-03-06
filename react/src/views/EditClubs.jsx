import { useState, useEffect } from "react";
import axiosClient from "../axios-client";
import { Link } from "react-router-dom";

export default function EditClubs() {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total: 0,
        last_page: 1
    });

    useEffect(() => {
        getClubs();
    }, []);

    const getClubs = (page = 1) => {
        setLoading(true);
        axiosClient.get(`/clubs?page=${page}&with_members=true`)
            .then(({ data }) => {
                setLoading(false);
                setClubs(data.data);
                setPagination({
                    current_page: data.meta.current_page,
                    total: data.meta.total,
                    last_page: data.meta.last_page
                });
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const onDelete = (club) => {
        if (!window.confirm(`Are you sure you want to delete the club "${club.name}"?`)) {
            return;
        }
        axiosClient.delete(`/clubs/${club.id}`)
            .then(() => {
                getClubs(pagination.current_page);
            });
    };

    const onPageClick = (page) => {
        getClubs(page);
    };

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>Manage Clubs</h1>
                <Link to="/manage-clubs/new" className="btn-add">Add new club</Link>
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Members</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    {loading && (
                        <tbody>
                            <tr>
                                <td colSpan="5" className="text-center">
                                    Loading...
                                </td>
                            </tr>
                        </tbody>
                    )}
                    {!loading && (
                        <tbody>
                            {clubs.map((club) => (
                                <tr key={club.id}>
                                    <td>{club.id}</td>
                                    <td>
                                        <Link to={`/clubs/${club.id}`} className="name-link">
                                            {club.name}
                                        </Link>
                                    </td>
                                    <td>{club.members_count}</td>
                                    <td>{club.created_at}</td>
                                    <td>
                                        <Link className="btn-edit" to={`/manage-clubs/${club.id}/edit`}>Edit</Link>
                                        &nbsp;
                                        <Link className="btn-members" to={`/manage-clubs/${club.id}/members`}>Members</Link>
                                        &nbsp;
                                        <button onClick={() => onDelete(club)} className="btn-delete">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
                {!loading && pagination.last_page > 1 && (
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
                )}
            </div>
        </div>
    );
}