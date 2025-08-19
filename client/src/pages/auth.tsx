import { useState } from "react";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Crown, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const { user, signInMutation, signUpMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 flex relative">
      {/* Back to Home Link */}
      <div className="absolute top-4 right-4 z-50">
        <a 
          href="/" 
          className="text-sm text-spiritual-blue hover:text-purple-800 underline"
        >
          Back to Home
        </a>
      </div>
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ flexBasis: '44%' }}>
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-2">
              <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
              <h1 className="text-3xl font-bold text-charcoal">KingdomOps</h1>
            </div>
            <p className="text-charcoal/70">Access your church management and spiritual gifts platform</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm border border-spiritual-blue/20 h-12">
              <TabsTrigger value="signin" className="data-[state=active]:bg-spiritual-blue data-[state=active]:text-white data-[state=active]:font-bold min-h-[44px]">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-spiritual-blue data-[state=active]:text-white data-[state=active]:font-bold min-h-[44px]">Sign up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border border-spiritual-blue/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-charcoal">Welcome back</CardTitle>
                  <CardDescription className="text-charcoal/70">
                    Sign in to access your church dashboard and assessments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="signin-email" className="text-gray-900 font-medium">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        autoComplete="email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        aria-invalid={errors.email ? 'true' : 'false'}
                        required
                        data-testid="input-signin-email"
                        className="mt-1"
                      />
                      {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="signin-password" className="text-gray-900 font-medium">Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={signInData.password}
                          onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                          aria-invalid={errors.password ? 'true' : 'false'}
                          required
                          data-testid="input-signin-password"
                          className="pr-12"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                      <div className="text-right mt-2">
                        <button
                          type="button"
                          className="text-sm text-spiritual-blue hover:text-purple-800"
                          onClick={() => {/* TODO: Forgot password flow */}}
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                      />
                      <Label htmlFor="remember-me" className="text-sm text-gray-700">
                        Remember me
                      </Label>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-spiritual-blue text-white hover:bg-purple-800 min-h-[48px] font-medium"
                      disabled={signInMutation.isPending}
                      data-testid="button-signin"
                    >
                      {signInMutation.isPending ? 'Signing in...' : 'Sign in'}
                    </Button>
                    <p className="text-xs text-center text-gray-500 mt-3">
                      Secure sign in • By continuing, you agree to our Terms and Privacy Policy.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border border-spiritual-blue/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-charcoal">Create account</CardTitle>
                  <CardDescription className="text-charcoal/70">
                    Join churches using KingdomOps for better communication and discipleship
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="signup-firstname" className="text-gray-900 font-medium">First Name</Label>
                        <Input
                          id="signup-firstname"
                          autoComplete="given-name"
                          value={signUpData.firstName}
                          onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                          required
                          data-testid="input-signup-firstname"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-lastname" className="text-gray-900 font-medium">Last Name</Label>
                        <Input
                          id="signup-lastname"
                          autoComplete="family-name"
                          value={signUpData.lastName}
                          onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                          required
                          data-testid="input-signup-lastname"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="signup-email" className="text-gray-900 font-medium">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                        data-testid="input-signup-email"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password" className="text-gray-900 font-medium">Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="signup-password"
                          type={showSignUpPassword ? "text" : "password"}
                          autoComplete="new-password"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                          required
                          data-testid="input-signup-password"
                          className="pr-12"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        >
                          {showSignUpPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="signup-confirm" className="text-gray-900 font-medium">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        autoComplete="new-password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        required
                        data-testid="input-signup-confirm-password"
                        className="mt-1"
                      />
                      {signUpData.password !== signUpData.confirmPassword && signUpData.confirmPassword && (
                        <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-spiritual-blue text-white hover:bg-purple-800 min-h-[48px] font-medium"
                      disabled={signUpMutation.isPending || signUpData.password !== signUpData.confirmPassword}
                      data-testid="button-signup"
                    >
                      {signUpMutation.isPending ? 'Creating account...' : 'Create account'}
                    </Button>
                    <p className="text-xs text-center text-gray-500 mt-3">
                      Secure sign up • By continuing, you agree to our Terms and Privacy Policy.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-gradient-to-br from-spiritual-blue to-purple-700 p-8 pt-16 flex items-center justify-center text-white relative overflow-hidden" style={{ flexBasis: '56%' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_rgba(255,255,255,0.1)_100%)]" />
        
        <div className="max-w-md text-center relative z-10">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Crown className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Discover Your Gifts & Purpose</h2>
            <p className="text-xl text-white/90 mb-6">
              Take the spiritual gifts assessment and equip your members to serve where they thrive.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="w-6 h-6 bg-warm-gold rounded-full flex-shrink-0"></div>
              <span>Spiritual gifts assessment & ministry matching</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="w-6 h-6 bg-warm-gold rounded-full flex-shrink-0"></div>
              <span>Member management (beta)</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="w-6 h-6 bg-warm-gold rounded-full flex-shrink-0"></div>
              <span>Administrative dashboard (basic analytics)</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="w-6 h-6 bg-warm-gold rounded-full flex-shrink-0"></div>
              <span>Professional church subdomain (yourchurch.kingdomops.org)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}