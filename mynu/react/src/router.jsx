import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "./views/Login.jsx";
import Users from "./views/Users.jsx";
import Signup from "./views/Signup.jsx";
import Notfound from "./views/Notfound.jsx";
import DefaultLayout from "./components/DefaultLayout.jsx";
import GuestLayout from "./components/GuestLayout.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import Dashboard from "./views/Dashboard.jsx";
import UserForm from "./views/UserForm.jsx";
import Phonebook from "./views/Phonebook.jsx";

const router = createBrowserRouter([
	{
		path: '/',
		element: <DefaultLayout />,
		children: [
			{
				path: '/',
				element: <Navigate to="/dashboard" />
			},
			{
				path: '/dashboard',
				element: <Dashboard />
			},
			{
				path: '/phonebook',
				element: <Phonebook />
			},
			{
				element: <AdminLayout />,
				children: [
					{
						path: '/users',
						element: <Users />
					},
					{
						path: '/users/new',
						element: <UserForm key="userCreate" />
					},
					{
						path: '/users/:id',
						element: <UserForm key="userUpdate" />
					},
				]
			}
		]
	},

	{
		path: '/',
		element: <GuestLayout />,
		children: [
			{
				path: '/login',
				element: <Login />
			},
			{
				path: '/signup',
				element: <Signup />
			}
		]
	},


	{
		path: '*',
		element: <Notfound />
	},


]
)

export default router;
