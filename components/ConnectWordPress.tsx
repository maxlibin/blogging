import React, { useState } from 'react';
import { WordPressSettings } from '../types';
import { validateWPConnection } from '../services/wordpress';
import { CheckCircle, AlertCircle, Loader2, Globe, Lock, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';

interface Props {
  settings: WordPressSettings;
  onSave: (settings: WordPressSettings) => void;
}

export const ConnectWordPress: React.FC<Props> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<WordPressSettings>(settings);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setError(null);

    const isValid = await validateWPConnection(formData);
    setIsValidating(false);

    if (isValid) {
      setSuccess(true);
      onSave({ ...formData, isConnected: true });
    } else {
      setError("Could not connect to WordPress. Please check your URL and credentials.");
      onSave({ ...formData, isConnected: false });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Connect Blog</h1>
        <p className="text-slate-500 mt-2">Enter your WordPress Application Password credentials to enable auto-posting.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>WordPress Credentials</CardTitle>
              <CardDescription>
                Provide your site details securely.
              </CardDescription>
            </div>
            {settings.isConnected && (
              <Badge variant="success" className="flex gap-1">
                <CheckCircle size={12} /> Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <Input
                  id="siteUrl"
                  type="url"
                  name="siteUrl"
                  placeholder="https://yourblog.com"
                  value={formData.siteUrl}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="admin"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appPassword">
                  Application Password
                  <a href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/" target="_blank" rel="noreferrer" className="ml-2 text-xs text-indigo-600 hover:underline">What's this?</a>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <Input
                    id="appPassword"
                    type="password"
                    name="appPassword"
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={formData.appPassword}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">Connection validated successfully!</AlertDescription>
              </Alert>
            )}
            
             <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isValidating}
                className="w-full md:w-auto"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
                  </>
                ) : (
                  'Save & Connect'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};