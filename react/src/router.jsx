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
import Profile from "./views/Profile.jsx";
import Clubs from "./views/Clubs.jsx";
import EditClubs from "./views/EditClubs.jsx";
import ClubForm from "./views/ClubForm.jsx";
import ClubMemberForm from "./views/ClubMemberForm.jsx";
import ClubProfile from "./views/ClubProfile.jsx";

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
				path: '/clubs',
				element: <Clubs />
			},
			{
				path: '/clubs/:id',
				element: <ClubProfile />
			},
			{
				path: '/profile',
				element: <Profile />
			},
			{
				path: '/profile/:id',
				element: <Profile />
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
					{
						path: '/manage-clubs',
						element: <EditClubs />
					},
					{
						path: '/manage-clubs/new',
						element: <ClubForm key="clubCreate" />
					},
					{
						path: '/manage-clubs/:id/edit',
						element: <ClubForm key="clubUpdate" />
					},
					{
						path: '/manage-clubs/:id/members',
						element: <ClubMemberForm />
					}
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
