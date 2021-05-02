import './login.scss';
import { Formik } from 'formik';
import { Input, SIZE } from 'baseui/input';
import { Button } from 'baseui/button';
import { loginUser, registerUser } from './login.service';
import { useHistory } from 'react-router-dom';
import { ListItem, ListItemLabel } from 'baseui/list';
import { Check } from 'baseui/icon';
import { notifyResponse } from '../toast/toast.service';
function Login() {
    const history = useHistory();

    return (
        <div className="login-host">
            <Formik
                initialValues={{
                    username: '',
                    password: '',
                    submissionSource: 'login',
                }}
                onSubmit={(values, { setSubmitting }) => {
                    switch (
                        values.submissionSource //types of submissions
                    ) {
                        case 'login':
                            loginUser({
                                username: values.username,
                                password: values.password,
                            })
                                .then(() => {
                                    history.push('/dashboard');
                                })
                                .catch((e) => {
                                    notifyResponse(e.response);
                                });
                            break;
                        case 'registration':
                            registerUser({
                                username: values.username,
                                password: values.password,
                            })
                                .then(() => {
                                    history.push('/dashboard');
                                })
                                .catch((e) => {
                                    notifyResponse(e.response);
                                });
                            break;
                        default:
                    }
                    setTimeout(() => {
                        setSubmitting(false);
                    }, 400);
                }}
            >
                {({
                    values,
                    handleChange,
                    handleSubmit,
                    isSubmitting,
                    setFieldValue,
                }) => (
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <Input
                                name="username"
                                value={values.username}
                                onChange={handleChange}
                                placeholder="Username"
                                size={SIZE.large}
                            ></Input>
                            <Input
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                                placeholder="Password"
                                type="password"
                                size={SIZE.large}
                            ></Input>
                        </div>

                        <Button
                            name="login"
                            type="submit"
                            disabled={isSubmitting}
                            onClick={(e) => {
                                setFieldValue('submissionSource', 'login');
                                handleSubmit(e);
                            }}
                        >
                            Login
                        </Button>
                        <Button
                            name="register"
                            type="submit"
                            disabled={isSubmitting}
                            onClick={(e) => {
                                setFieldValue(
                                    'submissionSource',
                                    'registration'
                                );
                                handleSubmit(e);
                            }}
                        >
                            Register
                        </Button>

                        <div class="text">
                            {[
                                '100% Free',
                                '20 MB max image size',
                                'Security First',
                                'Customizable Sharing',
                            ].map((str) => {
                                return (
                                    <ListItem
                                        artwork={(props) => (
                                            <Check {...props} />
                                        )}
                                    >
                                        <ListItemLabel>{str}</ListItemLabel>
                                    </ListItem>
                                );
                            })}
                        </div>
                    </form>
                )}
            </Formik>
        </div>
    );
}

export default Login;
