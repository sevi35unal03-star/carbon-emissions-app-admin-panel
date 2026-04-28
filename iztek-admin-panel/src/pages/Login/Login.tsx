import { useState } from 'react';
import { Form, Input, Button, Card, message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

type ForgotStep = 'phone' | 'otp' | 'newPassword';

function getRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
  } catch {
    return null;
  }
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('phone');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const onFinish = async (values: { emailorIdentityNumber: string; password: string }) => {
    setLoading(true);
    try {
      const response = await api.post('/users/login', values);
      if (response.data.isSuccessful) {
        const token = response.data.data.accessToken;
        const role = getRoleFromToken(token);
        if (role !== 'Admin') {
          message.error('Bu panele erişim yetkiniz bulunmamaktadır.');
          return;
        }
        localStorage.setItem('token', token);
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

  const openForgotModal = () => {
    setForgotStep('phone');
    setPhoneNumber('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotVisible(true);
  };

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      message.warning('Lütfen telefon numaranızı girin.');
      return;
    }
    setForgotLoading(true);
    try {
      const response = await api.post('/users/password/forgot', { phoneNumber });
      if (response.data.isSuccessful) {
        message.success('Doğrulama kodu telefonunuza gönderildi.');
        setForgotStep('otp');
      } else {
        message.error(response.data.errors?.[0] || 'Kod gönderilemedi.');
      }
    } catch {
      message.error('Sunucuya bağlanılamıyor.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!resetCode.trim()) {
      message.warning('Lütfen doğrulama kodunu girin.');
      return;
    }
    setForgotStep('newPassword');
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      message.warning('Lütfen tüm alanları doldurun.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      message.error('Şifreler eşleşmiyor.');
      return;
    }
    setForgotLoading(true);
    try {
      const response = await api.post('/users/password/reset', {
        phoneNumber,
        resetCode,
        newPassword,
        confirmNewPassword,
      });
      if (response.data.isSuccessful) {
        message.success('Şifreniz başarıyla sıfırlandı.');
        setForgotVisible(false);
      } else {
        message.error(response.data.errors?.[0] || 'Şifre sıfırlanamadı.');
      }
    } catch {
      message.error('Sunucuya bağlanılamıyor.');
    } finally {
      setForgotLoading(false);
    }
  };

  const forgotModalTitle = {
    phone: 'Şifre Sıfırlama',
    otp: 'Doğrulama Kodu',
    newPassword: 'Yeni Şifre Belirle',
  }[forgotStep];

  return (
    <>
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
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Button type="link" style={{ padding: 0 }} onClick={openForgotModal}>
                Şifremi Unuttum
              </Button>
            </div>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Giriş Yap
            </Button>
          </Form>
        </Card>
      </div>

      <Modal
        title={forgotModalTitle}
        open={forgotVisible}
        onCancel={() => setForgotVisible(false)}
        footer={null}
        destroyOnHidden
      >
        {forgotStep === 'phone' && (
          <div>
            <p style={{ marginBottom: 16, color: '#666' }}>
              Kayıtlı telefon numaranıza 5 haneli doğrulama kodu gönderilecektir.
            </p>
            <Input
              placeholder="05XX XXX XX XX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Button type="primary" loading={forgotLoading} onClick={handleSendCode} block>
              Kodu Gönder
            </Button>
          </div>
        )}

        {forgotStep === 'otp' && (
          <div>
            <p style={{ marginBottom: 16, color: '#666' }}>
              <strong>{phoneNumber}</strong> numarasına gönderilen 5 haneli kodu girin.
            </p>
            <Input
              placeholder="● ● ● ● ●"
              maxLength={5}
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              style={{ marginBottom: 8, letterSpacing: 8, textAlign: 'center', fontSize: 20 }}
            />
            <Button
              type="link"
              style={{ padding: 0, marginBottom: 16 }}
              loading={forgotLoading}
              onClick={handleSendCode}
            >
              Kodu tekrar gönder
            </Button>
            <Button type="primary" onClick={handleVerifyOtp} block>
              Devam Et
            </Button>
          </div>
        )}

        {forgotStep === 'newPassword' && (
          <div>
            <Input.Password
              placeholder="Yeni şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <Input.Password
              placeholder="Yeni şifre (tekrar)"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Button type="primary" loading={forgotLoading} onClick={handleResetPassword} block>
              Şifreyi Sıfırla
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}