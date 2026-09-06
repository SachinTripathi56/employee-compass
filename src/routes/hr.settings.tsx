import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthProvider";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/hr/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Exit Interview Platform" },
      { name: "description", content: "Manage your profile, company details and exit interview notifications." },
      { property: "og:title", content: "Settings — Exit Interview Platform" },
      { property: "og:description", content: "Manage your profile, company details and exit interview notifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("Northwind Technologies");
  const [replyTo, setReplyTo] = useState(user?.email ?? "");
  const [signature, setSignature] = useState(
    "Thanks for your time with us — your feedback helps us improve.",
  );
  const [inviteEmails, setInviteEmails] = useState(true);
  const [reminderEmails, setReminderEmails] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  return (
    <>
      <PageHeader title="Settings" description="Your profile, company details and email preferences." />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-semibold">Your profile</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={user?.name ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={user?.role ?? ""} readOnly />
          </div>
          <p className="text-xs text-muted-foreground">
            Profile details come from your sign-in account and company records.
          </p>
        </section>

        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-semibold">Company</h2>
          <div className="space-y-2">
            <Label htmlFor="company">Company name</Label>
            <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reply">Reply-to email</Label>
            <Input id="reply" type="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signature">Invitation signature</Label>
            <Textarea id="signature" rows={3} value={signature} onChange={(e) => setSignature(e.target.value)} />
          </div>
        </section>

        <section className="panel space-y-4 p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">Notifications</h2>
          <Toggle
            label="Invitation emails"
            description="Send an invitation as soon as a campaign starts."
            checked={inviteEmails}
            onChange={setInviteEmails}
          />
          <Toggle
            label="Reminder emails"
            description="Nudge employees who have not completed their interview."
            checked={reminderEmails}
            onChange={setReminderEmails}
          />
          <Toggle
            label="Weekly summary"
            description="Get a Monday digest of completions and new insights."
            checked={weeklyDigest}
            onChange={setWeeklyDigest}
          />
        </section>
      </div>

      <div>
        <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
      </div>
    </>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
