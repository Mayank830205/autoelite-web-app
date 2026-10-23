/**
 * AUTOELITE — Admin Comprehensive Business & Revenue Analytics View
 * Chart.js powered visualization with date range filters.
 */

import { renderAdminLayout, initAdminLayoutListeners } from './admin-common.js';
import { AnalyticsService } from '../services/analytics-service.js';
import { SalesService } from '../services/sales-service.js';
import { formatINR } from '../utils.js';

export class AdminAnalyticsView {
  static currentDateRange = 'all';

  static async render() {
    const metrics = await AnalyticsService.getSummaryMetrics(this.currentDateRange);

    const content = `
      <!-- TOP CONTROLS & DATE FILTER -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;flex-wrap:wrap;gap:1rem;">
        <div>
          <h2 style="font-size:1.4rem;margin-bottom:0.25rem;">Business Intelligence & Performance</h2>
          <p style="font-size:0.85rem;color:var(--text-muted);">Audited analytics tracking appointments, interest pipelines, and recorded vehicle revenue.</p>
        </div>

        <div style="display:flex;align-items:center;gap:0.75rem;">
          <label style="font-size:0.85rem;color:var(--text-secondary);">Date Filter:</label>
          <select id="analytics-date-range" class="form-control" style="width:160px;padding:0.45rem 1rem;">
            <option value="all" ${this.currentDateRange === 'all' ? 'selected' : ''}>All Time</option>
            <option value="7d" ${this.currentDateRange === '7d' ? 'selected' : ''}>Last 7 Days</option>
            <option value="30d" ${this.currentDateRange === '30d' ? 'selected' : ''}>Last 30 Days</option>
            <option value="90d" ${this.currentDateRange === '90d' ? 'selected' : ''}>Last 90 Days</option>
            <option value="month" ${this.currentDateRange === 'month' ? 'selected' : ''}>Current Month</option>
            <option value="year" ${this.currentDateRange === 'year' ? 'selected' : ''}>Current Year</option>
          </select>
        </div>
      </div>

      <!-- SUMMARY KPI METRICS -->
      <div class="metrics-grid">
        <div class="metric-card revenue-card">
          <div class="metric-card-header">
            <span class="metric-label">Actual Recorded Revenue</span>
            <div class="metric-icon-wrap" style="color:var(--accent-primary);">₹</div>
          </div>
          <div class="metric-value">${formatINR(metrics.actualRevenue)}</div>
          <div class="metric-subtitle">
            <span class="badge badge-gold" style="font-size:0.7rem;">Verified Ledger Only</span>
            Strictly derived from vehicle sales
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="metric-label">Total Reservations</span>
            <div class="metric-icon-wrap">📅</div>
          </div>
          <div class="metric-value">${metrics.totalBookings}</div>
          <div class="metric-subtitle">${metrics.confirmedBookings} confirmed appointments</div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="metric-label">Completed Drives / Visits</span>
            <div class="metric-icon-wrap">🏎️</div>
          </div>
          <div class="metric-value">${metrics.completedAppointments}</div>
          <div class="metric-subtitle">Completed appointments (Not revenue)</div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="metric-label">Sales Pipeline Estimation</span>
            <div class="metric-icon-wrap">📈</div>
          </div>
          <div class="metric-value">${formatINR(metrics.pipelineEstimatedValue, true)}</div>
          <div class="metric-subtitle">${metrics.purchaseEnquiries} active purchase enquiries</div>
        </div>
      </div>

      <!-- CHARTS MATRIX -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-card-header">
            <h3 class="chart-card-title">Appointment Trends Over Time</h3>
            <span style="font-size:0.8rem;color:var(--text-muted);">Test Drives vs Showroom Visits vs Enquiries</span>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="analytics-chart-trends"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <h3 class="chart-card-title">Booking Status Distribution</h3>
            <span style="font-size:0.8rem;color:var(--text-muted);">Approval & Cancellation Health</span>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="analytics-chart-status"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <h3 class="chart-card-title">Most Requested Vehicle Models</h3>
            <span style="font-size:0.8rem;color:var(--text-muted);">Client Demand Breakdown</span>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="analytics-chart-models"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <h3 class="chart-card-title">Verified Monthly Revenue (₹ Crores)</h3>
            <span style="font-size:0.8rem;color:var(--text-muted);">Actual Sales Realized</span>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="analytics-chart-revenue"></canvas>
          </div>
        </div>
      </div>
    `;

    return renderAdminLayout('analytics', 'Business Analytics', content);
  }

  static async afterRender() {
    initAdminLayoutListeners();

    const rangeSelect = document.getElementById('analytics-date-range');
    if (rangeSelect) {
      rangeSelect.onchange = (e) => {
        this.currentDateRange = e.target.value;
        window.appRouter.navigate('/admin/analytics', false);
      };
    }

    if (window.Chart) {
      // 1. Trends
      const trends = await AnalyticsService.getBookingTrendsChartData();
      const ctx1 = document.getElementById('analytics-chart-trends')?.getContext('2d');
      if (ctx1) {
        new window.Chart(ctx1, {
          type: 'line',
          data: trends,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#9CA3AF' } } },
            scales: {
              x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } },
              y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } }
            }
          }
        });
      }

      // 2. Status
      const status = await AnalyticsService.getStatusBreakdown();
      const ctx2 = document.getElementById('analytics-chart-status')?.getContext('2d');
      if (ctx2) {
        new window.Chart(ctx2, {
          type: 'doughnut',
          data: status,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: '#9CA3AF' } } }
          }
        });
      }

      // 3. Models
      const models = await AnalyticsService.getPopularModelsData();
      const ctx3 = document.getElementById('analytics-chart-models')?.getContext('2d');
      if (ctx3) {
        new window.Chart(ctx3, {
          type: 'bar',
          data: models,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } },
              y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } }
            }
          }
        });
      }

      // 4. Revenue
      const revenue = await AnalyticsService.getSalesRevenueChartData();
      const ctx4 = document.getElementById('analytics-chart-revenue')?.getContext('2d');
      if (ctx4) {
        new window.Chart(ctx4, {
          type: 'bar',
          data: revenue,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#9CA3AF' } } },
            scales: {
              x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } },
              y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } }
            }
          }
        });
      }
    }
  }
}
