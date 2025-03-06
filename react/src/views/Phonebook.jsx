import { useState, useEffect } from "react";
import axiosClient from "../axios-client";
import { Link } from "react-router-dom";

export default function Phonebook() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total: 0,
        last_page: 1
    });

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = (page = 1) => {
        setLoading(true);
        axiosClient.get(`/users?page=${page}`)
            .then(({ data }) => {
                setLoading(false);
                setUsers(data.data);
                setPagination({
                    current_page: data.meta.current_page,
                    total: data.meta.total,
                    last_page: data.meta.last_page
                });
            })
            .catch(() => {
                setLoading(false);
            })
    }

    const onPageClick = (page) => {
        getUsers(page);
    }

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>Phonebook</h1>
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    {loading && (
                        <tbody>
                            <tr>
                                <td colSpan="4" className="text-center">
                                    Loading...
                                </td>
                            </tr>
                        </tbody>
                    )}
                    {!loading && (
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>
                                        <Link to={`/profile/${u.id}`} className="name-link">
                                            {u.name}
                                        </Link>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>{u.role}</td>
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
    )
}
