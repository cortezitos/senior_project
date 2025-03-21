import { useState, useEffect } from 'react';
import axiosClient from '../axios-client';

export default function PublicRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingsLoading, setBookingsLoading] = useState({});
    const [error, setError] = useState('');
    const [roomBookings, setRoomBookings] = useState({});
    const [pagination, setPagination] = useState({
        current_page: 1,
        total: 0,
        last_page: 1
    });
    
    // Initialize with the current date
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        getRooms();
    }, []);
    
    useEffect(() => {
        // When date changes, clear the bookings
        setRoomBookings({});
        
        // Load bookings for each room with the new date
        if (rooms.length > 0) {
            rooms.forEach(room => {
                getBookingsForRoom(room.id);
            });
        }
    }, [selectedDate]);

    const getRooms = (page = 1) => {
        setLoading(true);
        setError('');
        
        axiosClient.get(`/rooms?page=${page}`)
            .then(({ data }) => {
                const fetchedRooms = data.data;
                setRooms(fetchedRooms);
                setPagination({
                    current_page: data.meta.current_page,
                    total: data.meta.total,
                    last_page: data.meta.last_page
                });
                setLoading(false);
                
                // Load bookings for each room
                fetchedRooms.forEach(room => {
                    getBookingsForRoom(room.id);
                });
            })
            .catch(err => {
                console.error('Error loading rooms:', err);
                setError('Failed to load rooms. Please try again later.');
                setLoading(false);
            });
    };
    
    const getBookingsForRoom = (roomId) => {
        setBookingsLoading(prev => ({ ...prev, [roomId]: true }));
        
        axiosClient.get(`/rooms/${roomId}/bookings`, {
            params: { date: selectedDate }
        })
            .then(({ data }) => {
                setRoomBookings(prev => ({
                    ...prev,
                    [roomId]: data.bookings
                }));
                setBookingsLoading(prev => ({ ...prev, [roomId]: false }));
            })
            .catch(err => {
                console.error(`Error loading bookings for room ${roomId}:`, err);
                setBookingsLoading(prev => ({ ...prev, [roomId]: false }));
            });
    };

    const onPageClick = (page) => {
        getRooms(page);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    // Format time in a more readable format
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const date = new Date(timeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="animated fadeInDown">
            <h1>Room Availability</h1>
            
            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <label htmlFor="date-select"><strong>Select Date:</strong></label>
                        <input 
                            type="date" 
                            id="date-select"
                            className="form-control" 
                            style={{ maxWidth: '200px' }}
                            value={selectedDate}
                            onChange={handleDateChange}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            
            {loading ? (
                <div className="text-center" style={{ padding: '30px' }}>
                    <h3>Loading rooms...</h3>
                </div>
            ) : (
                <>
                    {rooms.length === 0 ? (
                        <div className="alert alert-info">No rooms available.</div>
                    ) : (
                        <div className="rooms-grid">
                            {rooms.map(room => {
                                const bookings = roomBookings[room.id] || [];
                                const isLoading = bookingsLoading[room.id];
                                
                                return (
                                    <div key={room.id} className="card room-card">
                                        <div className="card-header">
                                            <h2>{room.name}</h2>
                                            <span className={`room-status ${room.is_available ? 'available' : 'unavailable'}`}>
                                                {room.is_available ? 'Available' : 'Unavailable'}
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <div className="room-details">
                                                {room.location && (
                                                    <p><strong>Location:</strong> {room.location}</p>
                                                )}
                                                {room.capacity && (
                                                    <p><strong>Capacity:</strong> {room.capacity} people</p>
                                                )}
                                                {room.description && (
                                                    <p><strong>Description:</strong> {room.description}</p>
                                                )}
                                            </div>

                                            <div className="room-schedule">
                                                <h3>Schedule for {new Date(selectedDate).toLocaleDateString()}</h3>
                                                {isLoading ? (
                                                    <div className="schedule-placeholder">
                                                        <p>Loading schedule...</p>
                                                    </div>
                                                ) : bookings.length === 0 ? (
                                                    <div className="schedule-placeholder">
                                                        <p>No bookings for this day</p>
                                                    </div>
                                                ) : (
                                                    <div className="timeline">
                                                        {bookings.map(booking => (
                                                            <div key={booking.id} className="booking-item">
                                                                <div className="booking-time">
                                                                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                                                </div>
                                                                <div className="booking-details">
                                                                    <p className="booking-club">{booking.club_name}</p>
                                                                    {booking.description && (
                                                                        <p className="booking-description">{booking.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {pagination.last_page > 1 && (
                        <div className="pagination-container" style={{ marginTop: '20px' }}>
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

            <style jsx>{`
                .rooms-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                }
                
                .room-card {
                    transition: transform 0.2s;
                }
                
                .room-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                
                .room-status {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8em;
                    font-weight: bold;
                }
                
                .available {
                    background-color: #e6f7e6;
                    color: #2e7d32;
                }
                
                .unavailable {
                    background-color: #ffebee;
                    color: #c62828;
                }
                
                .room-details {
                    margin-bottom: 20px;
                }
                
                .room-schedule {
                    background-color: #f5f5f5;
                    padding: 15px;
                    border-radius: 4px;
                }
                
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .schedule-placeholder {
                    min-height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #757575;
                }
                
                .timeline {
                    border-left: 2px solid #5b08a7;
                    padding-left: 15px;
                }
                
                .booking-item {
                    position: relative;
                    padding: 10px 0;
                    margin-bottom: 10px;
                }
                
                .booking-item:before {
                    content: '';
                    position: absolute;
                    left: -19px;
                    top: 15px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #5b08a7;
                }
                
                .booking-time {
                    font-weight: bold;
                    color: #5b08a7;
                    margin-bottom: 5px;
                }
                
                .booking-club {
                    margin: 0;
                    font-weight: 500;
                }
                
                .booking-description {
                    margin: 5px 0 0;
                    font-size: 0.9em;
                    color: #555;
                }
            `}</style>
        </div>
    );
} 