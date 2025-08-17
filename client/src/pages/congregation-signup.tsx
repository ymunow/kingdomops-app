import { useEffect } from "react";
import { useLocation } from "wouter";

export default function CongregationSignup() {
  const [, setLocation] = useLocation();

  // Immediately redirect to the join page without showing splash screen
  useEffect(() => {
    setLocation("/join");
  }, [setLocation]);

  // Return null since we're redirecting immediately
  return null;
}