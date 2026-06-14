import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ToolListPage from "@/pages/ToolListPage";
import ToolFormPage from "@/pages/ToolFormPage";
import ToolDetailPage from "@/pages/ToolDetailPage";

export default function App() {
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
