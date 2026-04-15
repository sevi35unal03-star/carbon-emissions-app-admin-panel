import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import api from '../../services/api';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { emailorIdentityNumber: string; password: string }) => {
    setLoading(true);
    try {
      const response = await api.post('/api/v1/users/login', values);
      console.log('Full response:', response.data);

      if (response.data.isSuccessful) {
        localStorage.setItem('token', response.data.data.accessToken);
        window.location.href = '/dashboard';
      } else {
        const errorMsg = response.data.errors?.[0]?.message || 'Giriş başarısız.';
        message.error(errorMsg);
        console.error('Login failed:', response.data);
      }
    } catch (error: any) {
      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data);
        message.error(`Sunucu hatası: ${error.response.status}`);
      } else if (error.request) {
        console.error('Network Error - API erişilemiyor');
        message.error('Sunucuya bağlanılamıyor.');
      } else {
        message.error('Bir hata oluştu: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title="Admin Paneli" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item
            label="E-posta / TC Kimlik No"
            name="emailorIdentityNumber"
            rules={[{ required: true, message: 'Bu alan zorunludur.' }]}
          >
            <Input placeholder="E-posta veya TC Kimlik No" autoComplete="username" />
          </Form.Item>
          <Form.Item
            label="Şifre"
            name="password"
            rules={[{ required: true, message: 'Şifre zorunludur.' }]}
          >
            <Input.Password placeholder="Şifrenizi girin" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Giriş Yap
          </Button>
        </Form>
      </Card>
    </div>
  );
}