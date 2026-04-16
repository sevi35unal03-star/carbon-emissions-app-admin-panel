import { useEffect, useState } from 'react';
import { Table, Card, Tag, Button, Input, Space } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../services/api';
import type { AuditLogResponse } from '../../types';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchLogs = async (page = 1, pageSize = 10, searchTerm = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        pageNumber: String(page),
        pageSize: String(pageSize),
      });
      if (searchTerm) params.append('searchTerm', searchTerm);

      const res = await api.get(`/user-logs?${params.toString()}`);
      if (res.data.isSuccessful) {
        setLogs(res.data.data);
        setPagination(prev => ({
          ...prev,
          total: res.data.totalCount,
          current: page,
          pageSize,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const operationColor: Record<string, string> = {
    'Ekleme': 'green',
    'Güncelleme': 'blue',
    'Silme': 'red',
  };

  const columns = [
    { title: 'Kullanıcı', dataIndex: 'userName' },
    {
      title: 'İşlem',
      dataIndex: 'operation',
      render: (v: string) => (
        <Tag color={operationColor[v] || 'default'}>{v}</Tag>
      ),
    },
    { title: 'Tablo', dataIndex: 'tableName' },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      render: (v: string) => new Date(v).toLocaleString('tr-TR'),
    },
    { title: 'Detay', dataIndex: 'details', ellipsis: true },
  ];

  return (
    <Card
      title="Log Kayıtları"
      extra={
        <Space>
          <Input
            placeholder="Kullanıcı, işlem veya tablo ara..."
            style={{ width: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={() => fetchLogs(1, pagination.pageSize, search)}
            suffix={<SearchOutlined />}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchLogs(1, pagination.pageSize, search)}
            loading={loading}
          >
            Ara / Yenile
          </Button>
        </Space>
      }
    >
      <Table
        rowKey={(record) => `${record.userName}-${record.createdAt}`}
        loading={loading}
        dataSource={logs}
        columns={columns}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showTotal: (total) => `Toplam ${total} kayıt`,
          onChange: (page, pageSize) => fetchLogs(page, pageSize, search),
        }}
      />
    </Card>
  );
}