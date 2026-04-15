import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  TrophyOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';

const { Sider, Content, Header } = Layout;

export default function Dashboard() {
  const navigate = useNavigate();

  // 🔥 BURAYI DEĞİŞTİRDİK
  const menuItems = [
    { key: '/dashboard/users', icon: <UserOutlined />, label: 'Kullanıcılar' },
    { key: '/dashboard/polls', icon: <BarChartOutlined />, label: 'Anketler' },
    { key: '/dashboard/goals', icon: <TrophyOutlined />, label: 'Hedefler' },
    { key: '/dashboard/activity-questions', icon: <QuestionCircleOutlined />, label: 'Aktivite Soruları' },
    { key: '/dashboard/faydali-bilgiler', icon: <QuestionCircleOutlined />, label: 'Faydalı Bilgiler' },
    { key: '/dashboard/karbon-ayak-izi', icon: <BarChartOutlined />, label: 'Karbon Ayak İzi' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ color: 'white', padding: 16, fontWeight: 'bold', fontSize: 18 }}>
          IzTek Admin
        </div>

        {/* 🔥 BURAYI DEĞİŞTİRDİK */}
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />

        <div style={{ position: 'absolute', bottom: 16, width: '100%', paddingLeft: 24 }}>
          <LogoutOutlined
            style={{ color: 'white', cursor: 'pointer' }}
            onClick={handleLogout}
          />
          <span
            style={{ color: 'white', marginLeft: 8, cursor: 'pointer' }}
            onClick={handleLogout}
          >
            Çıkış Yap
          </span>
        </div>
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', fontWeight: 'bold' }}>
          IzTek Carbon Footprint Admin
        </Header>

        <Content style={{ margin: 16, padding: 16, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}