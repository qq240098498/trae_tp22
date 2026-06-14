import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import ToolListPage from "@/pages/ToolListPage";
import ToolFormPage from "@/pages/ToolFormPage";
import ToolDetailPage from "@/pages/ToolDetailPage";
import { useToolStore } from "@/store/toolStore";

export default function App() {
  const hydrate = useToolStore((s) => s.hydrate);
  const updateBorrowStatuses = useToolStore((s) => s.updateBorrowStatuses);

  useEffect(() => {
    hydrate();
    updateBorrowStatuses();

    const timer = setInterval(() => {
      updateBorrowStatuses();
    }, 60000);

    return () => clearInterval(timer);
  }, [hydrate, updateBorrowStatuses]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ToolListPage />} />
        <Route path="/tool/new" element={<ToolFormPage />} />
        <Route path="/tool/:id" element={<ToolDetailPage />} />
        <Route path="/tool/:id/edit" element={<ToolFormPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
