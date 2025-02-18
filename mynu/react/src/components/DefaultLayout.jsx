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
		<aside>
			<Link to="/dashboard">Dashboard</Link>
			{user.role === 'admin' && (
				<Link to="/users">Users</Link>
			)}
			<Link to="/phonebook">Phonebook</Link>
		</aside>
		<div className="content">
			<header>
				<div>
					Header
				</div>
				<div>
					{user.name}
					<a href="#" onClick={onLogout} className="btn-logout">Logout</a>
				</div>
			</header>
			<main>
				<Outlet />
			</main>
		</div>
	</div>

	) 


}
