import { useState, useEffect } from "react";
import axiosClient from "../axios-client";
import { Link } from "react-router-dom";

export default function Clubs() {
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

    const onPageClick = (page) => {
        getClubs(page);
    };

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>Clubs</h1>
            </div>
            <div className="card animated fadeInDown">
                {loading && (
                    <div className="text-center">
                        Loading...
                    </div>
                )}
                {!loading && (
                    <div className="clubs-grid">
                        {clubs.map((club) => (
                            <div key={club.id} className="club-card">
                                {club.logo_url && (
                                    <img 
                                        src={club.logo_url} 
                                        alt={club.name} 
                                        className="club-logo"
                                    />
                                )}
                                <h2>{club.name}</h2>
                                <p className="club-description">{club.description}</p>
                                <div className="club-stats">
                                    <span>{club.members_count} members</span>
                                </div>
                                <div className="club-members">
                                    <h3>Leadership</h3>
                                    {club.members && (
                                        <ul>
                                            {club.members
                                                .filter(member => member.role !== 'member')
                                                .map(member => (
                                                    <li key={member.id}>
                                                        <Link to={`/profile/${member.id}`} className="name-link">
                                                            {member.name}
                                                        </Link>
                                                        <span className="member-role"> - {member.role}</span>
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
