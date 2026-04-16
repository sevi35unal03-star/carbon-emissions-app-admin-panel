import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { emailorIdentityNumber: string; password: string }) => {
    setLoading(true);
    try {
      const response = await api.post('/users/login', values);

      if (response.data.isSuccessful) {
        localStorage.setItem('token', response.data.data.accessToken);
        navigate('/');
      } else {
        message.error(response.data.errors?.[0] || 'Giriş başarısız.');
      }
    } catch (error: unknown) {
      const err = error as { response?: { status: number } };
      if (err.response) {
        message.error(`Sunucu hatası: ${err.response.status}`);
      } else {
        message.error('Sunucuya bağlanılamıyor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="IzTek Admin Paneli" style={{ width: 400 }}>
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