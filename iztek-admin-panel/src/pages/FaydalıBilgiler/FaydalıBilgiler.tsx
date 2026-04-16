import { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Input, InputNumber, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';
import type { UsefulInformationResponse, CreateUsefulInformationForm } from '../../types';

export default function FaydaliBilgiler() {
  const [data, setData] = useState<UsefulInformationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateUsefulInformationForm>({
    title: '',
    content: '',
    displayOrder: 1,
  });

  const fetchBilgiler = async () => {
    setLoading(true);
    try {
      const res = await api.get('/useful-information');
      if (res.data.isSuccessful) setData(res.data.data || []);
      else message.error('Liste alınamadı.');
    } catch {
      message.error('Sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBilgiler(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) { message.warning('Başlık zorunludur.'); return; }
    setModalLoading(true);
    try {
      const res = selectedId
        ? await api.put(`/useful-information/${selectedId}`, form)
        : await api.post('/useful-information', form);

      if (res.data.isSuccessful) {
        message.success(selectedId ? 'Güncellendi.' : 'Eklendi.');
        setOpen(false);
        setSelectedId(null);
        setForm({ title: '', content: '', displayOrder: 1 });
        fetchBilgiler();
      } else {
        message.error(res.data.errors?.[0] || 'İşlem başarısız.');
      }
    } catch {
      message.error('Bir hata oluştu.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = (item: UsefulInformationResponse) => {
    Modal.confirm({
      title: 'Silmek istiyor musunuz?',
      content: item.title,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          const res = await api.delete(`/useful-information/${item.id}`);
          if (res.data.isSuccessful || res.status === 200 || res.status === 204) {
            message.success('Silindi.');
            fetchBilgiler();
          } else {
            message.error('Silme başarısız.');
          }
        } catch {
          message.error('Bir hata oluştu.');
        }
      },
    });
  };

  const handleEdit = (item: UsefulInformationResponse) => {
    setForm({ title: item.title, content: item.content, displayOrder: item.displayOrder });
    setSelectedId(item.id);
    setOpen(true);
  };

  const columns = [
    { title: 'Başlık', dataIndex: 'title' },
    { title: 'Sıra', dataIndex: 'displayOrder', width: 80 },
    { title: 'İçerik', dataIndex: 'content', ellipsis: true },
    {
      title: 'İşlem',
      width: 120,
      render: (_: unknown, r: UsefulInformationResponse) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(r)} />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Faydalı Bilgiler"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setForm({ title: '', content: '', displayOrder: 1 });
            setSelectedId(null);
            setOpen(true);
          }}
        >
          Yeni Ekle
        </Button>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={columns}
      />

      <Modal
        title={selectedId ? 'Güncelle' : 'Yeni Ekle'}
        open={open}
        onCancel={() => { setOpen(false); setSelectedId(null); }}
        onOk={handleSave}
        confirmLoading={modalLoading}
        okText={selectedId ? 'Güncelle' : 'Ekle'}
        cancelText="İptal"
      >
        <Input
          placeholder="Başlık"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Input.TextArea
          placeholder="İçerik"
          rows={5}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <InputNumber
          placeholder="Sıra"
          min={1}
          value={form.displayOrder}
          onChange={(v) => setForm({ ...form, displayOrder: v ?? 1 })}
          style={{ width: '100%' }}
        />
      </Modal>
    </Card>
  );
}