import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import ToolListPage from "@/pages/ToolListPage";
import ToolFormPage from "@/pages/ToolFormPage";
import ToolDetailPage from "@/pages/ToolDetailPage";
import ConsumableListPage from "@/pages/ConsumableListPage";
import ConsumableFormPage from "@/pages/ConsumableFormPage";
import ConsumableDetailPage from "@/pages/ConsumableDetailPage";
import { useToolStore } from "@/store/toolStore";
import { useConsumableStore } from "@/store/consumableStore";

export default function App() {
  const hydrateTools = useToolStore((s) => s.hydrate);
  const updateBorrowStatuses = useToolStore((s) => s.updateBorrowStatuses);
  const hydrateConsumables = useConsumableStore((s) => s.hydrate);

  useEffect(() => {
    hydrateTools();
    hydrateConsumables();
    updateBorrowStatuses();

    const timer = setInterval(() => {
      updateBorrowStatuses();
    }, 60000);

    return () => clearInterval(timer);
  }, [hydrateTools, hydrateConsumables, updateBorrowStatuses]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ToolListPage />} />
        <Route path="/tool/new" element={<ToolFormPage />} />
        <Route path="/tool/:id" element={<ToolDetailPage />} />
        <Route path="/tool/:id/edit" element={<ToolFormPage />} />

        <Route path="/consumables" element={<ConsumableListPage />} />
        <Route path="/consumable/new" element={<ConsumableFormPage />} />
        <Route path="/consumable/:id" element={<ConsumableDetailPage />} />
        <Route path="/consumable/:id/edit" element={<ConsumableFormPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
