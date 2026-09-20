import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { APP_ROUTES } from "../../constants";
import { useAuth } from "./auth-context";
import { useSmtpConfigurations } from "../smtp";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountPage() {
  const { user, logout } = useAuth();
  const smtp = useSmtpConfigurations();
  const navigate = useNavigate();

  function addAnotherAccount() {
    logout();
    navigate(APP_ROUTES.register);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <PageHeader
        eyebrow="ACCOUNT"
        title="Your account"
        description="Your Vercel deploy is one app. Each person still needs their own Postbird login. Mail, SMTP, and files are stored per user — they are not shared with whoever deployed the site."
      />
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Signed in as</CardTitle>
            <CardDescription>
              This is the Postbird user JWT, not your Vercel or Gmail login.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Name</span>
              <br />
              <strong>{user?.displayName || "—"}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Email</span>
              <br />
              <strong>{user?.email || "—"}</strong>
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" variant="outline" onClick={addAnotherAccount}>
                <UserPlus size={16} /> Create another account
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  logout();
                  navigate(APP_ROUTES.login);
                }}
              >
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sending identity (SMTP)</CardTitle>
            <CardDescription>
              Emails send from the Gmail/Yahoo/Microsoft account you save here. If two people
              reuse the same SMTP password, both sends show up in that mailbox. Add your own
              app password so mail is yours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {smtp.data?.length ? (
              smtp.data.map((item) => (
                <p key={item.id}>
                  <strong>{item.label}</strong>
                  <span className="block text-muted-foreground">
                    {item.username} · {item.host}
                  </span>
                </p>
              ))
            ) : (
              <p className="text-muted-foreground">
                No SMTP connection on this account yet. New signups start empty — they do not
                inherit the demo Gmail.
              </p>
            )}
            <Button asChild>
              <Link to={APP_ROUTES.smtp}>Add or change SMTP</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
