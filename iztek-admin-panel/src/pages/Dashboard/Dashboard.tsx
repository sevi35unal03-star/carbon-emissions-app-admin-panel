import { useEffect, useState, useRef } from 'react';
import { Card, Table, Tag, Select, Space } from 'antd';
import api from '../../services/api';

interface LeaderItem {
  rank: number;
  fullName: string;
  treeCount: number;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  podium: LeaderItem[];
  leaders: LeaderItem[];
  currentUserRank: {
    rank: number;
    treeCount: number;
    message: string;
  } | null;
}

export default function Dashboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [leaderMonth, setLeaderMonth] = useState(new Date().getMonth() + 1);
  const [leaderYear, setLeaderYear] = useState(new Date().getFullYear());
  const hasFetched = useRef(false);

  const months = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  const fetchLeaderboard = async (month: number, year: number) => {
    try {
      const res = await api.get(`/user-results/leaderboard?month=${month}&year=${year}`);
      if (res.data.isSuccessful) setLeaderboard(res.data.data);
    } catch {
      setLeaderboard(null);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchLeaderboard(leaderMonth, leaderYear);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (month: number, year: number) => {
    setLeaderMonth(month);
    setLeaderYear(year);
    fetchLeaderboard(month, year);
  };

  const allLeaders = [
    ...(leaderboard?.podium ?? []),
    ...(leaderboard?.leaders ?? []),
  ];

  const rankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return undefined;
  };

  const columns = [
    {
      title: 'Sıra',
      dataIndex: 'rank',
      width: 70,
      render: (v: number) => (
        <span style={{ fontWeight: v <= 3 ? 'bold' : 'normal', color: rankColor(v) }}>
          #{v}
        </span>
      ),
    },
    {
      title: 'Ad Soyad',
      dataIndex: 'fullName',
      render: (v: string, r: LeaderItem) =>
        r.isCurrentUser ? <Tag color="blue">{v} (Siz)</Tag> : v,
    },
    {
      title: 'Ağaç Sayısı',
      dataIndex: 'treeCount',
      render: (v: number) => `${v.toLocaleString('tr-TR')} ağaç`,
      sorter: (a: LeaderItem, b: LeaderItem) => a.treeCount - b.treeCount,
    },
  ];

  return (
    <Card
      title="Aylık Liderlik Tablosu"
      extra={
        <Space>
          <Select
            value={leaderMonth}
            onChange={(v) => handleFilter(v, leaderYear)}
            style={{ width: 110 }}
            options={months.slice(1).map((m, i) => ({ value: i + 1, label: m }))}
          />
          <Select
            value={leaderYear}
            onChange={(v) => handleFilter(leaderMonth, v)}
            style={{ width: 90 }}
            options={[2024, 2025, 2026].map(y => ({ value: y, label: String(y) }))}
          />
        </Space>
      }
    >
      {allLeaders.length === 0 ? (
        <p style={{ color: '#999' }}>Bu ay için liderlik verisi bulunamadı.</p>
      ) : (
        <Table
          rowKey="rank"
          dataSource={allLeaders}
          columns={columns}
          pagination={false}
        />
      )}
    </Card>
  );
}