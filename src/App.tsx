import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import ToolListPage from "@/pages/ToolListPage";
import ToolFormPage from "@/pages/ToolFormPage";
import ToolDetailPage from "@/pages/ToolDetailPage";
import ConsumableListPage from "@/pages/ConsumableListPage";
import ConsumableFormPage from "@/pages/ConsumableFormPage";
import ConsumableDetailPage from "@/pages/ConsumableDetailPage";
import TaskListPage from "@/pages/TaskListPage";
import TaskFormPage from "@/pages/TaskFormPage";
import TaskDetailPage from "@/pages/TaskDetailPage";
import { useToolStore } from "@/store/toolStore";
import { useConsumableStore } from "@/store/consumableStore";
import { useMaintenanceStore } from "@/store/maintenanceStore";

export default function App() {
  const hydrateTools = useToolStore((s) => s.hydrate);
  const updateBorrowStatuses = useToolStore((s) => s.updateBorrowStatuses);
  const hydrateConsumables = useConsumableStore((s) => s.hydrate);
  const hydrateTasks = useMaintenanceStore((s) => s.hydrate);

  useEffect(() => {
    hydrateTools();
    hydrateConsumables();
    hydrateTasks();
    updateBorrowStatuses();

    const timer = setInterval(() => {
      updateBorrowStatuses();
    }, 60000);

    return () => clearInterval(timer);
  }, [hydrateTools, hydrateConsumables, hydrateTasks, updateBorrowStatuses]);

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

        <Route path="/tasks" element={<TaskListPage />} />
        <Route path="/task/new" element={<TaskFormPage />} />
        <Route path="/task/:id" element={<TaskDetailPage />} />
        <Route path="/task/:id/edit" element={<TaskFormPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
