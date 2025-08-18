import { Router } from "express";
import { storage } from "../storage";
import { isValidSubdomain } from "../subdomain";
import { insertOrganizationSchema } from "@shared/schema";

const router = Router();

// Check subdomain availability
router.get('/api/subdomain/check/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;
    
    // Validate format
    if (!isValidSubdomain(subdomain)) {
      return res.json({ 
        available: false, 
        reason: 'Invalid format. Use 3-30 characters, letters, numbers, and hyphens only.' 
      });
    }
    
    // Check if subdomain exists
    const existing = await storage.getOrganizationBySubdomain(subdomain);
    
    res.json({ 
      available: !existing,
      reason: existing ? 'Subdomain already taken' : undefined
    });
  } catch (error) {
    console.error('Subdomain check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get organization by subdomain (public endpoint for landing pages)
router.get('/api/subdomain/:subdomain/info', async (req, res) => {
  try {
    const { subdomain } = req.params;
    const organization = await storage.getOrganizationBySubdomain(subdomain);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Return public information only
    res.json({
      id: organization.id,
      name: organization.name,
      subdomain: organization.subdomain,
      description: organization.description || null,
      website: organization.website || null,
      contactEmail: organization.contactEmail || null
    });
  } catch (error) {
    console.error('Subdomain info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;