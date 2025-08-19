import { useState } from "react";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Crown } from "lucide-react";

export default function AuthPage() {
  const { user, signInMutation, signUpMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Check for confirmation parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('confirmed') === 'true') {
      setShowConfirmation(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <Card className="w-full max-w-md shadow-xl border border-spiritual-blue/20 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Crown className="text-warm-gold h-8 w-8 mr-3" />
              <CardTitle className="text-spiritual-blue text-2xl">Email Confirmed!</CardTitle>
            </div>
            <CardDescription>Your account has been verified. You can now sign in.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-spiritual-blue text-white hover:bg-purple-800" 
              onClick={() => {
                setShowConfirmation(false);
                window.history.replaceState({}, '', '/auth');
              }}
            >
              Continue to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    signInMutation.mutate(signInData);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      return;
    }
    signUpMutation.mutate({
      email: signUpData.email,
      password: signUpData.password,
      firstName: signUpData.firstName,
      lastName: signUpData.lastName
    });
  };

  if (user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-2">
              <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
              <h1 className="text-3xl font-bold text-charcoal">KingdomOps</h1>
            </div>
            <p className="text-charcoal/70">Access your church management and spiritual gifts platform</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm border border-spiritual-blue/20">
              <TabsTrigger value="signin" className="data-[state=active]:bg-spiritual-blue data-[state=active]:text-white">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-spiritual-blue data-[state=active]:text-white">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-spiritual-blue/20">
                <CardHeader>
                  <CardTitle className="text-charcoal">Welcome Back</CardTitle>
                  <CardDescription className="text-charcoal/70">
                    Sign in to access your church dashboard and assessments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        required
                        data-testid="input-signin-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        required
                        data-testid="input-signin-password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-spiritual-blue text-white hover:bg-purple-800"
                      disabled={signInMutation.isPending}
                      data-testid="button-signin"
                    >
                      {signInMutation.isPending ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-spiritual-blue/20">
                <CardHeader>
                  <CardTitle className="text-charcoal">Create Account</CardTitle>
                  <CardDescription className="text-charcoal/70">
                    Join churches using KingdomOps for better communication and discipleship
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="signup-firstname">First Name</Label>
                        <Input
                          id="signup-firstname"
                          value={signUpData.firstName}
                          onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                          required
                          data-testid="input-signup-firstname"
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-lastname">Last Name</Label>
                        <Input
                          id="signup-lastname"
                          value={signUpData.lastName}
                          onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                          required
                          data-testid="input-signup-lastname"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                        data-testid="input-signup-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                        data-testid="input-signup-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        required
                        data-testid="input-signup-confirm-password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-spiritual-blue text-white hover:bg-purple-800"
                      disabled={signUpMutation.isPending || signUpData.password !== signUpData.confirmPassword}
                      data-testid="button-signup"
                    >
                      {signUpMutation.isPending ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-gradient-to-br from-spiritual-blue to-purple-700 p-8 flex items-center justify-center text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_rgba(255,255,255,0.1)_100%)]" />
        
        <div className="max-w-md text-center relative z-10">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Crown className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-4">The Operating System for Your Church</h2>
            <p className="text-xl text-white/90 mb-6">
              Equip your church with comprehensive tools for communication, organization, and discipleship
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="w-6 h-6 bg-warm-gold rounded-full flex-shrink-0"></div>
              <span>Spiritual gifts assessment and matching</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="w-6 h-6 bg-warm-gold rounded-full flex-shrink-0"></div>
              <span>Church communication platform</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="w-6 h-6 bg-warm-gold rounded-full flex-shrink-0"></div>
              <span>Member management and analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}