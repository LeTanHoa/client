import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Route, Routes, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import PlaylistManagement from './pages/PlaylistManagement';
import AdminSettings from './pages/AdminSettings';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const location = useLocation();
  const activeKey = location.pathname.split('/')[2] || 'dashboard';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="logo" style={{ height: '32px', margin: '16px', color: 'white', textAlign: 'center' }}>
          Admin Panel
        </div>
        <Menu theme="dark" selectedKeys={[activeKey]} mode="inline">
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="users" icon={<UserOutlined />}>
            <Link to="users">User Management</Link>
          </Menu.Item>
          <Menu.Item key="playlists" icon={<PlayCircleOutlined />}>
            <Link to="playlists">Playlist Management</Link>
          </Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />}>
            <Link to="settings">Settings</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0, textAlign: 'center' }}>
          <h2>Admin Dashboard</h2>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="playlists" element={<PlaylistManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;