import React from 'react';
import { Card, Col, Row } from 'antd';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Total Users" bordered={false}>
            120
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Total Playlists" bordered={false}>
            45
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Total Songs" bordered={false}>
            300
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;