import './login.scss';
import { Formik } from 'formik';
import { Input, SIZE } from 'baseui/input';
import { Button } from 'baseui/button';

function Login() {
    return (
        <div className="host">
            <div id="global-logo">Repository</div>
            <Formik
                initialValues={{ username: '', pw: '' }}
                onSubmit={(values, { setSubmitting }) => {
                    console.log(values);
                    setTimeout(() => {
                        setSubmitting(false);
                    }, 400);
                }}
            >
                {({ values, handleChange, handleSubmit, isSubmitting }) => (
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
                                name="pw"
                                value={values.pw}
                                onChange={handleChange}
                                placeholder="Password"
                                type="password"
                                size={SIZE.large}
                            ></Input>
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            Login
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            Register
                        </Button>
                    </form>
                )}
            </Formik>
        </div>
    );
}

export default Login;
