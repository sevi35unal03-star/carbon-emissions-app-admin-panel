import { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, DatePicker, InputNumber, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs, { Dayjs } from 'dayjs';

interface ActivityOption {
  id?: string;
  text: string;
  carbonValue: number;
  nextQuestionId?: string | null;
}

interface ActivityQuestion {
  id: string;
  text: string;
  displayOrder: number;
  startDate: string;
  endDate: string;
  scheduledTime: string;
  options: ActivityOption[];
}

interface ActivityQuestionForm {
  text: string;
  displayOrder: number;
  dateRange: [Dayjs, Dayjs];
  scheduledTime: Dayjs;
  options: ActivityOption[];
}

export default function ActivityQuestions() {
  const [questions, setQuestions] = useState<ActivityQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm<ActivityQuestionForm>();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/activity-questions');
      if (res.data.isSuccessful) setQuestions(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleSave = async (values: ActivityQuestionForm) => {
    const payload = {
      text: values.text,
      displayOrder: values.displayOrder,
      startDate: values.dateRange[0].format('YYYY-MM-DD'),
      endDate: values.dateRange[1].format('YYYY-MM-DD'),
      scheduledTime: values.scheduledTime.format('HH:mm:ss'),
      notificationTime: values.scheduledTime.format('HH:mm:ss'),
      options: values.options,
    };

    try {
      if (editingId) {
        await api.put(`/activity-questions/${editingId}`, payload);
        message.success('Soru güncellendi.');
      } else {
        await api.post('/activity-questions', payload);
        message.success('Yeni soru oluşturuldu.');
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchQuestions();
    } catch {
      message.error('İşlem başarısız.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/activity-questions/${id}`);
      message.success('Soru silindi.');
      fetchQuestions();
    } catch {
      message.error('Silme işlemi başarısız.');
    }
  };

  const openModal = (record?: ActivityQuestion) => {
    setEditingId(record?.id ?? null);
    if (record) {
      form.setFieldsValue({
        text: record.text,
        displayOrder: record.displayOrder,
        dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
        scheduledTime: dayjs(`2000-01-01 ${record.scheduledTime}`),
        options: record.options,
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'Sıra', dataIndex: 'displayOrder', width: 70 },
    { title: 'Soru Metni', dataIndex: 'text' },
    {
      title: 'Tarih Aralığı',
      render: (_: unknown, r: ActivityQuestion) =>
        `${dayjs(r.startDate).format('DD.MM.YYYY')} - ${dayjs(r.endDate).format('DD.MM.YYYY')}`,
    },
    { title: 'Bildirim Saati', dataIndex: 'scheduledTime' },
    {
      title: 'İşlemler',
      render: (_: unknown, record: ActivityQuestion) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm
            title="Silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sil"
            cancelText="İptal"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Aktivite Soruları"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Yeni Soru
        </Button>
      }
    >
      <Table dataSource={questions} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title={editingId ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        width={700}
        okText={editingId ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="text" label="Soru Metni" rules={[{ required: true, message: 'Soru metni zorunludur.' }]}>
            <Input.TextArea rows={2} />
          </Form.Item>

          <Space size="large">
            <Form.Item name="displayOrder" label="Görüntüleme Sırası" initialValue={1}>
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item name="dateRange" label="Yayın Aralığı" rules={[{ required: true, message: 'Tarih aralığı zorunludur.' }]}>
              <DatePicker.RangePicker format="DD.MM.YYYY" />
            </Form.Item>
            <Form.Item name="scheduledTime" label="Bildirim Saati" rules={[{ required: true, message: 'Bildirim saati zorunludur.' }]}>
              <DatePicker picker="time" format="HH:mm" />
            </Form.Item>
          </Space>

          <Form.List name="options" initialValue={[{ text: '', carbonValue: 0 }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'text']}
                      label="Seçenek Metni"
                      rules={[{ required: true, message: 'Seçenek metni zorunludur.' }]}
                    >
                      <Input placeholder="Örn: Evet" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'carbonValue']}
                      label="Karbon Değeri"
                    >
                      <InputNumber />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button type="link" danger onClick={() => remove(name)}>Sil</Button>
                    )}
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Seçenek Ekle
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Card>
  );
}