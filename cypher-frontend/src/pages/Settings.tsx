import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  ChevronUp,
  Github,
  Link as LinkIcon,
  LogOut,
  Shield,
  User,
} from 'lucide-react'; // Added Bell import
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [expandedSections, setExpandedSections] = useState({
    account: true,
    notifications: false,
    security: false,
    webhooks: false,
    dangerous: false,
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    buildSuccessEmail: true,
    buildFailureEmail: true,
    enforceMfa: false,
    sendWebhooks: true,
    webhookUrl: '',
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    toast({
      title: 'Setting updated',
      description: 'Your preferences have been saved.',
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: 'Settings saved',
      description: 'Your settings have been successfully saved.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <Card>
        <CardHeader
          className={cn(
            'flex flex-row items-center justify-between cursor-pointer',
            !expandedSections.account && 'pb-3',
          )}
          onClick={() => toggleSection('account')}
        >
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </div>
          </div>
          {expandedSections.account ? <ChevronUp /> : <ChevronDown />}
        </CardHeader>

        {expandedSections.account && (
          <>
            <CardContent className="space-y-4">
              {user && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden border">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.login}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground text-xl font-bold">
                          {user.login.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{user.name || user.login}</h3>
                      <div className="text-sm text-muted-foreground">
                        <div>Username: {user.login}</div>
                        {user.email && <div>Email: {user.email}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Connected Accounts</h4>
                    <div className="flex items-center justify-between py-2 px-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#24292e] text-white p-1 rounded-md">
                          <Github className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">GitHub</div>
                          <div className="text-sm text-muted-foreground">
                            Connected as {user.login}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={logout}
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Disconnect
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </CardFooter>
          </>
        )}
      </Card>

      <Card>
        <CardHeader
          className={cn(
            'flex flex-row items-center justify-between cursor-pointer',
            !expandedSections.notifications && 'pb-3',
          )}
          onClick={() => toggleSection('notifications')}
        >
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </div>
          </div>
          {expandedSections.notifications ? <ChevronUp /> : <ChevronDown />}
        </CardHeader>

        {expandedSections.notifications && (
          <>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive email notifications</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between pl-6">
                <div>
                  <h4 className="font-medium">Build Success</h4>
                  <p className="text-sm text-muted-foreground">Notify on successful builds</p>
                </div>
                <Switch
                  checked={settings.buildSuccessEmail}
                  disabled={!settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('buildSuccessEmail', checked)}
                />
              </div>

              <div className="flex items-center justify-between pl-6">
                <div>
                  <h4 className="font-medium">Build Failure</h4>
                  <p className="text-sm text-muted-foreground">Notify on failed builds</p>
                </div>
                <Switch
                  checked={settings.buildFailureEmail}
                  disabled={!settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('buildFailureEmail', checked)}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </>
        )}
      </Card>

      <Card>
        <CardHeader
          className={cn(
            'flex flex-row items-center justify-between cursor-pointer',
            !expandedSections.security && 'pb-3',
          )}
          onClick={() => toggleSection('security')}
        >
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage security settings</CardDescription>
            </div>
          </div>
          {expandedSections.security ? <ChevronUp /> : <ChevronDown />}
        </CardHeader>

        {expandedSections.security && (
          <>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enforce MFA</h4>
                  <p className="text-sm text-muted-foreground">
                    Require multi-factor authentication
                  </p>
                </div>
                <Switch
                  checked={settings.enforceMfa}
                  onCheckedChange={(checked) => handleSettingChange('enforceMfa', checked)}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </>
        )}
      </Card>

      <Card>
        <CardHeader
          className={cn(
            'flex flex-row items-center justify-between cursor-pointer',
            !expandedSections.webhooks && 'pb-3',
          )}
          onClick={() => toggleSection('webhooks')}
        >
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Configure webhook notifications</CardDescription>
            </div>
          </div>
          {expandedSections.webhooks ? <ChevronUp /> : <ChevronDown />}
        </CardHeader>

        {expandedSections.webhooks && (
          <>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Send Webhooks</h4>
                  <p className="text-sm text-muted-foreground">
                    Send webhook notifications for build events
                  </p>
                </div>
                <Switch
                  checked={settings.sendWebhooks}
                  onCheckedChange={(checked) => handleSettingChange('sendWebhooks', checked)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="webhookUrl">
                  Webhook URL
                </label>
                <input
                  id="webhookUrl"
                  className="w-full px-3 py-2 border rounded-md"
                  type="url"
                  placeholder="https://example.com/webhook"
                  value={settings.webhookUrl}
                  onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
                  disabled={!settings.sendWebhooks}
                />
                <p className="text-xs text-muted-foreground">
                  We'll send POST requests with build information to this URL.
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </>
        )}
      </Card>

      <Card className="border-destructive">
        <CardHeader
          className={cn(
            'flex flex-row items-center justify-between cursor-pointer',
            !expandedSections.dangerous && 'pb-3',
          )}
          onClick={() => toggleSection('dangerous')}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </div>
          </div>
          {expandedSections.dangerous ? <ChevronUp /> : <ChevronDown />}
        </CardHeader>

        {expandedSections.dangerous && (
          <>
            <CardContent className="space-y-4">
              <div className="border border-destructive/20 rounded-md p-4">
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Permanently delete your account and all associated data. This action cannot be
                  undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => {
                    toast({
                      title: 'Action not available',
                      description: 'This feature is not available in the demo.',
                      variant: 'destructive',
                    });
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
