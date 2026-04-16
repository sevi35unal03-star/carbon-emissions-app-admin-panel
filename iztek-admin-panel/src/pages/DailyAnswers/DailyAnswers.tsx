import { useEffect, useState } from 'react';
import { Table, Card, Tag, Button, Select, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import api from '../../services/api';

interface UserDailyResult {
  id: string;
  lastLoginDate: string | null;
  carbonFootprintScore: number;
  dailyActivitiesCount: number;
  totalCurrentScore: number;
  donatedTreeCount: number;
  equivalentPoints: number;
}

interface UserInfo {
  id: string;
  name: string;
  surname: string;
  email: string;
}

export default function DailyAnswers() {
  const [results, setResults] = useState<UserDailyResult[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterUserId, setFilterUserId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dailyRes, usersRes] = await Promise.all([
        api.get('/user-results/daily'),
        api.get('/users?pageNumber=1&pageSize=100'),
      ]);
      if (dailyRes.data.isSuccessful) setResults(dailyRes.data.data);
      if (usersRes.data.isSuccessful) setUsers(usersRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getUserName = (id: string) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.name} ${user.surname}` : '-';
  };

  const filteredResults = filterUserId
    ? results.filter(r => r.id === filterUserId)
    : results;

  const columns = [
    {
      title: 'Kullanıcı Adı',
      dataIndex: 'id',
      render: (id: string) => getUserName(id),
    },
    {
      title: 'Son Giriş Tarihi',
      dataIndex: 'lastLoginDate',
      render: (v: string | null) =>
        v ? new Date(v).toLocaleString('tr-TR') : '-',
    },
    {
      title: 'Karbon Ayak İzi Puanı',
      dataIndex: 'carbonFootprintScore',
      render: (v: number) => (
        <Tag color={v === 0 ? 'default' : v < 50 ? 'green' : v < 100 ? 'orange' : 'red'}>
          {v} kg CO₂
        </Tag>
      ),
      sorter: (a: UserDailyResult, b: UserDailyResult) =>
        a.carbonFootprintScore - b.carbonFootprintScore,
    },
    {
      title: 'Günlük Aktiviteler',
      dataIndex: 'dailyActivitiesCount',
      render: (v: number) => (
        <Tag color={v > 0 ? 'green' : 'default'}>{v} aktivite</Tag>
      ),
    },
    {
      title: 'Toplam Puan',
      dataIndex: 'totalCurrentScore',
      render: (v: number) => v.toLocaleString('tr-TR'),
      sorter: (a: UserDailyResult, b: UserDailyResult) =>
        a.totalCurrentScore - b.totalCurrentScore,
    },
    {
      title: 'Bağışlanan Ağaç',
      dataIndex: 'donatedTreeCount',
      render: (v: number, r: UserDailyResult) => (
        <Space direction="vertical" size={0}>
          <span>{v.toLocaleString('tr-TR')} ağaç</span>
          <span style={{ color: '#888', fontSize: 12 }}>
            {r.equivalentPoints.toLocaleString('tr-TR')} puan
          </span>
        </Space>
      ),
      sorter: (a: UserDailyResult, b: UserDailyResult) =>
        a.donatedTreeCount - b.donatedTreeCount,
    },
  ];

  return (
    <Card
      title="Günlük Cevaplar"
      extra={
        <Space>
          <Select
            allowClear
            placeholder="Kullanıcıya göre filtrele"
            style={{ width: 220 }}
            onChange={(v) => setFilterUserId(v ?? null)}
            options={users.map(u => ({
              value: u.id,
              label: `${u.name} ${u.surname}`,
            }))}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
          >
            Yenile
          </Button>
        </Space>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={filteredResults}
        columns={columns}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Toplam ${total} kullanıcı`,
        }}
      />
    </Card>
  );
}