import React from 'react';
import { Table, Button } from 'antd';

const PlaylistManagement = () => {
  const columns = [
    {
      title: 'Playlist Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: 'Songs',
      dataIndex: 'songs',
      key: 'songs',
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
      name: 'Top Hits',
      creator: 'Admin',
      songs: 20,
    },
    {
      key: '2',
      name: 'Chill Vibes',
      creator: 'User1',
      songs: 15,
    },
  ];

  return (
    <div>
      <h1>Playlist Management</h1>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default PlaylistManagement;