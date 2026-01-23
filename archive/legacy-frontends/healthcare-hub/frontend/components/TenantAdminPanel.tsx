"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "../lib/api";

export default function TenantAdminPanel() {
  const [tenantForm, setTenantForm] = useState({ name: "", domain: "", contact_email: "", contact_name: "" });
  const [inviteForm, setInviteForm] = useState({ tenant_id: "", username: "", email: "", role: "user" });
  const [resetForm, setResetForm] = useState({ identifier: "", new_password: "" });
  const [busy, setBusy] = useState(false);

  const createTenant = async () => {
    try { setBusy(true);
      const res = await apiFetch('/api/v1/tenants', { method: 'POST', body: JSON.stringify({ ...tenantForm, plan: 'starter', apps: ['healthcare'] }) });
      const data = await res.json();
      alert('Tenant created: ' + (data?.tenant_id || JSON.stringify(data)));
    } catch (e:any) { alert(e.message || 'Create failed'); } finally { setBusy(false); }
  };

  const inviteUser = async () => {
    try { setBusy(true);
      const regRes = await apiFetch('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ username: inviteForm.username || inviteForm.email, email: inviteForm.email || `${inviteForm.username}@example.com`, password: 'Temp@12345' }) });
      await regRes.json();
      alert('User invited/created. Link to tenant via admin endpoint.');
    } catch (e:any) { alert(e.message || 'Invite failed'); } finally { setBusy(false); }
  };

  const resetPassword = async () => {
    try { setBusy(true);
      const res = await apiFetch('/api/v1/auth/reset-password', { method: 'POST', body: JSON.stringify({ username: resetForm.identifier, email: resetForm.identifier, new_password: resetForm.new_password }) });
      const data = await res.json();
      alert('Password reset: ' + JSON.stringify(data));
    } catch (e:any) { alert(e.message || 'Reset failed'); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Create Tenant</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input className="border rounded px-2 py-1" placeholder="Name" value={tenantForm.name} onChange={(e)=> setTenantForm({ ...tenantForm, name: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Domain" value={tenantForm.domain} onChange={(e)=> setTenantForm({ ...tenantForm, domain: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Contact Email" value={tenantForm.contact_email} onChange={(e)=> setTenantForm({ ...tenantForm, contact_email: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Contact Name" value={tenantForm.contact_name} onChange={(e)=> setTenantForm({ ...tenantForm, contact_name: e.target.value })} />
          </div>
          <Button size="sm" onClick={createTenant} disabled={busy}>Create</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Invite/Link User</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input className="border rounded px-2 py-1" placeholder="Tenant ID" value={inviteForm.tenant_id} onChange={(e)=> setInviteForm({ ...inviteForm, tenant_id: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Username" value={inviteForm.username} onChange={(e)=> setInviteForm({ ...inviteForm, username: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Email" value={inviteForm.email} onChange={(e)=> setInviteForm({ ...inviteForm, email: e.target.value })} />
            <select className="border rounded px-2 py-1" value={inviteForm.role} onChange={(e)=> setInviteForm({ ...inviteForm, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <Button size="sm" onClick={inviteUser} disabled={busy}>Invite</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Reset Password</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input className="border rounded px-2 py-1" placeholder="Username or Email" value={resetForm.identifier} onChange={(e)=> setResetForm({ ...resetForm, identifier: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="New Password" type="password" value={resetForm.new_password} onChange={(e)=> setResetForm({ ...resetForm, new_password: e.target.value })} />
            <Button size="sm" onClick={resetPassword} disabled={busy}>Reset</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


