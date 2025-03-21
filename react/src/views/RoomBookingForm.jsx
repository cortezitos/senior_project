import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../axios-client';

export default function RoomBookingForm() {
    const navigate = useNavigate();
    const { clubId } = useParams();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [rooms, setRooms] = useState([]);
    const [club, setClub] = useState(null);
    const [minDate, setMinDate] = useState('');
    const [minEndTime, setMinEndTime] = useState('');

    const [booking, setBooking] = useState({
        room_id: '',
        club_id: clubId,
        start_time: '',
        end_time: '',
        roomdescription: '',
        visibility: 'public'
    });

    useEffect(() => {
        // Set minimum date to today
        const today = new Date();
        today.setMinutes(today.getMinutes() + 30); // Add 30 minutes to current time
        
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        
        const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        setMinDate(minDateTime);
        
        // Load rooms and club info
        loadRooms();
        getClubInfo();
    }, [clubId]);

    // Update end time minimum when start time changes
    useEffect(() => {
        if (booking.start_time) {
            setMinEndTime(booking.start_time);
            
            // If end time is before start time, update it
            if (booking.end_time && new Date(booking.end_time) <= new Date(booking.start_time)) {
                // Set end time to start time + 1 hour
                const startDate = new Date(booking.start_time);
                startDate.setHours(startDate.getHours() + 1);
                
                const year = startDate.getFullYear();
                const month = String(startDate.getMonth() + 1).padStart(2, '0');
                const day = String(startDate.getDate()).padStart(2, '0');
                const hours = String(startDate.getHours()).padStart(2, '0');
                const minutes = String(startDate.getMinutes()).padStart(2, '0');
                
                const newEndTime = `${year}-${month}-${day}T${hours}:${minutes}`;
                
                setBooking({
                    ...booking,
                    end_time: newEndTime
                });
            }
        }
    }, [booking.start_time]);

    // Auto-hide notification after 3 seconds
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const loadRooms = () => {
        setLoading(true);
        axiosClient.get('/rooms')
            .then(({ data }) => {
                setRooms(data.data.filter(room => room.is_available));
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setNotification({
                    show: true,
                    message: 'Failed to load rooms',
                    type: 'danger'
                });
                setLoading(false);
            });
    };

    const getClubInfo = () => {
        axiosClient.get(`/clubs/${clubId}`)
            .then(({ data }) => {
                setClub(data);
            })
            .catch(err => {
                console.error(err);
                setNotification({
                    show: true,
                    message: 'Failed to load club information',
                    type: 'danger'
                });
            });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrors({});
        setSubmitting(true);

        axiosClient.post('/room-bookings', booking)
            .then(response => {
                setNotification({
                    show: true,
                    message: 'Room booking request submitted successfully',
                    type: 'success'
                });
                
                // Reset form
                setBooking({
                    room_id: '',
                    club_id: clubId,
                    start_time: '',
                    end_time: '',
                    roomdescription: '',
                    visibility: 'public'
                });
                
                setSubmitting(false);
                
                // Redirect back to club profile after a delay
                setTimeout(() => {
                    navigate(`/clubs/${clubId}`);
                }, 2000);
            })
            .catch(error => {
                setSubmitting(false);
                if (error.response && error.response.status === 422) {
                    if (error.response.data.errors) {
                        setErrors(error.response.data.errors);
                    } else {
                        setNotification({
                            show: true,
                            message: error.response.data.message || 'Validation failed',
                            type: 'danger'
                        });
                    }
                } else if (error.response && error.response.data.message) {
                    setNotification({
                        show: true,
                        message: error.response.data.message,
                        type: 'danger'
                    });
                } else {
                    setNotification({
                        show: true,
                        message: 'An error occurred while submitting the booking',
                        type: 'danger'
                    });
                }
            });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBooking({
            ...booking,
            [name]: value
        });
    };

    return (
        <div className="animated fadeInDown">
            <div className="card">
                <div className="card-header">
                    <h1>Book a Room for {club?.name || 'Your Club'}</h1>
                </div>
                <div className="card-body">
                    {notification.show && (
                        <div className={`alert alert-${notification.type}`}>
                            {notification.message}
                        </div>
                    )}
                    
                    {loading ? (
                        <div className="text-center">Loading rooms...</div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="room_id">Select Room *</label>
                                <select
                                    id="room_id"
                                    name="room_id"
                                    className={errors.room_id ? 'form-control is-invalid' : 'form-control'}
                                    value={booking.room_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">-- Select a Room --</option>
                                    {rooms.map(room => (
                                        <option key={room.id} value={room.id}>
                                            {room.name} - Capacity: {room.capacity || 'N/A'} 
                                            {room.location ? ` (${room.location})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.room_id && <div className="invalid-feedback">{errors.room_id[0]}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="start_time">Start Time *</label>
                                <input
                                    id="start_time"
                                    type="datetime-local"
                                    name="start_time"
                                    className={errors.start_time ? 'form-control is-invalid' : 'form-control'}
                                    value={booking.start_time}
                                    onChange={handleInputChange}
                                    min={minDate}
                                    required
                                />
                                {errors.start_time && <div className="invalid-feedback">{errors.start_time[0]}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="end_time">End Time *</label>
                                <input
                                    id="end_time"
                                    type="datetime-local"
                                    name="end_time"
                                    className={errors.end_time ? 'form-control is-invalid' : 'form-control'}
                                    value={booking.end_time}
                                    onChange={handleInputChange}
                                    min={minEndTime}
                                    required
                                />
                                {errors.end_time && <div className="invalid-feedback">{errors.end_time[0]}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="roomdescription">Description (Purpose of booking) *</label>
                                <textarea
                                    id="roomdescription"
                                    name="roomdescription"
                                    className={errors.roomdescription ? 'form-control is-invalid' : 'form-control'}
                                    value={booking.roomdescription}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Describe the purpose of this booking"
                                    required
                                />
                                {errors.roomdescription && <div className="invalid-feedback">{errors.roomdescription[0]}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label>Visibility *</label>
                                <div className="radio-options">
                                    <div className="radio-option">
                                        <input
                                            type="radio"
                                            id="visibility-public"
                                            name="visibility"
                                            value="public"
                                            checked={booking.visibility === 'public'}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="visibility-public">
                                            <strong>Public</strong> - Visible to everyone in the room calendar
                                        </label>
                                    </div>
                                    <div className="radio-option">
                                        <input
                                            type="radio"
                                            id="visibility-club-only"
                                            name="visibility"
                                            value="club_only"
                                            checked={booking.visibility === 'club_only'}
                                            onChange={handleInputChange}
                                        />
                                        <label htmlFor="visibility-club-only">
                                            <strong>Club Only</strong> - Only visible to your club members
                                        </label>
                                    </div>
                                </div>
                                {errors.visibility && <div className="invalid-feedback d-block">{errors.visibility[0]}</div>}
                            </div>
                            
                            <div className="booking-notice">
                                <p><strong>Note:</strong> Room bookings require admin approval before they are confirmed.</p>
                            </div>
                            
                            <div className="form-buttons">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => navigate(`/clubs/${clubId}`)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-add" 
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Book Room'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                .radio-options {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 5px;
                }
                
                .radio-option {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                }
                
                .radio-option input {
                    margin-top: 3px;
                }
                
                .booking-notice {
                    margin: 20px 0;
                    padding: 10px 15px;
                    background-color: #f8f9fa;
                    border-left: 4px solid #5b08a7;
                    border-radius: 4px;
                }
                
                .form-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
            `}</style>
        </div>
    );
}
