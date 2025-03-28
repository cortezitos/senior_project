import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "./views/Login.tsx";
import Users from "./views/Users.tsx";
import Signup from "./views/Signup.tsx";
import Notfound from "./views/Notfound.tsx";
import DefaultLayout from "./components/DefaultLayout.tsx";
import GuestLayout from "./components/GuestLayout.tsx";
import AdminLayout from "./components/AdminLayout.tsx";
import Dashboard from "./views/Dashboard.tsx";
import UserForm from "./views/UserForm.tsx";
import Phonebook from "./views/Phonebook.tsx";
import Profile from "./views/Profile.tsx";
import Clubs from "./views/Clubs.tsx";
import EditClubs from "./views/EditClubs.tsx";
import ClubForm from "./views/ClubForm.tsx";
import ClubMemberForm from "./views/ClubMemberForm.tsx";
import ClubProfile from "./views/ClubProfile.tsx";
import PostForm from "./views/PostForm.tsx";
import PendingPosts from "./views/PendingPosts.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <DefaultLayout />,
        children: [
            {
                path: "/",
                element: <Navigate to="/dashboard" />,
            },
            {
                path: "/dashboard",
                element: <Dashboard />,
            },
            {
                path: "/phonebook",
                element: <Phonebook />,
            },
            {
                path: "/clubs",
                element: <Clubs />,
            },
            {
                path: "/clubs/:id",
                element: <ClubProfile />,
            },
            {
                path: "/clubs/:clubId/post/new",
                element: <PostForm />,
            },
            {
                path: "/profile",
                element: <Profile />,
            },
            {
                path: "/profile/:id",
                element: <Profile />,
            },
            {
                element: <AdminLayout />,
                children: [
                    {
                        path: "/users",
                        element: <Users />,
                    },
                    {
                        path: "/users/new",
                        element: <UserForm key="userCreate" />,
                    },
                    {
                        path: "/users/:id",
                        element: <UserForm key="userUpdate" />,
                    },
                    {
                        path: "/manage-clubs",
                        element: <EditClubs />,
                    },
                    {
                        path: "/manage-clubs/new",
                        element: <ClubForm key="clubCreate" />,
                    },
                    {
                        path: "/manage-clubs/:id/edit",
                        element: <ClubForm key="clubUpdate" />,
                    },
                    {
                        path: "/manage-clubs/:id/members",
                        element: <ClubMemberForm />,
                    },
                    {
                        path: "/pending-posts",
                        element: <PendingPosts />,
                    },
                ],
            },
        ],
    },

    {
        path: "/",
        element: <GuestLayout />,
        children: [
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/signup",
                element: <Signup />,
            },
        ],
    },

    {
        path: "*",
        element: <Notfound />,
    },
]);

export default router;
