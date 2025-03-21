import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../axios-client';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [pagination, setPagination] = useState({
        current_page: 1,
        total: 0,
        last_page: 1
    });

    useEffect(() => {
        getRooms();
    }, []);

    // Auto-hide notification after 3 seconds
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const getRooms = (page = 1) => {
        setLoading(true);
        axiosClient.get(`/rooms?page=${page}`)
            .then(({ data }) => {
                setRooms(data.data);
                setPagination({
                    current_page: data.meta.current_page,
                    total: data.meta.total,
                    last_page: data.meta.last_page
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const onPageClick = (page) => {
        getRooms(page);
    };

    const onDeleteClick = (room) => {
        if (!window.confirm(`Are you sure you want to delete room "${room.name}"?`)) {
            return;
        }

        axiosClient.delete(`/rooms/${room.id}`)
            .then(() => {
                // Refresh the rooms list
                getRooms(pagination.current_page);
                setNotification({
                    show: true,
                    message: 'Room deleted successfully',
                    type: 'success'
                });
            })
            .catch(err => {
                console.error(err);
                setNotification({
                    show: true,
                    message: 'Error deleting room',
                    type: 'danger'
                });
            });
    };

    return (
        <div className="animated fadeInDown">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Rooms</h1>
                <Link to="/rooms/new" className="btn-add">Add Room</Link>
            </div>

            {notification.show && (
                <div className={`alert alert-${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {loading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <>
                    <div className="card">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Capacity</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">No rooms found</td>
                                    </tr>
                                ) : (
                                    rooms.map(room => (
                                        <tr key={room.id}>
                                            <td>{room.id}</td>
                                            <td>{room.name}</td>
                                            <td>{room.capacity || 'N/A'}</td>
                                            <td>{room.location || 'N/A'}</td>
                                            <td>
                                                <span className={`status ${room.is_available ? 'active' : 'inactive'}`}>
                                                    {room.is_available ? 'Available' : 'Not Available'}
                                                </span>
                                            </td>
                                            <td>
                                                <Link className="btn-edit" to={`/rooms/${room.id}/edit`}>Edit</Link> &nbsp;
                                                <button className="btn-delete" onClick={() => onDeleteClick(room)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination.last_page > 1 && (
                        <div className="pagination-container">
                            <div className="pagination">
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        className={`pagination-button ${pagination.current_page === page ? 'active' : ''}`}
                                        onClick={() => onPageClick(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 