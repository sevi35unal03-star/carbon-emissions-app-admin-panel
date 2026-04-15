import { useState } from 'react';
import { Table, Card, Tag } from 'antd';

export default function KarbonAyakIzi() {

  const [data] = useState([
    { kullanici: 'ahmet', tarih: '2025-04-13', puan: 42 },
    { kullanici: 'fatma', tarih: '2025-04-13', puan: 28 },
  ]);

  const columns = [
    {
      title: 'Kullanıcı',
      dataIndex: 'kullanici',
    },
    {
      title: 'Tarih',
      dataIndex: 'tarih',
    },
    {
      title: 'Puan',
      dataIndex: 'puan',
      render: (puan: number) => `${puan} kg CO₂`,
    },
    {
      title: 'Seviye',
      render: (record: any) => {
        if (record.puan < 30) return <Tag color="green">Düşük</Tag>;
        if (record.puan < 55) return <Tag color="orange">Orta</Tag>;
        return <Tag color="red">Yüksek</Tag>;
      }
    }
  ];

  return (
    <Card title="Karbon Ayak İzi Hesapları">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="kullanici"
      />
    </Card>
  );
}
