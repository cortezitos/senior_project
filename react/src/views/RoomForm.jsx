import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../axios-client';

export default function RoomForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [room, setRoom] = useState({
        name: '',
        description: '',
        capacity: '',
        location: '',
        is_available: true
    });

    // If id is provided, load the room data for editing
    useEffect(() => {
        if (id) {
            setLoading(true);
            axiosClient.get(`/rooms/${id}`)
                .then(({ data }) => {
                    setRoom(data.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [id]);

    // Auto-hide notification after 3 seconds
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleSubmit = (ev) => {
        ev.preventDefault();
        setErrors({});
        setLoading(true);

        // Convert capacity to number
        const roomData = {
            ...room,
            capacity: room.capacity ? parseInt(room.capacity, 10) : null,
            is_available: Boolean(room.is_available)
        };

        if (id) {
            // Update existing room
            axiosClient.put(`/rooms/${id}`, roomData)
                .then(() => {
                    setNotification({
                        show: true,
                        message: 'Room updated successfully',
                        type: 'success'
                    });
                    setLoading(false);
                })
                .catch(err => {
                    setLoading(false);
                    if (err.response && err.response.status === 422) {
                        setErrors(err.response.data.errors);
                    } else {
                        setNotification({
                            show: true,
                            message: 'An error occurred',
                            type: 'danger'
                        });
                    }
                });
        } else {
            // Create new room
            axiosClient.post('/rooms', roomData)
                .then(() => {
                    setNotification({
                        show: true,
                        message: 'Room created successfully',
                        type: 'success'
                    });
                    setLoading(false);
                    
                    // Reset form after successful creation
                    setRoom({
                        name: '',
                        description: '',
                        capacity: '',
                        location: '',
                        is_available: true
                    });
                })
                .catch(err => {
                    setLoading(false);
                    if (err.response && err.response.status === 422) {
                        setErrors(err.response.data.errors);
                    } else {
                        setNotification({
                            show: true,
                            message: 'An error occurred',
                            type: 'danger'
                        });
                    }
                });
        }
    };

    return (
        <div className="animated fadeInDown">
            <div className="card">
                <div className="card-header">
                    <h1>{id ? 'Update Room' : 'Create Room'}</h1>
                </div>
                <div className="card-body">
                    {notification.show && (
                        <div className={`alert alert-${notification.type}`}>
                            {notification.message}
                        </div>
                    )}
                    
                    {loading ? (
                        <div className="text-center">Loading...</div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Room Name *</label>
                                <input
                                    id="name"
                                    type="text"
                                    className={errors.name ? 'form-control is-invalid' : 'form-control'}
                                    value={room.name}
                                    onChange={e => setRoom({...room, name: e.target.value})}
                                    placeholder="Enter room name"
                                    required
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    className={errors.description ? 'form-control is-invalid' : 'form-control'}
                                    value={room.description || ''}
                                    onChange={e => setRoom({...room, description: e.target.value})}
                                    placeholder="Enter room description"
                                    rows={4}
                                />
                                {errors.description && <div className="invalid-feedback">{errors.description[0]}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="capacity">Capacity</label>
                                <input
                                    id="capacity"
                                    type="number"
                                    className={errors.capacity ? 'form-control is-invalid' : 'form-control'}
                                    value={room.capacity || ''}
                                    onChange={e => setRoom({...room, capacity: e.target.value})}
                                    placeholder="Enter room capacity"
                                    min="1"
                                />
                                {errors.capacity && <div className="invalid-feedback">{errors.capacity[0]}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <input
                                    id="location"
                                    type="text"
                                    className={errors.location ? 'form-control is-invalid' : 'form-control'}
                                    value={room.location || ''}
                                    onChange={e => setRoom({...room, location: e.target.value})}
                                    placeholder="Enter room location"
                                />
                                {errors.location && <div className="invalid-feedback">{errors.location[0]}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="is_available">Availability</label>
                                <div>
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="is_available"
                                            id="available"
                                            value="1"
                                            checked={room.is_available === true}
                                            onChange={() => setRoom({...room, is_available: true})}
                                        />
                                        <label className="form-check-label" htmlFor="available">Available</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="is_available"
                                            id="not_available"
                                            value="0"
                                            checked={room.is_available === false}
                                            onChange={() => setRoom({...room, is_available: false})}
                                        />
                                        <label className="form-check-label" htmlFor="not_available">Not Available</label>
                                    </div>
                                </div>
                                {errors.is_available && <div className="invalid-feedback">{errors.is_available[0]}</div>}
                            </div>
                            
                            <div className="form-buttons">
                                <button type="button" className="btn btn-secondary" onClick={() => navigate('/rooms')}>Cancel</button>
                                <button type="submit" className="btn-add" disabled={loading}>
                                    {loading ? 'Saving...' : (id ? 'Update Room' : 'Create Room')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
} 