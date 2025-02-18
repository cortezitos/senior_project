import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

export default function Login() {
        const emailRef = useRef();
        const passwordRef = useRef();
        const [errors, setErrors] = useState([]);
        const {setUser, setToken} = useStateContext();
        const onSubmit = (ev) => {
                ev.preventDefault();
                setErrors([]);
                const payload = {
                        email: emailRef.current.value,
                        password: passwordRef.current.value,
                }

                axiosClient.post('/login', payload)
                        .then(({ data }) => {
                                setUser(data.user);
                                setToken(data.token);
                        })
                        .catch((err) => {
                                const response = err.response;
                                if (response) {
                                        if (response.data.errors) {
                                                const errorMsgs = [];
                                                for (const key in response.data.errors) {
                                                        errorMsgs.push(...response.data.errors[key]);
                                                }
                                                setErrors(errorMsgs);
                                        } else if (response.data.message) {
                                                setErrors([response.data.message]);
                                        }
                                }
                        });
        }

        return (
                <div className="login-signup-form animated fadeInDown">
                        <div className="form">
                                <h1 className="title">
                                        Login into your account
                                </h1>
                                {errors.length > 0 && (
                                        <div className="alert">
                                                        {errors.map((error, idx) => (
                                                                <p key={idx}>{error}</p>
                                                        ))}
                                        </div>
                                )}
                                <form onSubmit={onSubmit}>
                                        <input ref={emailRef} type="email" placeholder="Email" />
                                        <input ref={passwordRef} type="password" placeholder="Password" />
                                        <button className="btn btn-block">Login</button>
                                        <p className="message">
                                                Not registered? <Link to="/signup">Create an account</Link>
                                        </p>
                                </form>
                        </div>
                </div>
        )
}

