import './App.scss';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Login from './login/login';
function App() {
    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route path="/dashboard">dashboard</Route>
                    <Route path="/img">img </Route>
                    <Route path="/">
                        <Login />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
