import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosClient from "../axios-client";

export default function ClubForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const [club, setClub] = useState({
        id: null,
        name: '',
        description: '',
        logo_url: ''
    });

    if (id) {
        useEffect(() => {
            setLoading(true);
            axiosClient.get(`/clubs/${id}`)
                .then(({ data }) => {
                    setLoading(false);
                    setClub(data);
                })
                .catch(() => {
                    setLoading(false);
                });
        }, []);
    }

    const onSubmit = (ev) => {
        ev.preventDefault();
        if (club.id) {
            axiosClient.put(`/clubs/${club.id}`, club)
                .then(() => {
                    navigate('/manage-clubs');
                })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        } else {
            axiosClient.post('/clubs', club)
                .then(() => {
                    navigate('/manage-clubs');
                })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        }
    };

    return (
        <div>
            {club.id && <h1>Update Club: {club.name}</h1>}
            {!club.id && <h1>New Club</h1>}
            <div className="card animated fadeInDown">
                {loading && (
                    <div className="text-center">Loading...</div>
                )}
                {errors && <div className="alert">
                    {Object.keys(errors).map(key => (
                        <p key={key}>{errors[key][0]}</p>
                    ))}
                </div>}
                {!loading && (
                    <form onSubmit={onSubmit}>
                        <input
                            value={club.name}
                            onChange={ev => setClub({...club, name: ev.target.value})}
                            placeholder="Club Name"
                        />
                        <textarea
                            value={club.description}
                            onChange={ev => setClub({...club, description: ev.target.value})}
                            placeholder="Club Description"
                            rows="5"
                            className="form-textarea"
                        />
                        <input
                            value={club.logo_url}
                            onChange={ev => setClub({...club, logo_url: ev.target.value})}
                            placeholder="Logo URL"
                        />
                        <button className="btn">Save</button>
                    </form>
                )}
            </div>
        </div>
    );
} 