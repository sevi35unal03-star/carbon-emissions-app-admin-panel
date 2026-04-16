import { useEffect, useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, InputNumber, Tag, message, Space, Descriptions } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../services/api';
import type { ActivityQuestionResponse } from '../../types';

interface PollSummaryResponse {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  questionCount: number;
}

interface PollOptionResponse {
  id: string;
  text: string;
}

interface PollQuestionResponse {
  id: string;
  text: string;
  displayOrder: number;
  options: PollOptionResponse[];
}

interface PollDetailResponse {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  questions: PollQuestionResponse[];
}

interface CreatePollForm {
  name: string;
  description: string;
  month: number;
  year: number;
  displayOrder: number;
}

export default function Polls() {
  const [polls, setPolls] = useState<PollSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<PollDetailResponse | null>(null);
  const [activityQuestions, setActivityQuestions] = useState<ActivityQuestionResponse[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [copyPollId, setCopyPollId] = useState<string | null>(null);
  const [form] = Form.useForm<CreatePollForm>();

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const res = await api.get('/polls');
      if (res.data.isSuccessful) setPolls(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolls(); }, []);

  const handleCreate = async (values: CreatePollForm) => {
    try {
      const res = await api.post('/polls', values);
      if (res.data.isSuccessful) {
        message.success('Anket oluşturuldu.');
        setCreateModalOpen(false);
        form.resetFields();
        fetchPolls();
      } else {
        message.error(res.data.errors?.[0] || 'Hata oluştu.');
      }
    } catch {
      message.error('Bir hata oluştu.');
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const res = await api.get(`/polls/${id}`);
      if (res.data.isSuccessful) {
        setSelectedPoll(res.data.data);
        setDetailModalOpen(true);
      }
    } catch {
      message.error('Detay alınamadı.');
    }
  };

  const handleOpenCopy = async (pollId: string) => {
    try {
      const res = await api.get('/activity-questions');
      if (res.data.isSuccessful) {
        setActivityQuestions(res.data.data);
        setCopyPollId(pollId);
        setSelectedQuestionIds([]);
        setCopyModalOpen(true);
      }
    } catch {
      message.error('Sorular alınamadı.');
    }
  };

  const handleCopyQuestions = async () => {
    if (!copyPollId || selectedQuestionIds.length === 0) {
      message.warning('Lütfen en az bir soru seçin.');
      return;
    }
    try {
      const res = await api.post(`/polls/${copyPollId}/questions`, {
        sourceQuestionIds: selectedQuestionIds,
      });
      if (res.data.isSuccessful) {
        message.success('Sorular kopyalandı.');
        setCopyModalOpen(false);
        setSelectedQuestionIds([]);
      } else {
        message.error(res.data.errors?.[0] || 'Hata oluştu.');
      }
    } catch {
      message.error('Bir hata oluştu.');
    }
  };



  const columns = [
  { title: 'Anket Adı', dataIndex: 'name', width: 200 },
  { title: 'Açıklama', dataIndex: 'description', ellipsis: true, width: 150 },
  {
    title: 'Oluşturulma',
    dataIndex: 'createdAt',
    width: 120,
    render: (v: string) => new Date(v).toLocaleDateString('tr-TR'),
  },
  { title: 'Soru Sayısı', dataIndex: 'questionCount', width: 100 },
  {
    title: 'Durum',
    dataIndex: 'isActive',
    width: 100,
    render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Aktif' : 'Pasif'}</Tag>,
  },
  {
    title: 'İşlem',
    width: 220,
    render: (_: unknown, r: PollSummaryResponse) => (
      <Space>
        <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(r.id)}>
          Detay
        </Button>
        <Button onClick={() => handleOpenCopy(r.id)}>
          Soru Kopyala
        </Button>
      </Space>
    ),
  },
];

  return (
    <Card
      title="Anketler"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          Yeni Anket
        </Button>
      }
    >
      <Table
  rowKey="id"
  loading={loading}
  dataSource={polls}
  columns={columns}
  scroll={{ x: 800 }}
/>

      {/* Oluştur Modal */}
      <Modal
        title="Yeni Anket Oluştur"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="name" label="Anket Adı" rules={[{ required: true, message: 'Zorunludur.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="month" label="Ay" rules={[{ required: true, message: 'Zorunludur.' }]}>
            <InputNumber min={1} max={12} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="year" label="Yıl" rules={[{ required: true, message: 'Zorunludur.' }]}>
            <InputNumber min={2024} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="displayOrder" label="Sıra" initialValue={1}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Oluştur</Button>
        </Form>
      </Modal>

      {/* Detay Modal */}
      <Modal
        title={selectedPoll?.name}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedPoll && (
          <>
            <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Açıklama">{selectedPoll.description}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={selectedPoll.isActive ? 'green' : 'red'}>
                  {selectedPoll.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <Table
              rowKey="id"
              dataSource={selectedPoll.questions}
              pagination={false}
              columns={[
                { title: 'Sıra', dataIndex: 'displayOrder', width: 60 },
                { title: 'Soru', dataIndex: 'text' },
                {
                  title: 'Seçenekler',
                  dataIndex: 'options',
                  render: (opts: PollOptionResponse[]) =>
                    opts?.map(o => <Tag key={o.id}>{o.text}</Tag>),
                },
              ]}
            />
          </>
        )}
      </Modal>

      {/* Soru Kopyala Modal */}
      <Modal
        title="Aktivite Sorularını Ankete Kopyala"
        open={copyModalOpen}
        onCancel={() => { setCopyModalOpen(false); setSelectedQuestionIds([]); }}
        onOk={handleCopyQuestions}
        okText="Kopyala"
        cancelText="İptal"
        width={600}
      >
        <Table
          rowKey="id"
          dataSource={activityQuestions}
          rowSelection={{
            selectedRowKeys: selectedQuestionIds,
            onChange: (keys) => setSelectedQuestionIds(keys as string[]),
          }}
          columns={[
            { title: 'Soru', dataIndex: 'text' },
            { title: 'Sıra', dataIndex: 'displayOrder', width: 60 },
          ]}
          pagination={false}
        />
      </Modal>
    </Card>
  );
}