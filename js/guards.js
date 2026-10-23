/**
 * AUTOELITE — Route Guards & Authorization Middleware
 * Client-side route guards improve navigation flow (Server RLS is the primary security enforcer).
 */

import { AuthService } from './auth.js';

export class RouteGuards {
  /**
   * Evaluates if navigation to target route is permitted
   */
  static evaluate(routeConfig, targetPath) {
    const isAuth = AuthService.isAuthenticated();
    const isAdmin = AuthService.isAdmin();

    // 1. Admin Route Guard
    if (routeConfig.requireAdmin) {
      if (!isAuth) {
        return {
          allowed: false,
          redirect: `/login?redirect=${encodeURIComponent(targetPath)}`,
          reason: 'Please sign in to access the administration portal.'
        };
      }
      if (!isAdmin) {
        return {
          allowed: false,
          redirect: '/dashboard',
          reason: 'Access Restricted: You do not possess administrator privileges.'
        };
      }
    }

    // 2. Customer Auth Route Guard
    if (routeConfig.requireAuth) {
      if (!isAuth) {
        const isBooking = targetPath.startsWith('/booking');
        return {
          allowed: false,
          redirect: `/login?redirect=${encodeURIComponent(targetPath)}`,
          reason: isBooking 
            ? 'Please sign in or create an account to book your test drive.' 
            : 'Please sign in to access your appointments and portfolio.'
        };
      }
    }

    // 3. Guest-Only Route Guard (e.g. login/register)
    if (routeConfig.guestOnly && isAuth) {
      return {
        allowed: false,
        redirect: isAdmin ? '/admin' : '/dashboard',
        reason: 'You are already signed in.'
      };
    }

    return { allowed: true };
  }
}
