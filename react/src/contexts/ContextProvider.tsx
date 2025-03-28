import { createContext, useContext, useState } from "react";

// Define user type
interface User {
    [key: string]: any;
}

// Define context type
type ContextType = {
    user: User;
    token: string | null;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
};

const StateContext = createContext<ContextType>({
    user: {},
    token: null,
    setUser: () => {},
    setToken: () => {},
});

export const ContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [user, setUser] = useState<User>({});
    const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));

    const setToken = (token: string) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("ACCESS_TOKEN", token);
        } else {
            localStorage.removeItem("ACCESS_TOKEN");
        }
    };

    return (
        <StateContext.Provider
            value={{
                user,
                token,
                setToken,
                setUser,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);
