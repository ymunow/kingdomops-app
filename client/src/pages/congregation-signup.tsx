import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Church, ArrowRight, AlertCircle } from "lucide-react";

// This page now redirects to the new invite code flow

export default function CongregationSignup() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/join/:orgId");

  // Redirect to new invite code flow after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/join");
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-spiritual-blue rounded-full mb-4">
            <Church className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Church Signup Updated
          </h1>
          <p className="text-gray-600">
            We've improved our signup process for better security
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center flex items-center justify-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
              New Signup Process
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                For security and better organization, all congregation members now join using their church's unique invite code.
              </p>
              <div className="text-left text-xs text-blue-700 space-y-1">
                <p>• <strong>Step 1:</strong> Get your church's invite code from your pastor or church leadership</p>
                <p>• <strong>Step 2:</strong> Use the code to join your congregation securely</p>
                <p>• <strong>Step 3:</strong> Take your spiritual gifts assessment</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              You'll be automatically redirected to the new signup process in a few seconds...
            </p>
            
            <Button 
              onClick={() => setLocation("/join")}
              className="w-full bg-spiritual-blue hover:bg-purple-800"
              data-testid="button-use-invite-code"
            >
              Use Church Invite Code
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setLocation("/")}
              className="w-full"
              data-testid="button-back-home"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}