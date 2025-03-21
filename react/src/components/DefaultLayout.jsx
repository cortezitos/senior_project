import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";
import { useEffect } from "react";

export default function DefaultLayout() {
	const { user, token, setUser, setToken } = useStateContext();
	const navigate = useNavigate();

	if (!token) {
		return <Navigate to="/login" />
	}

	const onLogout = (ev) => {
		ev.preventDefault();
		axiosClient.post('/logout')
			.then(() => {
				setUser({});
				setToken(null);
				navigate("/login");
			})
	}

	useEffect(() => {
		axiosClient.get('/user')
			.then(({ data }) => {
				setUser(data);
			})
	}, [setUser]);

	return(
	<div id="defaultLayout">
		<div className="header-container">
			<nav>
				<Link to="/dashboard">Dashboard</Link>
				{user.role === 'admin' && (
					<>
						<Link to="/users">Users</Link>
						<Link to="/manage-clubs">Manage Clubs</Link>
						<Link to="/pending-posts">Pending Posts</Link>
						<Link to="/rooms">Manage Rooms</Link>
						<Link to="/room-bookings">Room Bookings</Link>
					</>
				)}
				<Link to="/clubs">Clubs</Link>
				<Link to="/phonebook">Phonebook</Link>
				<Link to="/public-rooms">Room Availability</Link>
			</nav>
			<div className="user-info">
				<Link to="/profile">{user.name}</Link>
				<a href="#" onClick={onLogout} className="btn-logout">Logout</a>
			</div>
		</div>
		<main className="content">
			<Outlet />
		</main>
	</div>
	)
}
