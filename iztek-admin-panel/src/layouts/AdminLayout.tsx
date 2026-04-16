import { Layout, Menu } from 'antd';
import {
  SettingOutlined,
  CalendarOutlined,
  BarChartOutlined,
  AuditOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  LogoutOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Sider, Content, Header } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'tanimlamalar',
      icon: <SettingOutlined />,
      label: 'Tanımlamalar',
      children: [
        {
          key: 'soru-tanimlamalari',
          icon: <QuestionCircleOutlined />,
          label: 'Soru Tanımlamaları',
          children: [
            { key: '/activity-questions', label: 'Soru Ekle/Düzenle' },
            { key: '/polls', label: 'Anket Ekle' },
          ],
        },
        {
          key: 'genel-tanimlamalar',
          icon: <SettingOutlined />,
          label: 'Genel Tanımlamalar',
          children: [
            { key: '/definitions', label: 'Puanlama Ayarları' },
          ],
        },
        {
          key: 'faydali-bilgiler-menu',
          icon: <BookOutlined />,
          label: 'Faydalı Bilgiler',
          children: [
            { key: '/useful-informations', label: 'Bilgi Ekle/Düzenle' },
          ],
        },
      ],
    },
    {
      key: '/daily-answers',
      icon: <CalendarOutlined />,
      label: 'Günlük Cevaplar',
    },
    {
      key: '/carbon-footprint',
      icon: <BarChartOutlined />,
      label: 'Karbon Ayak İzi Hesapları',
    },
    {
      key: '/audit-logs',
      icon: <AuditOutlined />,
      label: 'Log Kayıtları',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} style={{ overflow: 'auto' }}>
        <div style={{ color: 'white', padding: 16, fontWeight: 'bold', fontSize: 18, borderBottom: '1px solid #333' }}>
          IzTek Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['tanimlamalar', 'soru-tanimlamalari', 'genel-tanimlamalar', 'faydali-bilgiler-menu']}
          items={menuItems}
          onClick={({ key }) => { if (key.startsWith('/')) navigate(key); }}
        />
        <div
          style={{ padding: '16px 24px', cursor: 'pointer', color: 'white', position: 'absolute', bottom: 0 }}
          onClick={handleLogout}
        >
          <LogoutOutlined /> <span style={{ marginLeft: 8 }}>Çıkış Yap</span>
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', fontWeight: 'bold', fontSize: 16, borderBottom: '1px solid #f0f0f0' }}>
          IzTek Carbon Footprint Admin
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}