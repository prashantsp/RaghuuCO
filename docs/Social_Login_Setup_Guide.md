# Social Login Setup Guide
## RAGHUU CO Legal Practice Management System

### Document Version: 1.0
### Date: August 22, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Google OAuth Setup](#google-oauth-setup)
4. [LinkedIn OAuth Setup](#linkedin-oauth-setup)
5. [Microsoft OAuth Setup](#microsoft-oauth-setup)
6. [Backend Implementation](#backend-implementation)
7. [Frontend Implementation](#frontend-implementation)
8. [Database Schema](#database-schema)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides step-by-step instructions for implementing social login functionality using Google, LinkedIn, and Microsoft OAuth 2.0 providers in the RaghuuCO Legal Practice Management System.

### **Supported Providers**
- ✅ Google OAuth 2.0
- ✅ LinkedIn OAuth 2.0
- ✅ Microsoft OAuth 2.0 (Azure AD)

### **Features**
- Social account linking to existing accounts
- Automatic user creation for new social users
- Profile data synchronization
- Secure token management
- Role-based access control

---

## Prerequisites

### **Required Software**
```bash
# Node.js and npm
node --version  # Should be 18.x or higher
npm --version   # Should be 8.x or higher

# PostgreSQL
psql --version  # Should be 14.x or higher

# Redis
redis-server --version  # Should be 7.x or higher
```

### **Required Packages**
```bash
# Backend dependencies
npm install passport passport-google-oauth20 passport-linkedin-oauth2 passport-microsoft
npm install express-session connect-redis
npm install @types/passport @types/passport-google-oauth20

# Frontend dependencies
npm install @auth0/auth0-react
npm install react-oauth-google
```

### **Development Environment**
- HTTPS enabled for OAuth callbacks (required by OAuth providers)
- Valid domain name for production
- SSL certificates for secure communication

---

## Google OAuth Setup

### **Step 1: Create Google Cloud Project**

1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Create New Project**
   - Click "Select a project" → "New Project"
   - Name: `RaghuuCO Legal System`
   - Project ID: `raghuuco-legal-system`
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

### **Step 2: Configure OAuth Consent Screen**

1. **Go to OAuth Consent Screen**
   ```
   APIs & Services → OAuth consent screen
   ```

2. **Configure App Information**
   ```
   App name: RaghuuCO Legal Practice Management
   User support email: support@raghuuco.com
   App logo: Upload your logo
   App domain: raghuuco.com
   Developer contact information: your-email@raghuuco.com
   ```

3. **Add Scopes**
   ```
   .../auth/userinfo.email
   .../auth/userinfo.profile
   openid
   ```

4. **Add Test Users** (for development)
   ```
   Add your email addresses for testing
   ```

### **Step 3: Create OAuth 2.0 Credentials**

1. **Go to Credentials**
   ```
   APIs & Services → Credentials
   ```

2. **Create OAuth 2.0 Client ID**
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "RaghuuCO Web Client"

3. **Configure Authorized URIs**
   ```
   Authorized JavaScript origins:
   http://localhost:3000 (development)
   https://app.raghuuco.com (production)
   
   Authorized redirect URIs:
   http://localhost:3000/auth/google/callback (development)
   https://app.raghuuco.com/auth/google/callback (production)
   ```

4. **Save Credentials**
   ```
   Client ID: your-google-client-id
   Client Secret: your-google-client-secret
   ```

### **Step 4: Environment Configuration**

```env
# .env file
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

---

## LinkedIn OAuth Setup

### **Step 1: Create LinkedIn App**

1. **Go to LinkedIn Developers**
   ```
   https://www.linkedin.com/developers/
   ```

2. **Create App**
   - Click "Create App"
   - App name: "RaghuuCO Legal System"
   - LinkedIn Page: Your company page
   - App logo: Upload your logo

### **Step 2: Configure OAuth Settings**

1. **Go to Auth Settings**
   ```
   App Dashboard → Auth → OAuth 2.0 settings
   ```

2. **Add Redirect URLs**
   ```
   http://localhost:3000/auth/linkedin/callback (development)
   https://app.raghuuco.com/auth/linkedin/callback (production)
   ```

3. **Configure Scopes**
   ```
   r_liteprofile
   r_emailaddress
   ```

### **Step 3: Get Credentials**

1. **Copy Credentials**
   ```
   Client ID: your-linkedin-client-id
   Client Secret: your-linkedin-client-secret
   ```

2. **Environment Configuration**
   ```env
   LINKEDIN_CLIENT_ID=your-linkedin-client-id
   LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
   LINKEDIN_CALLBACK_URL=http://localhost:3000/auth/linkedin/callback
   ```

---

## Microsoft OAuth Setup

### **Step 1: Create Azure App Registration**

1. **Go to Azure Portal**
   ```
   https://portal.azure.com/
   ```

2. **Create App Registration**
   - Go to "Azure Active Directory" → "App registrations"
   - Click "New registration"
   - Name: "RaghuuCO Legal System"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: Web → `http://localhost:3000/auth/microsoft/callback`

### **Step 2: Configure Authentication**

1. **Authentication Settings**
   ```
   Platform configurations → Web
   Redirect URIs:
   http://localhost:3000/auth/microsoft/callback (development)
   https://app.raghuuco.com/auth/microsoft/callback (production)
   
   Implicit grant and hybrid flows:
   ✅ Access tokens
   ✅ ID tokens
   ```

2. **API Permissions**
   ```
   Microsoft Graph → Delegated permissions:
   - User.Read
   - email
   - profile
   - openid
   ```

### **Step 3: Get Credentials**

1. **Copy Credentials**
   ```
   Application (client) ID: your-microsoft-client-id
   Directory (tenant) ID: your-tenant-id
   ```

2. **Create Client Secret**
   ```
   Certificates & secrets → New client secret
   Description: "RaghuuCO App Secret"
   Expiration: 24 months
   Copy the generated secret
   ```

3. **Environment Configuration**
   ```env
   MICROSOFT_CLIENT_ID=your-microsoft-client-id
   MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
   MICROSOFT_TENANT_ID=your-tenant-id
   MICROSOFT_CALLBACK_URL=http://localhost:3000/auth/microsoft/callback
   ```

---

## Backend Implementation

### **Step 1: Install Dependencies**

```bash
npm install passport passport-google-oauth20 passport-linkedin-oauth2 passport-microsoft
npm install express-session connect-redis
npm install @types/passport @types/passport-google-oauth20
```

### **Step 2: Database Schema**

```sql
-- Social accounts table
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'linkedin', 'microsoft'
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    profile_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- Index for performance
CREATE INDEX idx_social_accounts_provider_user ON social_accounts(provider, provider_user_id);
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
```

### **Step 3: Passport Configuration**

```typescript
// config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { DatabaseService } from '../services/DatabaseService';
import { UserService } from '../services/UserService';

export class PassportConfig {
  private db: DatabaseService;
  private userService: UserService;

  constructor(db: DatabaseService, userService: UserService) {
    this.db = db;
    this.userService = userService;
    this.configureStrategies();
  }

  private configureStrategies() {
    // Google Strategy
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['profile', 'email']
    }, this.handleGoogleCallback.bind(this)));

    // LinkedIn Strategy
    passport.use(new LinkedInStrategy({
      clientID: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL!,
      scope: ['r_emailaddress', 'r_liteprofile']
    }, this.handleLinkedInCallback.bind(this)));

    // Microsoft Strategy
    passport.use(new MicrosoftStrategy({
      clientID: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL!,
      scope: ['user.read', 'email', 'openid', 'profile']
    }, this.handleMicrosoftCallback.bind(this)));

    // Serialize user for session
    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await this.userService.getUserById(id);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });
  }

  private async handleGoogleCallback(accessToken: string, refreshToken: string, profile: any, done: any) {
    try {
      const user = await this.handleSocialLogin('google', profile, accessToken, refreshToken);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }

  private async handleLinkedInCallback(accessToken: string, refreshToken: string, profile: any, done: any) {
    try {
      const user = await this.handleSocialLogin('linkedin', profile, accessToken, refreshToken);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }

  private async handleMicrosoftCallback(accessToken: string, refreshToken: string, profile: any, done: any) {
    try {
      const user = await this.handleSocialLogin('microsoft', profile, accessToken, refreshToken);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }

  private async handleSocialLogin(provider: string, profile: any, accessToken: string, refreshToken: string) {
    // Check if social account exists
    let socialAccount = await this.findSocialAccount(provider, profile.id);
    
    if (socialAccount) {
      // Update existing social account
      await this.updateSocialAccount(socialAccount.id, accessToken, refreshToken, profile);
      return await this.userService.getUserById(socialAccount.user_id);
    }

    // Check if user exists by email
    const email = this.extractEmail(profile, provider);
    let user = await this.userService.getUserByEmail(email);

    if (user) {
      // Link social account to existing user
      await this.linkSocialAccount(user.id, provider, profile, accessToken, refreshToken);
      return user;
    }

    // Create new user
    user = await this.createUserFromSocialProfile(profile, provider);
    await this.linkSocialAccount(user.id, provider, profile, accessToken, refreshToken);
    
    return user;
  }

  private async findSocialAccount(provider: string, providerUserId: string) {
    const result = await this.db.query(
      'SELECT * FROM social_accounts WHERE provider = $1 AND provider_user_id = $2',
      [provider, providerUserId]
    );
    return result[0] || null;
  }

  private async updateSocialAccount(socialAccountId: string, accessToken: string, refreshToken: string, profile: any) {
    await this.db.query(
      `UPDATE social_accounts 
       SET access_token = $1, refresh_token = $2, profile_data = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [accessToken, refreshToken, JSON.stringify(profile), socialAccountId]
    );
  }

  private async linkSocialAccount(userId: string, provider: string, profile: any, accessToken: string, refreshToken: string) {
    await this.db.query(
      `INSERT INTO social_accounts (user_id, provider, provider_user_id, access_token, refresh_token, profile_data)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (provider, provider_user_id) 
       DO UPDATE SET user_id = $1, access_token = $4, refresh_token = $5, profile_data = $6`,
      [userId, provider, profile.id, accessToken, refreshToken, JSON.stringify(profile)]
    );
  }

  private async createUserFromSocialProfile(profile: any, provider: string) {
    const email = this.extractEmail(profile, provider);
    const firstName = this.extractFirstName(profile, provider);
    const lastName = this.extractLastName(profile, provider);

    const userData = {
      email,
      firstName,
      lastName,
      role: 'client', // Default role for social users
      emailVerified: true,
      isActive: true
    };

    return await this.userService.createUser(userData);
  }

  private extractEmail(profile: any, provider: string): string {
    switch (provider) {
      case 'google':
        return profile.emails[0]?.value;
      case 'linkedin':
        return profile.emails[0]?.value;
      case 'microsoft':
        return profile.emails[0]?.value || profile._json.email;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private extractFirstName(profile: any, provider: string): string {
    switch (provider) {
      case 'google':
        return profile.name?.givenName || profile.displayName?.split(' ')[0];
      case 'linkedin':
        return profile.name?.givenName || profile.displayName?.split(' ')[0];
      case 'microsoft':
        return profile.name?.givenName || profile.displayName?.split(' ')[0];
      default:
        return profile.displayName?.split(' ')[0] || '';
    }
  }

  private extractLastName(profile: any, provider: string): string {
    switch (provider) {
      case 'google':
        return profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ');
      case 'linkedin':
        return profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ');
      case 'microsoft':
        return profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ');
      default:
        return profile.displayName?.split(' ').slice(1).join(' ') || '';
    }
  }
}
```

### **Step 4: Authentication Routes**

```typescript
// routes/auth.ts
import express from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/AuthController';

const router = express.Router();
const authController = new AuthController();

// Social login routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.handleSocialCallback
);

router.get('/linkedin', passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile'] }));
router.get('/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  authController.handleSocialCallback
);

router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read', 'email', 'openid', 'profile'] }));
router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/login' }),
  authController.handleSocialCallback
);

// Link social account to existing user
router.post('/link/:provider', authController.linkSocialAccount);

// Unlink social account
router.delete('/unlink/:provider', authController.unlinkSocialAccount);

export default router;
```

### **Step 5: Auth Controller**

```typescript
// controllers/AuthController.ts
import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { JWTService } from '../services/JWTService';

export class AuthController {
  private db: DatabaseService;
  private jwtService: JWTService;

  constructor() {
    this.db = new DatabaseService();
    this.jwtService = new JWTService();
  }

  async handleSocialCallback(req: Request, res: Response) {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Authentication failed' }
        });
      }

      // Generate JWT tokens
      const accessToken = this.jwtService.generateAccessToken(user);
      const refreshToken = this.jwtService.generateRefreshToken(user);

      // Log successful login
      await this.logLogin(user.id, 'social_login', req.ip, req.get('User-Agent'));

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?` +
        `access_token=${accessToken}&` +
        `refresh_token=${refreshToken}&` +
        `user_id=${user.id}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Social callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=social_auth_failed`);
    }
  }

  async linkSocialAccount(req: Request, res: Response) {
    try {
      const { provider } = req.params;
      const { accessToken, refreshToken, profile } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
      }

      await this.db.query(
        `INSERT INTO social_accounts (user_id, provider, provider_user_id, access_token, refresh_token, profile_data)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (provider, provider_user_id) 
         DO UPDATE SET user_id = $1, access_token = $4, refresh_token = $5, profile_data = $6`,
        [userId, provider, profile.id, accessToken, refreshToken, JSON.stringify(profile)]
      );

      res.json({
        success: true,
        message: `${provider} account linked successfully`
      });
    } catch (error) {
      console.error('Link social account error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to link social account' }
      });
    }
  }

  async unlinkSocialAccount(req: Request, res: Response) {
    try {
      const { provider } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
      }

      await this.db.query(
        'DELETE FROM social_accounts WHERE user_id = $1 AND provider = $2',
        [userId, provider]
      );

      res.json({
        success: true,
        message: `${provider} account unlinked successfully`
      });
    } catch (error) {
      console.error('Unlink social account error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to unlink social account' }
      });
    }
  }

  private async logLogin(userId: string, method: string, ipAddress: string, userAgent: string) {
    await this.db.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'LOGIN', 'auth', ipAddress, userAgent]
    );
  }
}
```

---

## Frontend Implementation

### **Step 1: Social Login Components**

```typescript
// components/SocialLogin.tsx
import React from 'react';
import { Button, Divider, Box, Typography } from '@mui/material';
import { Google, LinkedIn, Microsoft } from '@mui/icons-material';

interface SocialLoginProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({ onSuccess, onError }) => {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  const handleLinkedInLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/linkedin`;
  };

  const handleMicrosoftLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/microsoft`;
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>
      
      <Button
        fullWidth
        variant="outlined"
        startIcon={<Google />}
        onClick={handleGoogleLogin}
        sx={{ mb: 2, color: '#DB4437', borderColor: '#DB4437' }}
      >
        Continue with Google
      </Button>
      
      <Button
        fullWidth
        variant="outlined"
        startIcon={<LinkedIn />}
        onClick={handleLinkedInLogin}
        sx={{ mb: 2, color: '#0077B5', borderColor: '#0077B5' }}
      >
        Continue with LinkedIn
      </Button>
      
      <Button
        fullWidth
        variant="outlined"
        startIcon={<Microsoft />}
        onClick={handleMicrosoftLogin}
        sx={{ mb: 2, color: '#00A4EF', borderColor: '#00A4EF' }}
      >
        Continue with Microsoft
      </Button>
    </Box>
  );
};
```

### **Step 2: Auth Callback Handler**

```typescript
// components/AuthCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const userId = searchParams.get('user_id');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(error);
        }

        if (!accessToken || !refreshToken || !userId) {
          throw new Error('Missing authentication tokens');
        }

        // Store tokens
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user_id', userId);

        // Update auth context
        await login(accessToken, refreshToken);

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=auth_failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Completing authentication...
      </Typography>
    </Box>
  );
};
```

### **Step 3: Social Account Management**

```typescript
// components/SocialAccountManager.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert
} from '@mui/material';
import { Google, LinkedIn, Microsoft, Link, Unlink } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface SocialAccount {
  id: string;
  provider: string;
  provider_user_id: string;
  created_at: string;
}

export const SocialAccountManager: React.FC = () => {
  const { user } = useAuth();
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSocialAccounts();
  }, []);

  const fetchSocialAccounts = async () => {
    try {
      const response = await fetch('/api/v1/users/social-accounts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSocialAccounts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch social accounts:', error);
    }
  };

  const linkAccount = (provider: string) => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/${provider}`;
  };

  const unlinkAccount = async (provider: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/auth/unlink/${provider}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        await fetchSocialAccounts();
        setError(null);
      } else {
        setError('Failed to unlink account');
      }
    } catch (error) {
      setError('Failed to unlink account');
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google': return <Google />;
      case 'linkedin': return <LinkedIn />;
      case 'microsoft': return <Microsoft />;
      default: return null;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google': return 'Google';
      case 'linkedin': return 'LinkedIn';
      case 'microsoft': return 'Microsoft';
      default: return provider;
    }
  };

  const isLinked = (provider: string) => {
    return socialAccounts.some(account => account.provider === provider);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Connected Accounts
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <List>
          {['google', 'linkedin', 'microsoft'].map((provider) => {
            const linked = isLinked(provider);
            const account = socialAccounts.find(acc => acc.provider === provider);

            return (
              <ListItem key={provider}>
                {getProviderIcon(provider)}
                <ListItemText
                  primary={getProviderName(provider)}
                  secondary={linked ? `Connected since ${new Date(account!.created_at).toLocaleDateString()}` : 'Not connected'}
                />
                <ListItemSecondaryAction>
                  {linked ? (
                    <IconButton
                      edge="end"
                      onClick={() => unlinkAccount(provider)}
                      disabled={loading}
                      color="error"
                    >
                      <Unlink />
                    </IconButton>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<Link />}
                      onClick={() => linkAccount(provider)}
                      size="small"
                    >
                      Connect
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};
```

---

## Testing

### **Step 1: Environment Setup**

```bash
# Create test environment
cp .env.example .env.test

# Update test environment variables
GOOGLE_CLIENT_ID=test-google-client-id
GOOGLE_CLIENT_SECRET=test-google-client-secret
LINKEDIN_CLIENT_ID=test-linkedin-client-id
LINKEDIN_CLIENT_SECRET=test-linkedin-client-secret
MICROSOFT_CLIENT_ID=test-microsoft-client-id
MICROSOFT_CLIENT_SECRET=test-microsoft-client-secret
```

### **Step 2: Unit Tests**

```typescript
// tests/auth.test.ts
import request from 'supertest';
import { app } from '../src/app';
import { DatabaseService } from '../src/services/DatabaseService';

describe('Social Authentication', () => {
  let db: DatabaseService;

  beforeAll(async () => {
    db = new DatabaseService();
  });

  beforeEach(async () => {
    // Clean test database
    await db.query('DELETE FROM social_accounts');
    await db.query('DELETE FROM users');
  });

  describe('GET /auth/google', () => {
    it('should redirect to Google OAuth', async () => {
      const response = await request(app)
        .get('/auth/google')
        .expect(302);

      expect(response.header.location).toContain('accounts.google.com');
    });
  });

  describe('GET /auth/linkedin', () => {
    it('should redirect to LinkedIn OAuth', async () => {
      const response = await request(app)
        .get('/auth/linkedin')
        .expect(302);

      expect(response.header.location).toContain('linkedin.com');
    });
  });

  describe('GET /auth/microsoft', () => {
    it('should redirect to Microsoft OAuth', async () => {
      const response = await request(app)
        .get('/auth/microsoft')
        .expect(302);

      expect(response.header.location).toContain('login.microsoftonline.com');
    });
  });
});
```

### **Step 3: Integration Tests**

```typescript
// tests/social-login.integration.test.ts
import request from 'supertest';
import { app } from '../src/app';

describe('Social Login Integration', () => {
  it('should handle Google OAuth callback', async () => {
    // Mock Google OAuth response
    const mockProfile = {
      id: 'google-user-id',
      displayName: 'Test User',
      emails: [{ value: 'test@example.com' }],
      name: { givenName: 'Test', familyName: 'User' }
    };

    // Test callback handling
    const response = await request(app)
      .get('/auth/google/callback')
      .query({ code: 'mock-auth-code' })
      .expect(302);

    expect(response.header.location).toContain('access_token');
  });
});
```

---

## Troubleshooting

### **Common Issues**

#### **1. OAuth Callback Errors**
```
Error: Invalid redirect URI
Solution: Ensure redirect URIs match exactly in OAuth provider settings
```

#### **2. CORS Issues**
```typescript
// Add CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

#### **3. Session Issues**
```typescript
// Configure session store
app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

#### **4. Environment Variables**
```bash
# Verify all environment variables are set
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
echo $LINKEDIN_CLIENT_ID
echo $LINKEDIN_CLIENT_SECRET
echo $MICROSOFT_CLIENT_ID
echo $MICROSOFT_CLIENT_SECRET
```

### **Debug Mode**

```typescript
// Enable Passport debug mode
passport.authenticate('google', { 
  scope: ['profile', 'email'],
  debug: true 
});
```

### **Logging**

```typescript
// Add detailed logging
console.log('OAuth Profile:', JSON.stringify(profile, null, 2));
console.log('Access Token:', accessToken);
console.log('Refresh Token:', refreshToken);
```

---

## Production Deployment

### **Step 1: Update OAuth Settings**
- Update redirect URIs to production domain
- Remove development URLs from OAuth providers
- Update environment variables for production

### **Step 2: SSL Configuration**
```nginx
# Nginx configuration for HTTPS
server {
    listen 443 ssl;
    server_name app.raghuuco.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **Step 3: Security Headers**
```typescript
// Add security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "accounts.google.com", "platform.linkedin.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "accounts.google.com", "api.linkedin.com", "login.microsoftonline.com"]
    }
  }
}));
```

---

This comprehensive guide provides all the necessary steps to implement social login functionality with Google, LinkedIn, and Microsoft OAuth providers in the RaghuuCO Legal Practice Management System.