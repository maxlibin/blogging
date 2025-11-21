"use client";

import React, { useState, useEffect } from 'react';
import { WordPressSettings } from '../types';
import { validateWPConnection } from '../lib/wordpress';
import { useWordPress } from '../contexts/WordPressContext';
import { CheckCircle, AlertCircle, Loader2, Globe, Lock, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';

export const ConnectWordPress: React.FC = () => {
  const { settings, updateSettings } = useWordPress();
  const [formData, setFormData] = useState<WordPressSettings>(settings);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

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
      updateSettings({ ...formData, isConnected: true });
    } else {
      setError("Could not connect to WordPress. Please check your URL and credentials.");
      updateSettings({ ...formData, isConnected: false });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Connect Blog</h1>
        <p className="text-slate-500 text-lg">Enter your WordPress Application Password credentials to enable auto-posting.</p>
      </div>

      <Card className="border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 w-full"></div>
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>WordPress Credentials</CardTitle>
              <CardDescription>
                Provide your site details securely. We do not store your password on our servers.
              </CardDescription>
            </div>
            {settings.isConnected ? (
              <Badge variant="success" className="flex gap-1.5 px-3 py-1.5 rounded-full text-sm">
                <CheckCircle size={14} /> Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex gap-1.5 px-3 py-1.5 rounded-full text-sm">
                 Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="siteUrl" className="text-slate-700 font-semibold">Site URL</Label>
              <div className="relative">
                <Globe className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <Input
                  id="siteUrl"
                  type="url"
                  name="siteUrl"
                  placeholder="https://yourblog.com"
                  value={formData.siteUrl}
                  onChange={handleChange}
                  className="pl-12 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 font-semibold">Username</Label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="admin"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-12 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-purple-500"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appPassword">
                  <span className="text-slate-700 font-semibold">Application Password</span>
                  <a href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/" target="_blank" rel="noreferrer" className="ml-2 text-xs text-purple-600 hover:underline font-medium">What's this?</a>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <Input
                    id="appPassword"
                    type="password"
                    name="appPassword"
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={formData.appPassword}
                    onChange={handleChange}
                    className="pl-12 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-purple-500"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-xl bg-red-50 border-red-100 text-red-800">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle>Connection Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="rounded-xl bg-green-50 border-green-100 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">Connection validated successfully!</AlertDescription>
              </Alert>
            )}
            
             <div className="flex justify-end pt-4 border-t border-slate-50">
              <Button
                type="submit"
                disabled={isValidating}
                className="w-full md:w-auto rounded-full bg-slate-900 hover:bg-slate-800 px-8 h-11 font-bold"
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