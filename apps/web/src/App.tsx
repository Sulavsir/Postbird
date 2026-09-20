import { Navigate, Route, Routes } from "react-router-dom";
import { APP_ROUTES } from "./constants";
import { AuthProvider, AuthScreen } from "./features/auth";
import { ComposePage, EmailDetailPage, HistoryPage } from "./features/email";
import { SmtpPage } from "./features/smtp";
import { InboxPage } from "./features/received";
import { AttachmentsPage } from "./features/attachments";
import { AppShell } from "./components/layout/AppShell";
import { RequireAuth } from "./components/layout/RequireAuth";
import { DashboardPage } from "./components/dashboard/DashboardPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path={APP_ROUTES.login} element={<AuthScreen mode="login" />} />
        <Route
          path={APP_ROUTES.register}
          element={<AuthScreen mode="register" />}
        />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path={APP_ROUTES.overview} element={<DashboardPage />} />
          <Route path={APP_ROUTES.compose} element={<ComposePage />} />
          <Route path={APP_ROUTES.smtp} element={<SmtpPage />} />
          <Route path={APP_ROUTES.history} element={<HistoryPage />} />
          <Route path="/history/:id" element={<EmailDetailPage />} />
          <Route path={APP_ROUTES.inbox} element={<InboxPage />} />
          <Route path={APP_ROUTES.attachments} element={<AttachmentsPage />} />
        </Route>
        <Route path="*" element={<Navigate to={APP_ROUTES.overview} replace />} />
      </Routes>
    </AuthProvider>
  );
}
