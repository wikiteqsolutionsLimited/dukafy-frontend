import { useState, useEffect } from "react";
import { User, Mail, Lock, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { authApi, api } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { CardSection } from "@/components/shared/CardSection";
import { FormInput } from "@/components/shared/FormFields";
import { PrimaryButton } from "@/components/shared/ActionButtons";

const ProfilePage = () => {
  const { user } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: "",
      });
    }
  }, [user]);

  const handleProfileSave = async () => {
    if (!profileForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSavingProfile(true);
    try {
      await api.put("/auth/profile", {
        name: profileForm.name,
        phone: profileForm.phone,
      });
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current_password) {
      toast.error("Current password is required");
      return;
    }
    if (passwordForm.new_password.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await api.put("/auth/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      toast.success("Password changed successfully");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Profile Settings" description="Manage your account details and security" />

      {/* Profile Info */}
      <CardSection title="Personal Information" description="Update your name and contact details">
        <div className="space-y-4 max-w-lg">
          <FormInput
            label="Full Name"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            placeholder="Your full name"
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="flex h-11 items-center rounded-lg border bg-muted/50 px-3.5 text-sm text-muted-foreground">
              <Mail className="mr-2 h-4 w-4" />
              {profileForm.email}
            </div>
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <FormInput
            label="Phone Number"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            placeholder="e.g. 0712345678"
          />
          <div className="pt-2">
            <PrimaryButton icon={savingProfile ? Loader2 : Save} onClick={handleProfileSave} disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save Changes"}
            </PrimaryButton>
          </div>
        </div>
      </CardSection>

      {/* Change Password */}
      <CardSection title="Change Password" description="Update your login password">
        <div className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showCurrentPw ? "text" : "password"}
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                placeholder="Enter current password"
                className="h-11 w-full rounded-lg border bg-background pl-10 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showNewPw ? "text" : "password"}
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                placeholder="Min 6 characters"
                className="h-11 w-full rounded-lg border bg-background pl-10 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <FormInput
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirm_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
            placeholder="Repeat new password"
          />
          <div className="pt-2">
            <PrimaryButton icon={savingPassword ? Loader2 : Lock} onClick={handlePasswordChange} disabled={savingPassword}>
              {savingPassword ? "Updating..." : "Change Password"}
            </PrimaryButton>
          </div>
        </div>
      </CardSection>

      {/* Account Info */}
      <CardSection title="Account Details" description="Your account information">
        <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground">Role</p>
            <p className="mt-1 text-sm font-semibold text-foreground capitalize">{user?.role || "—"}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground">Account Status</p>
            <p className="mt-1 text-sm font-semibold text-success">Active</p>
          </div>
        </div>
      </CardSection>
    </div>
  );
};

export default ProfilePage;
