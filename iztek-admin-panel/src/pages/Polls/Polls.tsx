import { useEffect, useState } from 'react';
import {
  Table, Card, Button, Modal, Form, Input,
  InputNumber, Tag, message, Descriptions
} from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../services/api';

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
  message: string | null;
  carbonValue: number; // ✅ FIX
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
  questions: {
    text: string;
    displayOrder: number;
    options: {
      text: string;
      carbonValue: number;
      message?: string | null;
      displayOrder: number;
    }[];
  }[];
}

export default function Polls() {
  const [polls, setPolls] = useState<PollSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<PollDetailResponse | null>(null);

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

  useEffect(() => {
    fetchPolls();
  }, []);

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

  const columns = [
    { title: 'Anket Adı', dataIndex: 'name' },
    { title: 'Açıklama', dataIndex: 'description' },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString('tr-TR'),
    },
    { title: 'Soru Sayısı', dataIndex: 'questionCount' },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'red'}>
          {v ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'İşlem',
      render: (_: unknown, r: PollSummaryResponse) => (
        <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(r.id)}>
          Detay
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="Anketler"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
        >
          Yeni Anket
        </Button>
      }
    >
      <Table rowKey="id" loading={loading} dataSource={polls} columns={columns} />

      {/* CREATE MODAL */}
      <Modal
        title="Yeni Anket"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Ad" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Açıklama">
            <Input.TextArea />
          </Form.Item>

          <Form.Item name="month" label="Ay" rules={[{ required: true }]}>
            <InputNumber min={1} max={12} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="year" label="Yıl" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="displayOrder" label="Sıra" initialValue={1}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          {/* QUESTIONS */}
          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Card key={field.key} style={{ marginBottom: 16 }}>
                    <Form.Item
                      name={[field.name, 'text']}
                      label="Soru"
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name={[field.name, 'displayOrder']}
                      label="Sıra"
                    >
                      <InputNumber />
                    </Form.Item>

                    {/* OPTIONS */}
                    <Form.List name={[field.name, 'options']}>
                      {(opts, { add: addOpt, remove: removeOpt }) => (
                        <>
                          {opts.map((opt) => (
                            <Card key={opt.key} size="small" style={{ marginBottom: 8 }}>
                              <Form.Item
                                name={[opt.name, 'text']}
                                label="Seçenek"
                                rules={[{ required: true }]}
                              >
                                <Input />
                              </Form.Item>

                              <Form.Item
                                name={[opt.name, 'carbonValue']}
                                label="Carbon"
                                rules={[{ required: true }]}
                              >
                                <InputNumber />
                              </Form.Item>

                              <Form.Item
                                name={[opt.name, 'message']}
                                label="Mesaj"
                              >
                                <Input />
                              </Form.Item>

                              <Form.Item
                                name={[opt.name, 'displayOrder']}
                                label="Sıra"
                              >
                                <InputNumber />
                              </Form.Item>

                              <Button danger onClick={() => removeOpt(opt.name)}>
                                Seçeneği Sil
                              </Button>
                            </Card>
                          ))}

                          <Button onClick={() => addOpt()}>
                            + Seçenek Ekle
                          </Button>
                        </>
                      )}
                    </Form.List>

                    <Button danger onClick={() => remove(field.name)}>
                      Soruyu Sil
                    </Button>
                  </Card>
                ))}

                <Button type="dashed" onClick={() => add()}>
                  + Soru Ekle
                </Button>
              </>
            )}
          </Form.List>

          <Button type="primary" htmlType="submit" block>
            Kaydet
          </Button>
        </Form>
      </Modal>

      {/* DETAIL */}
      <Modal
        title={selectedPoll?.name}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
      >
        {selectedPoll && (
          <>
            <Descriptions bordered>
              <Descriptions.Item label="Açıklama">
                {selectedPoll.description}
              </Descriptions.Item>
            </Descriptions>

            <Table
              rowKey="id"
              dataSource={selectedPoll.questions}
              pagination={false}
              columns={[
                { title: 'Soru', dataIndex: 'text' },
                {
                  title: 'Seçenekler',
                  dataIndex: 'options',
                  render: (opts: PollOptionResponse[]) =>
                    opts.map((o) => <Tag key={o.id}>{o.text}</Tag>),
                },
              ]}
            />
          </>
        )}
      </Modal>
    </Card>
  );
}