import './App.scss';
import React, { useState, useEffect } from 'react';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom';
import { Spinner } from 'baseui/spinner';

import Login from './login/login';
import Dashboard from './dashboard/dashboard';
import { checkAuthenticated } from './login/login.service';
function App() {
    return (
        <div className="App">
            <Router>
                <Switch>
                    <ProtectedRoute
                        path="/dashboard"
                        Component={Dashboard}
                    ></ProtectedRoute>
                    <Route path="/img">img </Route>
                    <Route path="/">
                        <Login />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

function ProtectedRoute({ Component, logout, ...other }) {
    let [isAuth, setAuth] = useState({
        auth: false,
        ready: false,
    });
    useEffect(() => {
        const getAuth = async () => {
            const resp = await checkAuthenticated();
            setAuth({
                auth: resp.data.userid !== undefined,
                ready: true,
            });
        };

        getAuth();
    }, []);

    return isAuth.ready ? (
        <Route
            {...other}
            render={(props) => {
                if (isAuth.auth) {
                    return <Component logout={logout} />;
                } else {
                    return (
                        <Redirect
                            to={{
                                pathname: '/',
                                state: { from: props.location },
                            }}
                        />
                    );
                }
            }}
        />
    ) : (
        <Spinner size={96} />
    );
}
export default App;
