import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { APP_ROUTES } from "./constants";
import { AuthProvider } from "./features/auth/auth-context";
import { AppShell } from "./components/layout/AppShell";
import { RequireAuth } from "./components/layout/RequireAuth";

const AuthScreen = lazy(() =>
  import("./features/auth/AuthScreen").then((module) => ({
    default: module.AuthScreen,
  })),
);
const AccountPage = lazy(() =>
  import("./features/auth/AccountPage").then((module) => ({
    default: module.AccountPage,
  })),
);
const DashboardPage = lazy(() =>
  import("./components/dashboard/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const ComposePage = lazy(() =>
  import("./features/email/ComposePage").then((module) => ({
    default: module.ComposePage,
  })),
);
const HistoryPage = lazy(() =>
  import("./features/email/HistoryPage").then((module) => ({
    default: module.HistoryPage,
  })),
);
const EmailDetailPage = lazy(() =>
  import("./features/email/EmailDetailPage").then((module) => ({
    default: module.EmailDetailPage,
  })),
);
const SmtpPage = lazy(() =>
  import("./features/smtp/SmtpPage").then((module) => ({
    default: module.SmtpPage,
  })),
);
const InboxPage = lazy(() =>
  import("./features/received/InboxPage").then((module) => ({
    default: module.InboxPage,
  })),
);
const AttachmentsPage = lazy(() =>
  import("./features/attachments/AttachmentsPage").then((module) => ({
    default: module.AttachmentsPage,
  })),
);

function RouteFallback() {
  return (
    <div className="grid min-h-40 place-items-center text-sm text-muted-foreground">
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<RouteFallback />}>
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
            <Route path={APP_ROUTES.account} element={<AccountPage />} />
            <Route path={APP_ROUTES.history} element={<HistoryPage />} />
            <Route path="/history/:id" element={<EmailDetailPage />} />
            <Route path={APP_ROUTES.inbox} element={<InboxPage />} />
            <Route path={APP_ROUTES.attachments} element={<AttachmentsPage />} />
          </Route>
          <Route path="*" element={<Navigate to={APP_ROUTES.overview} replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
