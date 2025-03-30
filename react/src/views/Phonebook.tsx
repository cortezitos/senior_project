import { useState, useEffect } from "react";
import axiosClient from "../axios-client";
import { Link } from "react-router-dom";
import { PaginationMeta, User } from "../types";

export default function Phonebook() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationMeta>({
        current_page: 1,
        total: 0,
        last_page: 1,
    });

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = (page = 1) => {
        setLoading(true);
        axiosClient
            .get(`/users?page=${page}`)
            .then(({ data }) => {
                setLoading(false);
                // Extract JSON data from the response if it contains HTML
                const jsonData =
                    typeof data === "string"
                        ? JSON.parse(
                              data
                                  .split("\n")
                                  .find((line) =>
                                      line.trim().startsWith("{")
                                  ) || "{}"
                          )
                        : data;

                if (jsonData && jsonData.data) {
                    setUsers(jsonData.data);
                    setPagination({
                        current_page: jsonData.meta.current_page,
                        total: jsonData.meta.total,
                        last_page: jsonData.meta.last_page,
                    });
                } else {
                    console.error("Invalid response format:", jsonData);
                    setUsers([]);
                }
            })
            .catch((error) => {
                setLoading(false);
                console.error("Error fetching users:", error);
                setUsers([]);
            });
    };

    const onPageClick = (page: number) => {
        getUsers(page);
    };

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h1>Phonebook</h1>
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    {loading && (
                        <tbody>
                            <tr>
                                <td colSpan={4} className="text-center">
                                    Loading...
                                </td>
                            </tr>
                        </tbody>
                    )}
                    {!loading && (
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>
                                        <Link
                                            to={`/profile/${u.id}`}
                                            className="name-link"
                                        >
                                            {u.name}
                                        </Link>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>{u.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
                {!loading && pagination.last_page > 1 && (
                    <div className="pagination">
                        {Array.from(
                            { length: pagination.last_page },
                            (_, i) => i + 1
                        ).map((page) => (
                            <button
                                key={page}
                                className={`pagination-button ${
                                    pagination.current_page === page
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => onPageClick(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
