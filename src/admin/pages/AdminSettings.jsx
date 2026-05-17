import React from 'react';
import { Card, Form, Input, Button, Space, Row, Col, Switch, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const AdminSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Cài đặt đã được lưu thành công');
      console.log('Settings saved:', values);
    } catch (e) {
      message.error('Có lỗi khi lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Cài đặt hệ thống">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              appName: 'ZingMP3',
              appVersion: '1.0.0',
              maxUploadSize: 50,
              enableNotifications: true,
              maintenanceMode: false,
            }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="appName"
                  label="Tên ứng dụng"
                  rules={[{ required: true, message: 'Vui lòng nhập tên ứng dụng' }]}
                >
                  <Input placeholder="Tên ứng dụng" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="appVersion"
                  label="Phiên bản"
                  rules={[{ required: true, message: 'Vui lòng nhập phiên bản' }]}
                >
                  <Input placeholder="1.0.0" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="maxUploadSize"
                  label="Kích thước tệp tối đa (MB)"
                  rules={[{ required: true, message: 'Vui lòng nhập kích thước' }]}
                >
                  <Input type="number" placeholder="50" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="databaseBackup"
                  label="Sao lưu cơ sở dữ liệu"
                >
                  <Input placeholder="Nhập đường dẫn sao lưu" />
                </Form.Item>
              </Col>
            </Row>

            <Card style={{ marginTop: '16px' }} title="Tùy chọn bổ sung">
              <Form.Item
                name="enableNotifications"
                label="Bật thông báo"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="maintenanceMode"
                label="Chế độ bảo trì"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>

            <Form.Item style={{ marginTop: '24px' }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Lưu cài đặt
                </Button>
                <Button onClick={() => form.resetFields()}>
                  Đặt lại
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Thông tin hệ thống">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Node Version:</strong> {process.version || 'N/A'}
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: '12px' }}>
                <strong>React Version:</strong> 18.3.1
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Ant Design Version:</strong> 5.29.3
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Last Update:</strong> {new Date().toLocaleString('vi-VN')}
              </div>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default AdminSettings;
