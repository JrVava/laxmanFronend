import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../../features/authSlice';
import { Header } from 'antd/es/layout/layout';

const { Footer, Sider, Content } = Layout;

const PrivateLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get the current location
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(clearUser());
    navigate('/login');
  };

  // Determine the active menu key based on the current location
  const getActiveMenuKey = () => {
    if (location.pathname.startsWith('/new-bill')) {
      return '/bills';
    }
    return location.pathname;
  };

  // Define the menu items
  const items = [
    {
      key: '/bills',
      label: <Link to="/bills">Bills</Link>,
    },
    {
      key: 'logout',
      label: <span onClick={handleLogout}>Logout</span>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={[getActiveMenuKey()]} // Set the active menu item based on the URL
          className="menu-with-margin" // Apply the CSS class for top margin
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: '0 16px' }}>
          <div className="header-content">
            {user && <div className="user-name">Welcome, {user.user_name}</div>}
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>©2024 Your Company</Footer>
      </Layout>
    </Layout>
  );
};

export default PrivateLayout;
