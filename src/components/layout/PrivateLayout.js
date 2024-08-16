import React, { useEffect, useState } from 'react';
import { Button, Layout, Menu } from 'antd';
import { MenuOutlined, DollarOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../../features/authSlice';
import { Header } from 'antd/es/layout/layout';

const { Footer, Sider, Content } = Layout;

const PrivateLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get the current location
  const user = useSelector((state) => state.auth.user);
  const [collapsed, setCollapsed] = useState(true);


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

  const handleMenuClick = (e) => {
    if (e.key === 'logout') {
      handleLogout();
    } else {
      navigate(e.key); // Handle navigation
    }
  };

  const items = [
    {
      key: '/bills',
      icon: <DollarOutlined />,
      label: 'Bills',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true); // Collapse sidebar on mobile/tablet
      } else {
        setCollapsed(false); // Expand sidebar on larger screens
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial state based on screen size

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(collapsed) => setCollapsed(collapsed)}>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={[getActiveMenuKey()]}
          onClick={handleMenuClick} // Handle menu item clicks
          className="menu-with-margin"
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: '0 16px' }}>
          <div className="header-content">
          <Button type="text" onClick={toggleSidebar} className="menu-button" style={{color:'white'}}>
            <MenuOutlined />
          </Button>
            {user && <div className="user-name">Welcome, {user.user_name}</div>}
          </div>
        </Header>
        <Content className="content-container">
          <div className="site-layout-background content-background">
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Developed by{' '}
          <a
            href="https://www.linkedin.com/in/ashish-sitaram-panicker-3448a4187"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ashish Sitaram Panicker
          </a>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default PrivateLayout;
