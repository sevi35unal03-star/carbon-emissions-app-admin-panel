import { useEffect, useState } from 'react';
import { Table, Card, Select, InputNumber, Button, Space, Tag, Modal, Descriptions, message } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../services/api';
import type { PollSummaryResponse } from '../../types';

interface UserPollResult {
  userId: string;
  userName: string;
  totalScore: number;
  treeCount: number;
}

interface PollAnswerDetailDto {
  questionText: string;
  selectedOptionText: string;
  carbonValue: number;
}

interface UserPollDetailResponse {
  userName: string;
  totalScore: number;
  treeCount: number;
  answers: PollAnswerDetailDto[];
}

export default function KarbonAyakIzi() {
  const [polls, setPolls] = useState<PollSummaryResponse[]>([]);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [results, setResults] = useState<UserPollResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<UserPollDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const months = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  useEffect(() => {
    api.get('/polls').then(res => {
      if (res.data.isSuccessful) setPolls(res.data.data);
    });
  }, []);

  const handleSearch = async () => {
    if (!selectedPollId) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/user-results/poll-results?pollSetId=${selectedPollId}&month=${month}&year=${year}`
      );
      if (res.data.isSuccessful) {
        if (res.data.data.length === 0) message.info('Bu anket için sonuç bulunamadı.');
        setResults(res.data.data);
      } else {
        message.error(res.data.errors?.[0] || 'Bir hata oluştu.');
      }
    } catch {
      message.error('Sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (targetUserId: string) => {
    if (!selectedPollId) return;
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await api.get(
       `/user-results/poll-detail?pollSetId=${selectedPollId}&month=${month}&year=${year}&targetUserId=${targetUserId}`
      );
      if (res.data.isSuccessful) {
        setDetailData(res.data.data);
        setDetailVisible(true);
      } else {
        message.error('Detaylar getirilemedi.');
      }
    } catch {
      message.error('Detay yükleme hatası.');
    } finally {
      setDetailLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score < 30) return 'green';
    if (score < 60) return 'orange';
    return 'red';
  };

  const columns = [
    { title: 'Kullanıcı', dataIndex: 'userName', key: 'userName' },
    {
      title: 'Karbon Skoru',
      dataIndex: 'totalScore',
      key: 'totalScore',
      render: (v: number) => <Tag color={scoreColor(v)}>{v} kg CO₂</Tag>,
      sorter: (a: UserPollResult, b: UserPollResult) => a.totalScore - b.totalScore,
    },
    {
      title: 'Hesaplanan Ağaç',
      dataIndex: 'treeCount',
      key: 'treeCount',
      render: (v: number) => `${v.toLocaleString('tr-TR')} ağaç`,
      sorter: (a: UserPollResult, b: UserPollResult) => a.treeCount - b.treeCount,
    },
    {
      title: 'İşlem',
      key: 'action',
      render: (_: unknown, record: UserPollResult) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.userId)}
          loading={detailLoading}
        >
          Detay
        </Button>
      ),
    },
  ];

  return (
    <Card title="Karbon Ayak İzi Hesapları">
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="Anket seçin"
          style={{ width: 250 }}
          onChange={(v) => {
            setSelectedPollId(v);
            const selectedPoll = polls.find(p => p.id === v);
            if (selectedPoll) {
              setMonth(selectedPoll.month);
              setYear(selectedPoll.year);
            }
          }}
          options={polls.map(p => ({
            value: p.id,
            label: `${p.name} (${months[p.month]} ${p.year})`,
          }))}
        />
        <Select
          value={month}
          onChange={setMonth}
          style={{ width: 120 }}
          options={months.slice(1).map((m, i) => ({ value: i + 1, label: m }))}
        />
        <InputNumber
          value={year}
          onChange={(v) => v && setYear(v)}
          min={2024}
          style={{ width: 100 }}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
          loading={loading}
          disabled={!selectedPollId}
        >
          Listele
        </Button>
      </Space>

      <Table
        rowKey="userId"
        loading={loading}
        dataSource={results}
        columns={columns}
      />

      <Modal
        title="Kullanıcı Anket Detayı"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={750}
        destroyOnClose
      >
        {detailLoading ? (
          <p>Yükleniyor...</p>
        ) : detailData && (
          <>
            <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Kullanıcı" span={3}>
                <b>{detailData.userName}</b>
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Skor">
                <Tag color={scoreColor(detailData.totalScore)}>
                  {detailData.totalScore} kg CO₂
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Hesaplanan Ağaç">
                {detailData.treeCount.toLocaleString('tr-TR')} ağaç
              </Descriptions.Item>
            </Descriptions>
            <Table
              rowKey="questionText"
              dataSource={detailData.answers}
              size="small"
              pagination={false}
              columns={[
                { title: 'Soru', dataIndex: 'questionText', key: 'question' },
                { title: 'Cevap', dataIndex: 'selectedOptionText', key: 'answer' },
                {
                  title: 'Karbon Değeri',
                  dataIndex: 'carbonValue',
                  key: 'carbon',
                  render: (v: number) => (
                    <Tag color={v > 0 ? 'volcano' : 'green'}>{v}</Tag>
                  ),
                },
              ]}
            />
          </>
        )}
      </Modal>
    </Card>
  );
}