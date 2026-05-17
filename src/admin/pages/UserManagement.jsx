import React from 'react';
import { Table, Button } from 'antd';

const UserManagement = () => {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link">Edit</Button>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      name: 'John Brown',
      email: 'john@example.com',
      role: 'Admin',
    },
    {
      key: '2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'User',
    },
  ];

  return (
    <div>
      <h1>User Management</h1>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default UserManagement;