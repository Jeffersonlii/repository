import './App.scss';
import React, { useState, useEffect } from 'react';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom';
import { StyledSpinnerNext } from 'baseui/spinner';

import Login from './login/login';
import Dashboard from './dashboard/dashboard';
import Image from './single-image/image';
import Share from './share/share';
import { checkAuthenticated } from './login/login.service';
import Toast from './toast/toast';
function App() {
    return (
        <div className="App">
            <div>
                <div id="global-logo">Repository</div>
            </div>
            <Router>
                <Switch>
                    <ProtectedRoute path="/dashboard" Component={Dashboard} />
                    <ProtectedRoute path="/img" Component={Image} />
                    <Route path="/share/:id">
                        <Share />
                    </Route>
                    <Route path="/">
                        <Login />
                    </Route>
                </Switch>
            </Router>

            <Toast />
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
        <StyledSpinnerNext size={96} />
    );
}
export default App;
