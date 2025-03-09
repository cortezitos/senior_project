import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../axios-client";

export default function ClubProfile() {
    const { id } = useParams();
    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getClub();
    }, []);

    const getClub = () => {
        setLoading(true);
        axiosClient.get(`/clubs/${id}?with_members=true`)
            .then(({ data }) => {
                setClub(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (!club) {
        return <div className="text-center">Club not found</div>;
    }

    return (
        <div className="club-profile animated fadeInDown">
            <div className="club-header-banner">
                <div className="club-header-content">
                    {club.logo_url && (
                        <img 
                            src={club.logo_url} 
                            alt={club.name} 
                            className="club-profile-logo"
                        />
                    )}
                    <div className="club-header-info">
                        <h1>{club.name}</h1>
                        <div className="club-quick-stats">
                            <span className="stat-item">
                                <i className="fas fa-users"></i>
                                {club.members_count} members
                            </span>
                            <span className="stat-item">
                                <i className="fas fa-calendar"></i>
                                Created: {new Date(club.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="club-content">
                <div className="club-info">
                    <div className="section-header">
                        <h2>About the Club</h2>
                    </div>
                    <div className="content-card">
                        <p className="club-description">{club.description}</p>
                    </div>
                </div>

                <div className="club-members-list">
                    <div className="section-header">
                        <h2>Club Members</h2>
                    </div>
                    <div className="content-card">
                        <div className="members-grid">
                            <div className="leadership-section">
                                <h3>
                                    <i className="fas fa-star"></i>
                                    Leadership Team
                                </h3>
                                <ul className="members-list">
                                    {club.members
                                        .filter(member => member.role !== 'member')
                                        .map(member => (
                                            <li key={member.id} className="member-item">
                                                <div className="member-info">
                                                    <span className="member-name">{member.name}</span>
                                                    <span className="member-role">{member.role}</span>
                                                </div>
                                                <span className="member-joined">
                                                    Joined {new Date(member.joined_at).toLocaleDateString()}
                                                </span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>

                            <div className="members-section">
                                <h3>
                                    <i className="fas fa-users"></i>
                                    Members
                                </h3>
                                <ul className="members-list">
                                    {club.members
                                        .filter(member => member.role === 'member')
                                        .map(member => (
                                            <li key={member.id} className="member-item">
                                                <div className="member-info">
                                                    <span className="member-name">{member.name}</span>
                                                </div>
                                                <span className="member-joined">
                                                    Joined {new Date(member.joined_at).toLocaleDateString()}
                                                </span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}