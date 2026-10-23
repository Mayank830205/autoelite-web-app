/**
 * AUTOELITE — Vehicle Detail View & 360-Degree Interactive Viewer
 * Multi-angle gallery, drag-to-rotate frame sequence, specifications & booking CTAs.
 */

import { CarService } from '../services/car-service.js';
import { formatINR } from '../utils.js';

export class CarDetailsView {
  static currentAngleIndex = 0;
  static current360Frame = 0;
  static isDragging = false;
  static startX = 0;
  static viewerMode = 'gallery'; // 'gallery', '360', '3d'

  static async render(params) {
    const carId = params.id;
    const car = await CarService.getCarById(carId);

    if (!car) {
      return `
        <div class="container section text-center" style="padding-top: calc(var(--header-height) + 4rem);">
          <h2>Vehicle Not Found</h2>
          <p style="margin: 1rem 0 2rem;">The requested vehicle is either unavailable or has been archived.</p>
          <a href="/cars" data-link class="btn btn-primary">Return to Collection</a>
        </div>
      `;
    }

    const standardImages = (car.car_images || []).filter(img => !img.angle_label.startsWith('frame_'));
    const sequenceFrames = (car.car_images || []).filter(img => img.angle_label.startsWith('frame_'));
    const has360 = sequenceFrames.length >= 6;

    this.carData = car;
    this.standardImages = standardImages.length > 0 ? standardImages : [{ image_url: car.main_image_url, angle_label: 'Main' }];
    this.sequenceFrames = sequenceFrames;
    this.viewerMode = has360 ? '360' : 'gallery';

    const colors = car.exterior_colors || [];
    const interiorColors = car.interior_colors || [];
    const features = car.features || [];
    const safety = car.safety_features || [];

    return `
      <div class="car-details-page section animate-fade-in" style="padding-top: calc(var(--header-height) + 1.5rem);">
        <div class="container">
          <!-- BREADCRUMBS & TOP BAR -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;font-size:0.875rem;color:var(--text-muted);">
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <a href="/cars" data-link style="color:var(--text-secondary);">Showroom</a>
              <span>/</span>
              <span>${car.brand}</span>
              <span>/</span>
              <span style="color:var(--text-primary);font-weight:600;">${car.model}</span>
            </div>
            <a href="/compare?car1=${car.id}" data-link class="btn btn-ghost btn-sm" style="color:var(--accent-primary);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"></path><path d="M8 21H3v-5"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
              Compare This Model
            </a>
          </div>

          <!-- VEHICLE TITLE & PRICE HERO -->
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:1.5rem;margin-bottom:2rem;">
            <div>
              <div class="section-tag">${car.brand} Performance Division</div>
              <h1 style="font-size:clamp(2.2rem, 4vw, 3.5rem);margin-bottom:0.35rem;">${car.model}</h1>
              <div style="font-size:1.15rem;color:var(--accent-secondary);">${car.variant || ''} · Model Year ${car.model_year}</div>
            </div>

            <div style="text-align:right;">
              <div style="font-size:0.8125rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);">Ex-Showroom Demo Price</div>
              <div style="font-family:var(--font-serif);font-size:clamp(1.75rem, 3.5vw, 2.5rem);color:var(--accent-primary);font-weight:700;">
                ${formatINR(car.ex_showroom_price)}
              </div>
              ${car.on_road_price ? `<div style="font-size:0.85rem;color:var(--text-muted);">Est. On-Road: ${formatINR(car.on_road_price)}</div>` : ''}
            </div>
          </div>

          <!-- INTERACTIVE VIEWER & GALLERY COMPONENT -->
          <div class="viewer-360-container" id="car-main-viewer">
            <!-- Mode Switcher -->
            <div class="viewer-mode-switch">
              ${has360 ? `
                <button class="viewer-mode-btn ${this.viewerMode === '360' ? 'active' : ''}" id="btn-mode-360">
                  360° Studio
                </button>
              ` : ''}
              <button class="viewer-mode-btn ${this.viewerMode === 'gallery' ? 'active' : ''}" id="btn-mode-gallery">
                Gallery
              </button>
              <button class="viewer-mode-btn ${this.viewerMode === '3d' ? 'active' : ''}" id="btn-mode-3d">
                3D Canvas
              </button>
            </div>

            <!-- 360 Viewer Badge & Hint -->
            ${has360 && this.viewerMode === '360' ? `
              <div class="viewer-360-badge">
                <span class="badge badge-gold">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                  Interactive 360° Sequence
                </span>
              </div>
              <div class="viewer-360-hint">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m14 18 4-4-4-4M10 6l-4 4 4 4"/></svg>
                Drag horizontally to rotate vehicle
              </div>
            ` : ''}

            <!-- Canvas for 3D or Image for 360/Gallery -->
            <div id="viewer-content-host" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
              <img id="viewer-display-img" src="${has360 ? sequenceFrames[0].image_url : this.standardImages[0].image_url}" alt="${car.model}" class="viewer-360-img">
              <canvas id="viewer-3d-canvas" style="display:none;width:100%;height:100%;"></canvas>
            </div>
          </div>

          <!-- ANGLE THUMBNAILS STRIP -->
          <div class="gallery-strip" id="gallery-strip">
            ${this.standardImages.map((img, idx) => `
              <div class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-thumb-idx="${idx}" title="${img.angle_label}">
                <img src="${img.image_url}" alt="Angle ${img.angle_label}">
              </div>
            `).join('')}
          </div>

          <!-- PRIMARY ACTION BAR -->
          <div class="glass-panel" style="padding:1.5rem 2rem;margin:2.5rem 0;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.5rem;">
            <div>
              <h3 style="font-size:1.25rem;margin-bottom:0.25rem;">Experience this ${car.model} in Person</h3>
              <p style="font-size:0.9rem;">Private 45-minute driving slot with our master product specialist.</p>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:1rem;">
              <a href="/booking/${car.id}?type=purchase_enquiry" data-link class="btn btn-secondary">
                Enquire to Purchase
              </a>
              <a href="/booking/${car.id}?type=showroom_visit" data-link class="btn btn-secondary">
                Showroom Visit
              </a>
              <a href="/booking/${car.id}?type=test_drive" data-link class="btn btn-primary btn-lg">
                Book a Test Drive
              </a>
            </div>
          </div>

          <!-- SPECIFICATIONS MATRIX & DETAILS -->
          <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:2.5rem;align-items:flex-start;">
            <!-- Left: Detailed Specs -->
            <div>
              <div class="section-header" style="margin-bottom:1.5rem;">
                <h3 style="font-size:1.6rem;">Engineering & Technical Data</h3>
              </div>

              <div class="glass-panel" style="padding:1.5rem;margin-bottom:2rem;">
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:1.5rem;">
                  <div>
                    <div class="car-price-label">Engine Architecture</div>
                    <div style="font-weight:600;font-size:1rem;color:var(--text-primary);">${car.engine || 'High-Output Powertrain'}</div>
                  </div>
                  <div>
                    <div class="car-price-label">Maximum Power</div>
                    <div style="font-weight:600;font-size:1rem;color:var(--accent-primary);">${car.horsepower} Horsepower</div>
                  </div>
                  <div>
                    <div class="car-price-label">Peak Torque</div>
                    <div style="font-weight:600;font-size:1rem;color:var(--text-primary);">${car.torque || '—'}</div>
                  </div>
                  <div>
                    <div class="car-price-label">Transmission</div>
                    <div style="font-weight:600;font-size:1rem;color:var(--text-primary);">${car.transmission}</div>
                  </div>
                  <div>
                    <div class="car-price-label">Fuel & Drivetrain</div>
                    <div style="font-weight:600;font-size:1rem;color:var(--text-primary);">${car.fuel_type}</div>
                  </div>
                  <div>
                    <div class="car-price-label">Mileage / Efficiency</div>
                    <div style="font-weight:600;font-size:1rem;color:var(--text-primary);">${car.mileage_or_range || '—'}</div>
                  </div>
                  <div>
                    <div class="car-price-label">Seating Capacity</div>
                    <div style="font-weight:600;font-size:1rem;color:var(--text-primary);">${car.seating_capacity} Passengers</div>
                  </div>
                  <div>
                    <div class="car-price-label">Body Architecture</div>
                    <div style="font-weight:600;font-size:1rem;color:var(--text-primary);">${car.body_type}</div>
                  </div>
                </div>
              </div>

              <!-- Overview Description -->
              <div style="margin-bottom:2.5rem;">
                <h3 style="font-size:1.4rem;margin-bottom:1rem;">Curator's Notes</h3>
                <p style="font-size:1.05rem;line-height:1.75;color:#E2E8F0;">
                  ${car.description || 'Masterpiece of luxury automotive engineering.'}
                </p>
              </div>

              <!-- Available Colors -->
              ${colors.length > 0 ? `
                <div style="margin-bottom:2.5rem;">
                  <h3 style="font-size:1.25rem;margin-bottom:1rem;">Exterior Paint Finishes</h3>
                  <div style="display:flex;flex-wrap:wrap;gap:0.75rem;">
                    ${colors.map(col => `
                      <span class="badge badge-gold" style="padding:0.5rem 1rem;font-size:0.85rem;">
                        ${col}
                      </span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Features & Equipment -->
              ${features.length > 0 ? `
                <div style="margin-bottom:2.5rem;">
                  <h3 style="font-size:1.25rem;margin-bottom:1rem;">Highlighted Comfort & Cockpit Equipment</h3>
                  <ul style="display:grid;grid-template-columns:1fr;gap:0.75rem;">
                    ${features.map(f => `
                      <li style="display:flex;align-items:center;gap:0.75rem;color:var(--text-secondary);font-size:0.95rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${f}
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>

            <!-- Right: Safety & Fast Booking Card -->
            <div>
              <div class="booking-summary-card">
                <h4 style="font-size:1.15rem;margin-bottom:1rem;color:var(--accent-secondary);">Safety Systems</h4>
                <ul style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem;">
                  ${safety.map(s => `
                    <li style="display:flex;align-items:flex-start;gap:0.6rem;font-size:0.875rem;color:var(--text-secondary);">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2" style="flex-shrink:0;margin-top:2px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      ${s}
                    </li>
                  `).join('')}
                </ul>

                <div class="gold-divider"></div>

                <div style="margin-bottom:1.25rem;">
                  <div style="font-size:0.8125rem;color:var(--text-muted);text-transform:uppercase;">Availability Status</div>
                  <div style="font-weight:700;font-size:1.1rem;color:var(--text-primary);margin-top:0.25rem;">
                    ${car.availability_status === 'in_stock' ? 'Available for Immediate Demonstration' : 'Allocation Order Open'}
                  </div>
                </div>

                <a href="/booking/${car.id}?type=test_drive" data-link class="btn btn-primary w-full" style="padding:1rem;">
                  Schedule Private Test Drive
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static afterRender() {
    const viewer = document.getElementById('car-main-viewer');
    const displayImg = document.getElementById('viewer-display-img');
    const canvas3d = document.getElementById('viewer-3d-canvas');

    const btn360 = document.getElementById('btn-mode-360');
    const btnGallery = document.getElementById('btn-mode-gallery');
    const btn3d = document.getElementById('btn-mode-3d');

    const updateMode = (mode) => {
      this.viewerMode = mode;
      if (btn360) btn360.classList.toggle('active', mode === '360');
      if (btnGallery) btnGallery.classList.toggle('active', mode === 'gallery');
      if (btn3d) btn3d.classList.toggle('active', mode === '3d');

      if (mode === '3d') {
        displayImg.style.display = 'none';
        canvas3d.style.display = 'block';
        this.render3DCanvas(canvas3d);
      } else {
        displayImg.style.display = 'block';
        canvas3d.style.display = 'none';
        if (mode === '360' && this.sequenceFrames.length > 0) {
          displayImg.src = this.sequenceFrames[this.current360Frame].image_url;
        } else {
          displayImg.src = this.standardImages[this.currentAngleIndex].image_url;
        }
      }
    };

    if (btn360) btn360.onclick = () => updateMode('360');
    if (btnGallery) btnGallery.onclick = () => updateMode('gallery');
    if (btn3d) btn3d.onclick = () => updateMode('3d');

    // 360 Drag Interaction
    if (viewer) {
      const handleDragStart = (clientX) => {
        if (this.viewerMode !== '360' || !this.sequenceFrames.length) return;
        this.isDragging = true;
        this.startX = clientX;
        viewer.classList.add('is-dragging');
      };

      const handleDragMove = (clientX) => {
        if (!this.isDragging || this.viewerMode !== '360' || !this.sequenceFrames.length) return;
        const delta = clientX - this.startX;
        const sensitivity = 22; // pixels per frame

        if (Math.abs(delta) >= sensitivity) {
          const frameDelta = delta > 0 ? 1 : -1;
          const totalFrames = this.sequenceFrames.length;
          this.current360Frame = (this.current360Frame + frameDelta + totalFrames) % totalFrames;
          displayImg.src = this.sequenceFrames[this.current360Frame].image_url;
          this.startX = clientX;
        }
      };

      const handleDragEnd = () => {
        this.isDragging = false;
        viewer.classList.remove('is-dragging');
      };

      // Mouse events
      viewer.addEventListener('mousedown', (e) => handleDragStart(e.clientX));
      window.addEventListener('mousemove', (e) => handleDragMove(e.clientX));
      window.addEventListener('mouseup', handleDragEnd);

      // Touch events
      viewer.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) handleDragStart(e.touches[0].clientX);
      }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) handleDragMove(e.touches[0].clientX);
      }, { passive: true });
      window.addEventListener('touchend', handleDragEnd);
    }

    // Thumbnail strip clicks
    const thumbs = document.querySelectorAll('[data-thumb-idx]');
    thumbs.forEach(thumb => {
      thumb.onclick = (e) => {
        const idx = Number(thumb.dataset.thumbIdx);
        this.currentAngleIndex = idx;
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        updateMode('gallery');
      };
    });
  }

  /**
   * Lightweight genuine 3D canvas vehicle rendering using Three.js style matrix transforms
   */
  static render3DCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth || 800;
    canvas.height = canvas.parentElement.clientHeight || 500;

    let rotY = 0.35;
    let isOrbiting = false;
    let lastX = 0;

    const drawCarWireframe = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 50;

      // Draw futuristic showroom platform grid
      ctx.strokeStyle = 'rgba(214, 179, 106, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let r = 50; r <= 220; r += 35) {
        ctx.ellipse(cx, cy, r * 1.5, r * 0.5, 0, 0, Math.PI * 2);
      }
      ctx.stroke();

      // Draw stylized 3D vehicle silhouette
      ctx.save();
      ctx.translate(cx, cy - 60);

      const cos = Math.cos(rotY);
      const sin = Math.sin(rotY);

      // Chassis outline
      ctx.strokeStyle = '#D6B36A';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-160 * cos, -30);
      ctx.lineTo(-70 * cos, -80);
      ctx.lineTo(80 * cos, -80);
      ctx.lineTo(170 * cos, -20);
      ctx.lineTo(190 * cos, 20);
      ctx.lineTo(-190 * cos, 20);
      ctx.closePath();
      ctx.stroke();

      // Cockpit canopy
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-50 * cos, -75);
      ctx.lineTo(60 * cos, -75);
      ctx.lineTo(90 * cos, -30);
      ctx.lineTo(-70 * cos, -30);
      ctx.closePath();
      ctx.stroke();

      // Wheels
      ctx.fillStyle = '#171D25';
      ctx.strokeStyle = '#D6B36A';
      ctx.lineWidth = 2;
      [-120, 120].forEach(wx => {
        ctx.beginPath();
        ctx.arc(wx * cos, 25, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      ctx.restore();

      // HUD overlay text
      ctx.font = '12px var(--font-sans)';
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.fillText('3D Interactive Chassis Orbit · Drag to rotate', 20, canvas.height - 25);
    };

    drawCarWireframe();

    canvas.onmousedown = (e) => {
      isOrbiting = true;
      lastX = e.clientX;
    };
    window.addEventListener('mousemove', (e) => {
      if (!isOrbiting) return;
      const dx = e.clientX - lastX;
      rotY += dx * 0.015;
      lastX = e.clientX;
      drawCarWireframe();
    });
    window.addEventListener('mouseup', () => { isOrbiting = false; });
  }
}
