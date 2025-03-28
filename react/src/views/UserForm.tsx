import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosClient from "../axios-client";

export default function UserForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const [user, setUser] = useState({
        id: null,   
        name: '',
        email: '',
        password: '',
        role: 'student',
        year_of_study: '',
        major: '',
        school: ''
    });

    const [majors, setMajors] = useState({
        SEDS: ['Computer Science', 'Chemical Engineering'],
        SSH: ['Mathematics', 'Physics', 'Chemistry']
    });

    if (id) {
        useEffect(() => {
            setLoading(true);
            axiosClient.get(`/users/${id}`)
                .then(({ data }) => {
                    setLoading(false);
                    setUser(data);
                })
                .catch(() => {
                    setLoading(false);
                })
        }, []);
    }

    const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        if (user.id) {
            axiosClient.put(`/users/${user.id}`, user)
                .then(() => {
                    navigate('/users');
                })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                })
        } else {
            axiosClient.post('/users', user)
                .then(() => {
                    navigate('/users');
                })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                })
        }
    }

	return (
		<div>
            {user.id && <h1>Update User {user.name}</h1>}
            {!user.id && <h1>New User</h1>}
            <div className="card animated fadeInDown">
                {loading && (
                    <div className="text-center">Loading...</div>
                )}
                {errors && <div className="alert">
                    {Object.keys(errors).map(key => (
                        <p key={key}>{errors[key][0]}</p>
                    ))}
                </div>}
                {!loading && 
                <form onSubmit={onSubmit}>
                    <input value={user.name} onChange={(ev) => setUser({...user, name: ev.target.value})} placeholder="Name"/>
                    <input type="email" value={user.email} onChange={(ev) => setUser({...user, email: ev.target.value})} placeholder="Email"/>
                    <input type="password" onChange={(ev) => setUser({...user, password: ev.target.value})} placeholder="Password"/>
                    <select value={user.role} onChange={(ev) => setUser({...user, role: ev.target.value})}>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                    </select>
                    
                    {user.role === 'student' && (
                        <>
                            <select 
                                value={user.year_of_study} 
                                onChange={(ev) => setUser({...user, year_of_study: ev.target.value})}
                            >
                                <option value="">Select Year of Study</option>
                                {[1, 2, 3, 4, 5, 6].map((year) => (
                                    <option key={year} value={year}>Year {year}</option>
                                ))}
                            </select>

                            <select 
                                value={user.school} 
                                onChange={(ev) => setUser({...user, school: ev.target.value, major: ''})}
                            >
                                <option value="">Select School</option>
                                <option value="SEDS">SEDS</option>
                                <option value="SSH">SSH</option>
                            </select>

                            {user.school && (
                                <select 
                                    value={user.major} 
                                    onChange={(ev) => setUser({...user, major: ev.target.value})}
                                >
                                    <option value="">Select Major</option>
                                    {majors[user.school as keyof typeof majors].map((major) => (
                                        <option key={major} value={major}>{major}</option>
                                    ))}
                                </select>
                            )}
                        </>
                    )}
                    
                    <button className="btn">Save</button>
                </form>}
            </div>
		</div>
	)
}