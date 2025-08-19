import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SubdomainSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

interface SubdomainCheckResponse {
  available: boolean;
  reason?: string;
}

export function SubdomainSelector({ value, onChange, error, disabled }: SubdomainSelectorProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [checkTrigger, setCheckTrigger] = useState(0);

  // Debounce subdomain input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      if (value && value.length >= 3) {
        setCheckTrigger(prev => prev + 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Check subdomain availability
  const { data: availability, isLoading: isChecking } = useQuery<SubdomainCheckResponse>({
    queryKey: ['/api/subdomain/check', debouncedValue],
    enabled: debouncedValue.length >= 3 && checkTrigger > 0,
    retry: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    onChange(newValue);
  };

  const getStatusIcon = () => {
    if (!debouncedValue || debouncedValue.length < 3) return null;
    if (isChecking) return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    if (availability?.available) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusMessage = () => {
    if (!debouncedValue || debouncedValue.length < 3) {
      return "Enter at least 3 characters";
    }
    if (isChecking) return "Checking availability...";
    if (availability?.available) return "Available!";
    return availability?.reason || "Not available";
  };

  const getStatusColor = () => {
    if (!debouncedValue || debouncedValue.length < 3 || isChecking) return "text-gray-500";
    if (availability?.available) return "text-green-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="subdomain">Church Subdomain</Label>
        <div className="mt-1 relative">
          <div className="flex">
            <Input
              id="subdomain"
              type="text"
              value={value}
              onChange={handleInputChange}
              disabled={disabled}
              placeholder="yourchurch"
              className="rounded-r-none border-r-0 font-medium text-lg tracking-wide font-sans border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue"
              data-testid="input-subdomain"
            />
            <div className="flex items-center px-3 bg-gray-50 border border-l-0 rounded-r-md text-lg font-medium text-gray-600 tracking-wide">
              .kingdomops.app
            </div>
          </div>
          <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
            {getStatusIcon()}
          </div>
        </div>
        <div className={`mt-1 text-sm ${getStatusColor()}`}>
          {getStatusMessage()}
        </div>
        {error && (
          <div className="mt-1 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Your church will be accessible at:</p>
              <p className="font-sans font-semibold text-lg bg-white px-3 py-2 rounded text-blue-900 tracking-wide">
                {value || 'yourchurch'}.kingdomops.app
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Use 3-30 characters: letters, numbers, and hyphens</p>
        <p>• Cannot start or end with a hyphen</p>
        <p>• Choose carefully - this will be your church's permanent web address</p>
      </div>
    </div>
  );
}

interface SubdomainPreviewProps {
  subdomain: string;
  organizationName: string;
}

export function SubdomainPreview({ subdomain, organizationName }: SubdomainPreviewProps) {
  if (!subdomain) return null;

  return (
    <Alert className="bg-green-50 border-green-200">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <span className="font-medium">{organizationName}</span> will be accessible at{" "}
        <span className="font-mono font-medium">
          {subdomain}.kingdomops.app
        </span>
      </AlertDescription>
    </Alert>
  );
}