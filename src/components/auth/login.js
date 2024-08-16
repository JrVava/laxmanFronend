import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Spin } from 'antd';
import { UserOutlined, LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { api } from '../../util/api';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../features/authSlice';
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '../../hook/useDocumentTitle';

const Login = () => {
  const [loading, setLoading] = useState(false); // State to track loading
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useDocumentTitle('Login');
  const user = useSelector((state) => state.auth.user);

  const onFinish = async (values) => {
    setLoading(true); // Start loading
    try {
      const login = await api.post('/sign-in', values)
      const user = login.data;
      dispatch(setUser(user));

      navigate('/bills');
    } catch (error) {
      console.error('Error during API call:', error.message);
    }finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    // Redirect to /dashboard if the user is already logged in
    if (user && user.token) {
      navigate('/bills');
    }
  }, [user, navigate]);


  return (
    <div className="login-page">
      <div className="login-container">
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <h2 className="login-title">Login</h2>
          <Form.Item
            name="user_name"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              disabled={loading} // Disable button while loading
            >
              {loading ? <Spin /> : 'Log in'} {/* Show spinner if loading */}
            </Button>
            <span className='ant-checkbox-wrapper'>Or{" "}</span>
            <a href="" className='sign-up-btn'>register now!</a>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
