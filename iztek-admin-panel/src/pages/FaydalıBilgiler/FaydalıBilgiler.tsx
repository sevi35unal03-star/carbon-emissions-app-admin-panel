import { useState, useEffect } from "react";
import { Card, Button, List, Modal, Input, message } from "antd";
import api from "../../services/api";

interface Bilgi {
  title: string;
  content: string;
  id?: string;
}

export default function FaydaliBilgiler() {
  const [data, setData] = useState<Bilgi[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<Bilgi>({
    title: "",
    content: ""
  });

  // ================= GET =================
  const fetchBilgiler = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/useful-information");

      console.log("GET RESPONSE:", res.data);

      if (res.data.isSuccessful) {
        setData(res.data.data || []);
      } else {
        message.error("Liste alınamadı");
      }
    } catch (err) {
      console.log("GET ERROR:", err);
      message.error("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilgiler();
  }, []);

  // ================= SAVE =================
  const handleSave = async () => {
    if (!form.title.trim()) {
      message.warning("Başlık zorunlu");
      return;
    }

    setModalLoading(true);

    try {
      if (selectedId) {
        const res = await api.put(
          `/api/v1/useful-information/${selectedId}`,
          form
        );

        console.log("UPDATE RESPONSE:", res.data);

        if (res.data.isSuccessful) {
          message.success("Güncellendi");
        }
      } else {
        const res = await api.post(
          "/api/v1/useful-information",
          form
        );

        console.log("CREATE RESPONSE:", res.data);

        if (res.data.isSuccessful) {
          message.success("Eklendi");
        }
      }

      setOpen(false);
      setSelectedId(null);
      setForm({ title: "", content: "" });

      fetchBilgiler();
    } catch (err) {
      console.log("SAVE ERROR:", err);
      message.error("İşlem başarısız");
    } finally {
      setModalLoading(false);
    }
  };

  // ================= DELETE (FIXED) =================
  const handleDelete = (item: Bilgi) => {
    if (!item.id) {
      message.error("ID yok");
      return;
    }

    Modal.confirm({
      title: "Silmek istiyor musun?",
      content: item.title,
      okText: "Sil",
      okType: "danger",

      onOk: async () => {
        try {
          const res = await api.delete(
            `/api/v1/useful-information/${item.id}`
          );

          console.log("DELETE STATUS:", res.status);
          console.log("DELETE RESPONSE:", res.data);

          // 🔥 FIX: status bazlı kontrol
          if (res.status === 200 || res.status === 204) {
            message.success("Silindi");
            fetchBilgiler();
          } else if (res.data?.isSuccessful) {
            message.success("Silindi");
            fetchBilgiler();
          } else {
            message.error("Silme başarısız");
          }
        } catch (err) {
          console.log("DELETE ERROR:", err);
          message.error("Delete hata verdi");
        }
      }
    });
  };

  // ================= EDIT =================
  const handleEdit = (item: Bilgi) => {
    setForm({
      title: item.title,
      content: item.content
    });

    setSelectedId(item.id!);
    setOpen(true);
  };

  return (
    <Card
      title="Faydalı Bilgiler"
      extra={
        <Button
          type="primary"
          onClick={() => {
            setForm({ title: "", content: "" });
            setSelectedId(null);
            setOpen(true);
          }}
        >
          Yeni Ekle
        </Button>
      }
      loading={loading}
    >
      <List
        dataSource={data}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button onClick={() => handleEdit(item)}>
                Düzenle
              </Button>,
              <Button danger onClick={() => handleDelete(item)}>
                Sil
              </Button>
            ]}
          >
            <List.Item.Meta
              title={item.title}
              description={item.content?.slice(0, 80)}
            />
          </List.Item>
        )}
      />

      <Modal
        title={selectedId ? "Güncelle" : "Yeni Ekle"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setSelectedId(null);
        }}
        onOk={handleSave}
        confirmLoading={modalLoading}
      >
        <Input
          placeholder="Başlık"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />

        <Input.TextArea
          placeholder="İçerik"
          rows={5}
          value={form.content}
          onChange={(e) =>
            setForm({ ...form, content: e.target.value })
          }
        />
      </Modal>
    </Card>
  );
}