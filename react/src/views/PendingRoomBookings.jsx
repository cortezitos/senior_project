import { useState, useEffect } from 'react';
import axiosClient from '../axios-client';

export default function PendingRoomBookings() {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({});
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [pagination, setPagination] = useState({
        current_page: 1,
        total: 0,
        last_page: 1
    });
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        getBookings();
    }, [filter]);

    // Auto-hide notification after 3 seconds
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const getBookings = (page = 1) => {
        setLoading(true);
        axiosClient.get(`/room-bookings?page=${page}&status=${filter}`)
            .then(({ data }) => {
                setBookings(data.data);
                setPagination({
                    current_page: data.meta.current_page,
                    total: data.meta.total,
                    last_page: data.meta.last_page
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading bookings:', err);
                setLoading(false);
            });
    };

    const onPageClick = (page) => {
        getBookings(page);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return 'N/A';
        
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end - start;
        
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHrs === 0) {
            return `${diffMins} minutes`;
        } else if (diffMins === 0) {
            return `${diffHrs} hour${diffHrs > 1 ? 's' : ''}`;
        } else {
            return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
        }
    };

    const handleApprove = (booking) => {
        if (!confirm(`Are you sure you want to approve the booking for ${booking.roomname} by ${booking.club?.name}?`)) {
            return;
        }
        
        setActionLoading({ ...actionLoading, [booking.id]: 'approve' });
        
        axiosClient.put(`/room-bookings/${booking.id}`, {
            status: 'approved'
        })
            .then(response => {
                setNotification({
                    show: true,
                    message: 'Room booking has been approved successfully',
                    type: 'success'
                });
                
                // If we're viewing "pending" bookings, remove the approved booking from the list
                if (filter === 'pending') {
                    setBookings(bookings.filter(b => b.id !== booking.id));
                    if (selectedBooking && selectedBooking.id === booking.id) {
                        setSelectedBooking(null);
                    }
                } else {
                    // Otherwise, update the booking status in the list
                    const updatedBookings = bookings.map(b => {
                        if (b.id === booking.id) {
                            return { ...b, status: 'approved' };
                        }
                        return b;
                    });
                    setBookings(updatedBookings);
                    
                    // Update the selected booking if it's the one we just approved
                    if (selectedBooking && selectedBooking.id === booking.id) {
                        setSelectedBooking({ ...selectedBooking, status: 'approved' });
                    }
                }
                
                setActionLoading({ ...actionLoading, [booking.id]: false });
            })
            .catch(error => {
                console.error('Error approving booking:', error);
                setNotification({
                    show: true,
                    message: error.response?.data?.message || 'Failed to approve booking',
                    type: 'danger'
                });
                setActionLoading({ ...actionLoading, [booking.id]: false });
            });
    };

    const handleReject = (booking) => {
        if (!confirm(`Are you sure you want to reject the booking for ${booking.roomname} by ${booking.club?.name}?`)) {
            return;
        }
        
        setActionLoading({ ...actionLoading, [booking.id]: 'reject' });
        
        axiosClient.put(`/room-bookings/${booking.id}`, {
            status: 'rejected'
        })
            .then(response => {
                setNotification({
                    show: true,
                    message: 'Room booking has been rejected successfully',
                    type: 'success'
                });
                
                // If we're viewing "pending" bookings, remove the rejected booking from the list
                if (filter === 'pending') {
                    setBookings(bookings.filter(b => b.id !== booking.id));
                    if (selectedBooking && selectedBooking.id === booking.id) {
                        setSelectedBooking(null);
                    }
                } else {
                    // Otherwise, update the booking status in the list
                    const updatedBookings = bookings.map(b => {
                        if (b.id === booking.id) {
                            return { ...b, status: 'rejected' };
                        }
                        return b;
                    });
                    setBookings(updatedBookings);
                    
                    // Update the selected booking if it's the one we just rejected
                    if (selectedBooking && selectedBooking.id === booking.id) {
                        setSelectedBooking({ ...selectedBooking, status: 'rejected' });
                    }
                }
                
                setActionLoading({ ...actionLoading, [booking.id]: false });
            })
            .catch(error => {
                console.error('Error rejecting booking:', error);
                setNotification({
                    show: true,
                    message: error.response?.data?.message || 'Failed to reject booking',
                    type: 'danger'
                });
                setActionLoading({ ...actionLoading, [booking.id]: false });
            });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="badge pending">Pending</span>;
            case 'approved':
                return <span className="badge approved">Approved</span>;
            case 'rejected':
                return <span className="badge rejected">Rejected</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const getVisibilityBadge = (visibility) => {
        switch (visibility) {
            case 'public':
                return <span className="badge visibility-public">Public</span>;
            case 'club_only':
                return <span className="badge visibility-club-only">Club Only</span>;
            default:
                return <span className="badge">{visibility}</span>;
        }
    };

    return (
        <div className="animated fadeInDown">
            <h1>Room Bookings</h1>
            
            {notification.show && (
                <div className={`alert alert-${notification.type}`}>
                    {notification.message}
                </div>
            )}
            
            <div className="filter-container">
                <div className="filter-buttons">
                    <button 
                        className={filter === 'pending' ? 'active' : ''} 
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button 
                        className={filter === 'approved' ? 'active' : ''} 
                        onClick={() => setFilter('approved')}
                    >
                        Approved
                    </button>
                    <button 
                        className={filter === 'rejected' ? 'active' : ''} 
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected
                    </button>
                    <button 
                        className={filter === '' ? 'active' : ''} 
                        onClick={() => setFilter('')}
                    >
                        All
                    </button>
                </div>
            </div>
            
            {loading ? (
                <div className="text-center">Loading bookings...</div>
            ) : bookings.length === 0 ? (
                <div className="text-center">
                    <p>No {filter || 'room'} bookings found</p>
                </div>
            ) : (
                <div className="card">
                    <table>
                        <thead>
                            <tr>
                                <th>Room</th>
                                <th>Club</th>
                                <th>Date & Time</th>
                                <th>Duration</th>
                                <th>Visibility</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr 
                                    key={booking.id} 
                                    className={selectedBooking?.id === booking.id ? 'selected' : ''}
                                    onClick={() => setSelectedBooking(booking)}
                                >
                                    <td>{booking.roomname}</td>
                                    <td>{booking.club?.name || 'N/A'}</td>
                                    <td>{formatDate(booking.start_time)}</td>
                                    <td>{getDuration(booking.start_time, booking.end_time)}</td>
                                    <td>{getVisibilityBadge(booking.visibility)}</td>
                                    <td>{getStatusBadge(booking.status)}</td>
                                    <td>
                                        {booking.status === 'pending' && (
                                            <>
                                                <button
                                                    className="btn-add"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleApprove(booking);
                                                    }}
                                                    disabled={actionLoading[booking.id]}
                                                >
                                                    {actionLoading[booking.id] === 'approve' ? 'Processing...' : 'Approve'}
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReject(booking);
                                                    }}
                                                    disabled={actionLoading[booking.id]}
                                                >
                                                    {actionLoading[booking.id] === 'reject' ? 'Processing...' : 'Reject'}
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {selectedBooking && (
                <div className="booking-details card">
                    <div className="card-header">
                        <h2>Booking Details</h2>
                        <div className="booking-status">
                            {getStatusBadge(selectedBooking.status)}
                            {getVisibilityBadge(selectedBooking.visibility)}
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="booking-info">
                            <div className="info-section">
                                <h3>Room Information</h3>
                                <div className="info-grid">
                                    <div className="info-label">Name:</div>
                                    <div className="info-value">{selectedBooking.roomname}</div>
                                    
                                    <div className="info-label">Location:</div>
                                    <div className="info-value">{selectedBooking.room?.location || 'N/A'}</div>
                                </div>
                            </div>
                            
                            <div className="info-section">
                                <h3>Club Information</h3>
                                <div className="info-grid">
                                    <div className="info-label">Name:</div>
                                    <div className="info-value">{selectedBooking.club?.name || 'N/A'}</div>
                                </div>
                            </div>
                            
                            <div className="info-section">
                                <h3>Booking Information</h3>
                                <div className="info-grid">
                                    <div className="info-label">Start Time:</div>
                                    <div className="info-value">{formatDate(selectedBooking.start_time)}</div>
                                    
                                    <div className="info-label">End Time:</div>
                                    <div className="info-value">{formatDate(selectedBooking.end_time)}</div>
                                    
                                    <div className="info-label">Duration:</div>
                                    <div className="info-value">{getDuration(selectedBooking.start_time, selectedBooking.end_time)}</div>
                                    
                                    <div className="info-label">Created At:</div>
                                    <div className="info-value">{formatDate(selectedBooking.created_at)}</div>
                                </div>
                            </div>
                            
                            <div className="info-section">
                                <h3>Purpose of Booking</h3>
                                <div className="booking-description">
                                    {selectedBooking.roomdescription || 'No description provided.'}
                                </div>
                            </div>
                        </div>
                        
                        {selectedBooking.status === 'pending' && (
                            <div className="booking-actions">
                                <button
                                    className="btn-delete"
                                    onClick={() => handleReject(selectedBooking)}
                                    disabled={actionLoading[selectedBooking.id]}
                                >
                                    {actionLoading[selectedBooking.id] === 'reject' ? 'Processing...' : 'Reject Booking'}
                                </button>
                                <button
                                    className="btn-add"
                                    onClick={() => handleApprove(selectedBooking)}
                                    disabled={actionLoading[selectedBooking.id]}
                                >
                                    {actionLoading[selectedBooking.id] === 'approve' ? 'Processing...' : 'Approve Booking'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
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
            
            <style jsx>{`
                .filter-container {
                    margin-bottom: 20px;
                }
                
                .filter-buttons {
                    display: flex;
                    gap: 10px;
                }
                
                .filter-buttons button {
                    padding: 8px 16px;
                    border: 1px solid #ccc;
                    background-color: #f8f8f8;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .filter-buttons button.active {
                    background-color: #5b08a7;
                    color: white;
                    border-color: #5b08a7;
                }
                
                .badge {
                    padding: 5px 10px;
                    border-radius: 30px;
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                    display: inline-block;
                }
                
                .badge.pending {
                    background-color: #ffc107;
                    color: #212529;
                }
                
                .badge.approved {
                    background-color: #28a745;
                    color: white;
                }
                
                .badge.rejected {
                    background-color: #dc3545;
                    color: white;
                }
                
                .badge.visibility-public {
                    background-color: #17a2b8;
                    color: white;
                }
                
                .badge.visibility-club-only {
                    background-color: #6c757d;
                    color: white;
                }
                
                table tbody tr {
                    cursor: pointer;
                }
                
                table tbody tr.selected {
                    background-color: #e6f7ff;
                }
                
                .booking-details {
                    margin-top: 20px;
                }
                
                .booking-details .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .booking-status {
                    display: flex;
                    gap: 8px;
                }
                
                .info-section {
                    margin-bottom: 20px;
                }
                
                .info-section h3 {
                    border-bottom: 1px solid #eee;
                    padding-bottom: 8px;
                    margin-bottom: 12px;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 120px 1fr;
                    row-gap: 10px;
                }
                
                .info-label {
                    font-weight: bold;
                    color: #555;
                }
                
                .booking-description {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 4px;
                    margin-top: 10px;
                    white-space: pre-line;
                }
                
                .booking-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 15px;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }
                
                button {
                    margin-right: 5px;
                }
            `}</style>
        </div>
    );
}
