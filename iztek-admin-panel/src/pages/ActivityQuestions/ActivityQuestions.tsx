import { useEffect, useMemo, useState } from 'react';
import {
  Table, Card, Button, Space, Modal, Form, Input,
  DatePicker, InputNumber, Popconfirm, message, Select
} from 'antd';
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
  children?: ActivityQuestion[];
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

  // 🔥 TREE BUILDER
  const buildTree = (questions: ActivityQuestion[]) => {
    const map = new Map<string, ActivityQuestion & { children: ActivityQuestion[] }>();

    questions.forEach(q => {
      map.set(q.id, { ...q, children: [] });
    });

    questions.forEach(q => {
      q.options.forEach(opt => {
        if (opt.nextQuestionId && map.has(opt.nextQuestionId)) {
          map.get(q.id)!.children.push(map.get(opt.nextQuestionId)!);
        }
      });
    });

    return Array.from(map.values());
  };

  const treeData = useMemo(() => buildTree(questions), [questions]);

  // 🔥 Dropdown için
  const questionOptions = useMemo(() => (
    questions.map(q => ({
      label: q.text,
      value: q.id
    }))
  ), [questions]);

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
      title: 'Tarih',
      render: (_: unknown, r: ActivityQuestion) =>
        `${dayjs(r.startDate).format('DD.MM')} - ${dayjs(r.endDate).format('DD.MM')}`,
    },
    {
      title: 'Options',
      render: (_: unknown, r: ActivityQuestion) =>
        r.options.map(o =>
          `${o.text} → ${o.nextQuestionId ? 'Bağlı' : 'Son'}`
        ).join(' | ')
    },
    {
      title: 'İşlemler',
      render: (_: unknown, record: ActivityQuestion) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm
            title="Silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Aktivite Soruları (Tree)"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Yeni Soru
        </Button>
      }
    >
      <Table
        dataSource={treeData}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingId ? 'Düzenle' : 'Yeni Soru'}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="text" label="Soru">
            <Input.TextArea />
          </Form.Item>

          <Space>
            <Form.Item name="displayOrder" label="Sıra">
              <InputNumber min={1} />
            </Form.Item>

            <Form.Item name="dateRange" label="Tarih">
              <DatePicker.RangePicker />
            </Form.Item>

            <Form.Item name="scheduledTime" label="Saat">
              <DatePicker picker="time" />
            </Form.Item>
          </Space>

          <Form.List name="options">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline">
                    <Form.Item {...restField} name={[name, 'text']} label="Metin">
                      <Input />
                    </Form.Item>

                    <Form.Item {...restField} name={[name, 'carbonValue']} label="CO2">
                      <InputNumber />
                    </Form.Item>

                    <Form.Item {...restField} name={[name, 'nextQuestionId']} label="Sonraki">
                      <Select
                        allowClear
                        options={questionOptions}
                        placeholder="Bağla"
                      />
                    </Form.Item>

                    <Button danger onClick={() => remove(name)}>Sil</Button>
                  </Space>
                ))}

                <Button onClick={() => add()} block icon={<PlusOutlined />}>
                  Seçenek ekle
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Card>
  );
}