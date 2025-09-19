import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sun } from 'lucide-react';
import { useRouter } from 'next/router';


export default function Login() {
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok && data.redirect) {
        router.push(data.redirect);
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err: any) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Sun className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">SolarFlow</span>
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Select your role to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Role</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={role}
                onChange={e => setRole(e.target.value)}
                data-testid="select-role"
              >
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
              </select>
            </div>
            {error && (
              <Alert variant="destructive" data-testid="alert-login-error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
