
import { useEffect, useState } from "react";
import { Card, Input, Button, List, Modal, message } from "antd";
import api from "../../services/api";

// ================= TYPES =================
interface TreeDefinition {
  treePrice: number;
  minCarbonRequired: number;
}

interface ScoringSetting {
  id: string;
  key: string;
  value: number;
}

interface Goal {
  id?: string;
  month: number;
  year: number;
  targetTreeCount: number;
}

const MONTHS = [
  "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
  "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"
];

// ================= COMPONENT =================
export default function Definitions() {
  const [tree, setTree] = useState<TreeDefinition>({ treePrice: 0, minCarbonRequired: 0 });
  const [scoring, setScoring] = useState<ScoringSetting[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const [loadingTree, setLoadingTree] = useState(false);
  const [loadingScoring, setLoadingScoring] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Goal>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    targetTreeCount: 0
  });

  // ✅ SADECE BU EKLENDİ (paginate)
  const [page, setPage] = useState(1);
  const pageSize = 4;

  // ================= FETCH =================
  const fetchTree = async () => {
    setLoadingTree(true);
    try {
      const res = await api.get("/definitions/tree");
      if (res.data.isSuccessful) setTree(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTree(false);
    }
  };

  const fetchScoring = async () => {
    setLoadingScoring(true);
    try {
      const res = await api.get("/definitions/scoring-settings");
      if (res.data.isSuccessful) setScoring(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScoring(false);
    }
  };

  const fetchGoals = async () => {
    setLoadingGoals(true);
    try {
      const res = await api.get("/goals/global");
      if (res.data.isSuccessful) setGoals(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGoals(false);
    }
  };

  useEffect(() => {
    fetchTree();
    fetchScoring();
    fetchGoals();
  }, []);

  // ================= HELPERS =================
  const yearlyGoal = goals.find(g => g.month === 0 && g.year === selectedYear);

  const getMonthlyGoal = (month: number) =>
    goals.find(g => g.month === month && g.year === selectedYear);

  // ✅ paginate edilmiş aylar
  const paginatedMonths = MONTHS
    .map((name, i) => ({ name, month: i + 1 }))
    .slice((page - 1) * pageSize, page * pageSize);

  // ================= SAVE TREE =================
  const saveTree = async () => {
    setSaving(true);
    try {
      await api.put("/definitions/tree", tree);
      message.success("Ağaç ayarları güncellendi");
    } catch {
      message.error("Hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // ================= SAVE SCORING =================
  const saveScoring = async () => {
    setSaving(true);
    try {
      await api.put("/definitions/scoring-settings", {
        settings: scoring.map(x => ({ id: x.id, value: x.value }))
      });
      message.success("Skor ayarları güncellendi");
    } catch {
      message.error("Hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // ================= SAVE YEARLY GOAL =================
  const saveYearlyGoal = async (targetTreeCount: number) => {
    try {
      if (yearlyGoal?.id) {
        await api.put(`/goals/global/${yearlyGoal.id}`, {
          month: 0,
          year: selectedYear,
          targetTreeCount
        });
        setGoals(prev =>
          prev.map(g => g.id === yearlyGoal.id ? { ...g, targetTreeCount } : g)
        );
      } else {
        const res = await api.post("/goals/global", {
          month: 0,
          year: selectedYear,
          targetTreeCount
        });
        const newGoal = res.data?.data;
        if (newGoal) setGoals(prev => [newGoal, ...prev]);
        else fetchGoals();
      }
      message.success("Yıllık hedef kaydedildi");
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.response?.data?.title;
      message.error(msg || "Hata oluştu");
    }
  };

  // ================= SAVE MONTHLY GOAL =================
  const saveGoal = async () => {
    try {
      if (selectedId) {
        await api.put(`/goals/global/${selectedId}`, form);
        setGoals(prev => prev.map(g => g.id === selectedId ? { ...g, ...form } : g));
        message.success("Güncellendi");
      } else {
        const res = await api.post("/goals/global", form);
        const newGoal = res.data?.data;
        if (newGoal) setGoals(prev => [newGoal, ...prev]);
        else fetchGoals();
        message.success("Eklendi");
      }
      setOpen(false);
      setSelectedId(null);
      setForm({ month: new Date().getMonth() + 1, year: selectedYear, targetTreeCount: 0 });
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.response?.data?.title;
      message.error(msg || "Hata oluştu");
    }
  };

  // ================= DELETE =================
  const deleteGoal = (item: Goal) => {
    Modal.confirm({
      title: "Silmek istiyor musun?",
      content: `Hedef: ${item.targetTreeCount} ağaç`,
      onOk: async () => {
        try {
          await api.delete(
            `/goals/global/${item.id}?month=${item.month}&year=${item.year}`
          );
          setGoals(prev => prev.filter(g => g.id !== item.id));
          message.success("Silindi");
        } catch {
          message.error("Silinemedi");
        }
      }
    });
  };

  const [yearlyInput, setYearlyInput] = useState<number>(0);

  useEffect(() => {
    setYearlyInput(yearlyGoal?.targetTreeCount ?? 0);
  }, [selectedYear, goals]);

  // ================= UI =================
  return (
    <>
      {/* TREE */}
      <Card
        title="Ağaç Ayarları"
        loading={loadingTree}
        extra={<Button onClick={saveTree} loading={saving}>Kaydet</Button>}
      >
        <Input
          type="number"
          placeholder="Ağaç için gereken puan"
          value={tree.treePrice}
          onChange={e => setTree({ ...tree, treePrice: Number(e.target.value) })}
          style={{ marginBottom: 10 }}
        />
        <Input
          type="number"
          placeholder="Minimum karbon"
          value={tree.minCarbonRequired}
          onChange={e => setTree({ ...tree, minCarbonRequired: Number(e.target.value) })}
        />
      </Card>

      {/* SCORING */}
      <Card
        title="Skor Ayarları"
        loading={loadingScoring}
        style={{ marginTop: 20 }}
        extra={<Button onClick={saveScoring} loading={saving}>Kaydet</Button>}
      >
        <List
          dataSource={scoring}
          renderItem={(item, index) => (
            <List.Item>
              <Input value={item.key} disabled style={{ width: "40%" }} />
              <Input
                type="number"
                value={item.value}
                onChange={e => {
                  const list = [...scoring];
                  list[index].value = Number(e.target.value);
                  setScoring(list);
                }}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* YIL */}
      <Card style={{ marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button onClick={() => setSelectedYear(y => y - 1)}>←</Button>
          <span style={{ fontSize: 16, fontWeight: 500, minWidth: 60, textAlign: "center" }}>
            {selectedYear}
          </span>
          <Button onClick={() => setSelectedYear(y => y + 1)}>→</Button>
        </div>
      </Card>

      {/* YILLIK */}
      <Card
        title={`Yıllık Hedef — ${selectedYear}`}
        loading={loadingGoals}
        style={{ marginTop: 12 }}
        extra={
          <Button
            type="primary"
            onClick={() => saveYearlyGoal(yearlyInput)}
            disabled={yearlyInput <= 0}
          >
            Kaydet
          </Button>
        }
      >
        <Input
          type="number"
          placeholder="Yıllık ağaç hedefi"
          value={yearlyInput || ""}
          onChange={e => setYearlyInput(Number(e.target.value))}
          suffix="ağaç"
        />

        {/* ✅ GERİ EKLENDİ */}
        {yearlyGoal && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
            Kayıtlı: {yearlyGoal.targetTreeCount.toLocaleString("tr-TR")} ağaç
          </div>
        )}
      </Card>

      {/* AYLIK */}
      <Card
        title={`Aylık Hedefler — ${selectedYear}`}
        loading={loadingGoals}
        style={{ marginTop: 12 }}
      >
        <List
          dataSource={paginatedMonths}
          renderItem={({ name, month }) => {
            const goal = getMonthlyGoal(month);
            return (
              <List.Item
                actions={goal ? [
                  <Button size="small" onClick={() => {
                    setForm(goal);
                    setSelectedId(goal.id!);
                    setOpen(true);
                  }}>Düzenle</Button>,
                  <Button size="small" danger onClick={() => deleteGoal(goal)}>Sil</Button>
                ] : [
                  <Button size="small" onClick={() => {
                    setSelectedId(null);
                    setForm({ month, year: selectedYear, targetTreeCount: 0 });
                    setOpen(true);
                  }}>Ekle</Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <span>
                      {name}
                      {goal && (
                        <span style={{ marginLeft: 8, color: "#555" }}>
                          — 🌳 {goal.targetTreeCount.toLocaleString("tr-TR")} ağaç
                        </span>
                      )}
                    </span>
                  }
                  description={!goal ? "Hedef girilmedi" : undefined}
                />
              </List.Item>
            );
          }}
        />

        {/* PAGINATION */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16, gap: 8 }}>
          <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</Button>
          <span>{page} / {Math.ceil(12 / pageSize)}</span>
          <Button disabled={page === Math.ceil(12 / pageSize)} onClick={() => setPage(p => p + 1)}>→</Button>
        </div>
      </Card>

      {/* MODAL */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={saveGoal}
        title={selectedId ? "Hedefi Düzenle" : "Yeni Aylık Hedef"}
      >
        <div style={{ marginBottom: 10, color: "#555" }}>
          {MONTHS[form.month - 1]} {form.year}
        </div>
        <Input
          type="number"
          placeholder="Ağaç hedefi"
          value={form.targetTreeCount || ""}
          onChange={e => setForm({ ...form, targetTreeCount: Number(e.target.value) })}
          suffix="ağaç"
        />
      </Modal>
    </>
  );
}

