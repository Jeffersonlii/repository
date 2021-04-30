import './login.scss';
import { Formik } from 'formik';
import { Input, SIZE } from 'baseui/input';
import { Button } from 'baseui/button';
import { loginUser, registerUser } from './login.service';
import { useHistory } from 'react-router-dom';

function Login() {
    const history = useHistory();

    return (
        <div className="login-host">
            <div id="global-logo">Repository</div>
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
                            }).then(() => {
                                history.push('/dashboard');
                            });
                            break;
                        case 'registration':
                            registerUser({
                                username: values.username,
                                password: values.password,
                            }).then(() => {
                                history.push('/dashboard');
                            });
                            break;
                        default:
                    }

                    console.log(values);
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
                    </form>
                )}
            </Formik>
        </div>
    );
}

export default Login;
