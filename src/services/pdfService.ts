import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import {
  getAllIncidents,
  getIncidentSteps,
  getIncidentPhotos,
  getProfile,
  normalizePhotoUri,
} from './incidentService';

function parseData(data: string | null): Record<string, unknown> {
  try { return data ? JSON.parse(data) : {}; }
  catch { return {}; }
}

async function toBase64(uri: string): Promise<string | null> {
  // Approach 1: expo-file-system (works for file:// in app sandbox)
  try {
    const b64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    if (b64?.length > 0) return `data:image/jpeg;base64,${b64}`;
  } catch {}

  // Approach 2: fetch → blob → FileReader (works for ph:// and other URI types)
  // Timeout prevents indefinite hang on dead file:// URIs on iOS
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(uri, { signal: controller.signal });
    clearTimeout(timer);
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {}

  return null;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

function esc(s?: string | null): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeImageDataUrl(b64: string | null): string | null {
  if (!b64 || !b64.startsWith('data:image/')) return null;
  return b64;
}

function row(label: string, value?: string | null, highlight = false): string {
  if (!value?.trim()) return '';
  return `<tr${highlight ? ' class="row-highlight"' : ''}>
    <td class="cell-label">${esc(label)}</td>
    <td class="cell-value">${esc(value)}</td>
  </tr>`;
}

function sectionHtml(icon: string, title: string, content: string, color = '#1565C0'): string {
  if (!content.trim()) return '';
  return `
  <div class="section">
    <div class="section-header" style="border-left-color:${color}">
      <span class="section-icon">${icon}</span>
      <span class="section-title">${title}</span>
    </div>
    <div class="section-body">${content}</div>
  </div>`;
}

function infoTable(rows: string): string {
  const r = rows.trim();
  if (!r) return '';
  return `<table class="info-table">${r}</table>`;
}

export async function generateIncidentPDF(incidentId: string): Promise<void> {
  const [allIncidents, steps, photos, profile] = await Promise.all([
    getAllIncidents(),
    getIncidentSteps(incidentId),
    getIncidentPhotos(incidentId),
    getProfile(),
  ]);

  const incident = allIncidents.find(i => i.id === incidentId);
  if (!incident) throw new Error('Incident not found');

  const stepMap = Object.fromEntries(steps.map(s => [s.stepKey, parseData(s.data)]));

  const TYPE_LABELS: Record<string, string> = {
    crash: 'Vehicle Crash',
    hit_and_run: 'Hit &amp; Run (Parked Vehicle)',
    vandalism: 'Vandalism',
    weather_damage: 'Weather Damage',
  };
  const TYPE_REPORT_TITLES: Record<string, string> = {
    crash: 'Vehicle Crash Report',
    hit_and_run: 'Hit &amp; Run / Parked Vehicle Incident Report',
    vandalism: 'Vandalism Incident Report',
    weather_damage: 'Weather Damage Report',
  };
  const incidentTypeLabel = TYPE_LABELS[incident.type] ?? 'Incident';
  const incidentReportTitle = TYPE_REPORT_TITLES[incident.type] ?? 'Incident Report';
  const isCrash = incident.type === 'crash';
  const od = stepMap['other_driver_info'] as Record<string, string> | undefined;
  const wi = stepMap['witness_info'] as { witnesses?: Array<{ name: string; phone: string }> } | undefined;
  const nd = stepMap['notes'] as { notes?: string } | undefined;
  const pd = stepMap['police_report'] as {
    policeCalled?: boolean; reportNumber?: string;
    officerName?: string; officerBadge?: string;
  } | undefined;

  // Photos → base64 (parallel)
  const photoB64 = await Promise.all(
    photos.map(async p => ({ b64: await toBase64(normalizePhotoUri(p.uri)), label: p.label, takenAt: p.takenAt }))
  );
  const validPhotos = photoB64
    .map(p => ({ ...p, b64: safeImageDataUrl(p.b64) }))
    .filter((p): p is typeof p & { b64: string } => p.b64 !== null);

  // Report ID: last 8 chars of incidentId, uppercase
  const reportId = incidentId.slice(-8).toUpperCase();
  const generatedAt = new Date();
  const incidentDate = incident.createdAt;

  // ── Sections ─────────────────────────────────────────────

  // Summary card fields
  const locationDisplay = incident.locationLabel
    ?? (incident.locationLat ? `${incident.locationLat.toFixed(5)}, ${incident.locationLng?.toFixed(5)}` : 'Not recorded');

  const summaryCard = `
  <div class="summary-card">
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-label">Incident Type</div>
        <div class="summary-value">${incidentTypeLabel}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Date &amp; Time</div>
        <div class="summary-value">${formatDate(incidentDate)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Location</div>
        <div class="summary-value">${esc(locationDisplay)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Report Status</div>
        <div class="summary-value">
          <span class="status-pill ${incident.status === 'complete' ? 'pill-complete' : 'pill-progress'}">
            ${incident.status === 'complete' ? '&#10003; Complete' : '&#9679; In Progress'}
          </span>
        </div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Evidence Photos</div>
        <div class="summary-value">${validPhotos.length} photo${validPhotos.length !== 1 ? 's' : ''} on file</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Police Contacted</div>
        <div class="summary-value">${pd?.policeCalled ? 'Yes' : (pd ? 'No' : 'Not recorded')}</div>
      </div>
    </div>
  </div>`;

  // Claimant info
  const vehicleStr = [profile?.vehicleMake, profile?.vehicleModel, profile?.vehicleYear].filter(Boolean).join(' ');
  const claimantSection = profile ? sectionHtml('👤', 'Claimant / Policy Holder', infoTable([
    row('Full Name', profile.fullName, true),
    row('Email Address', profile.email),
    row('Insurance Company', profile.insuranceCompany, true),
    row('Policy Number', profile.policyNumber),
    row('Vehicle', vehicleStr),
    row('License Plate', profile.licensePlate),
  ].join(''))) : '';

  // Location
  const locationSection = (incident.locationLabel || incident.locationLat) ? sectionHtml('📍', 'Incident Location', infoTable([
    row('Street Address', incident.locationLabel),
    row('GPS Coordinates', incident.locationLat
      ? `${incident.locationLat.toFixed(6)}° N, ${Math.abs(incident.locationLng ?? 0).toFixed(6)}° W`
      : null),
  ].join(''))) : '';

  // Other driver
  const hasOtherDriver = od && Object.values(od).some(v => v);
  const driverSection = isCrash ? sectionHtml('🚗', 'Third-Party Driver Information', hasOtherDriver ? infoTable([
    row('Full Name', od?.name, true),
    row('Phone Number', od?.phone),
    row("Driver's License #", od?.license),
    row('Insurance Company', od?.insurance, true),
    row('Policy Number', od?.policy),
    row('License Plate', od?.plate),
    row('Vehicle Make &amp; Model', od?.make),
  ].join('')) : '<p class="not-recorded">No third-party driver information recorded.</p>', '#D32F2F') : '';

  // Police report
  const policeSection = sectionHtml('🚔', 'Law Enforcement', pd
    ? (pd.policeCalled ? infoTable([
        row('Police Contacted', 'Yes — Officers responded to scene', true),
        row('Police Report #', pd.reportNumber ?? 'Pending — not yet issued'),
        row('Responding Officer', pd.officerName),
        row('Badge / Unit #', pd.officerBadge),
      ].join(''))
      : '<p class="not-recorded">Reporting party indicated no police involvement at the scene.</p>')
    : '<p class="not-recorded">Police report information not yet recorded.</p>',
  '#1565C0');

  // Witnesses
  const witnessSection = wi?.witnesses?.length
    ? sectionHtml('👥', 'Witnesses', wi.witnesses.map((w, i) => `
      <div class="witness-card">
        <div class="witness-num">Witness ${i + 1}</div>
        ${infoTable([
          row('Name', w.name),
          row('Phone', w.phone),
        ].join(''))}
      </div>`).join(''))
    : '';

  // Notes
  const notesSection = nd?.notes
    ? sectionHtml('📝', 'Incident Description / Additional Notes',
        `<div class="notes-box">${esc(nd.notes).replace(/\n/g, '<br>')}</div>`)
    : '';

  // Photos
  const photosSection = validPhotos.length > 0
    ? sectionHtml('📷', `Photo Evidence (${validPhotos.length} image${validPhotos.length !== 1 ? 's' : ''})`,
        `<div class="photo-grid">${validPhotos.map((p, i) => `
          <div class="photo-card">
            <div class="photo-index">Photo ${i + 1}${p.label ? ` — ${esc(p.label)}` : ''}</div>
            <img src="${p.b64}" alt="Evidence photo ${i + 1}" />
            <div class="photo-meta">${formatDateShort(p.takenAt)}</div>
          </div>`).join('')}</div>`)
    : '';

  // Medical / emergency (only if filled)
  const hasMedical = profile && (profile.bloodType || profile.medications || profile.allergies || profile.emergencyContactName);
  const medicalSection = hasMedical ? sectionHtml('🏥', 'Medical &amp; Emergency Contact', infoTable([
    row('Blood Type', profile?.bloodType),
    row('Medications', profile?.medications),
    row('Allergies', profile?.allergies),
    row('Emergency Contact', profile?.emergencyContactName),
    row('Emergency Phone', profile?.emergencyContactPhone),
  ].join('')), '#2E7D32') : '';

  // ── Full HTML ─────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
    color: #111827;
    background: #fff;
    padding: 0;
  }

  /* ── Cover header ── */
  .cover-header {
    background: linear-gradient(135deg, #0D47A1 0%, #1565C0 60%, #1976D2 100%);
    color: #fff;
    padding: 36px 40px 28px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .cover-brand { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
  .cover-brand span { font-weight: 300; opacity: 0.8; }
  .cover-subtitle { font-size: 11px; opacity: 0.75; margin-top: 3px; letter-spacing: 1px; text-transform: uppercase; }
  .cover-meta { text-align: right; font-size: 11px; opacity: 0.85; line-height: 1.7; }
  .cover-meta strong { font-size: 13px; display: block; opacity: 1; }

  /* ── Report title banner ── */
  .title-banner {
    background: #F8FAFF;
    border-top: 1px solid #DBEAFE;
    border-bottom: 3px solid #1565C0;
    padding: 16px 40px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .title-banner-text { font-size: 18px; font-weight: 700; color: #0D47A1; }
  .title-banner-sub { font-size: 11px; color: #6B7280; margin-top: 2px; }

  /* ── Main body ── */
  .body-content { padding: 24px 40px 40px; }

  /* ── Summary card ── */
  .summary-card {
    background: #F0F7FF;
    border: 1px solid #BFDBFE;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 28px;
  }
  .summary-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
  }
  .summary-item {
    width: 50%;
    padding: 8px 12px;
    border-bottom: 1px solid #DBEAFE;
  }
  .summary-item:last-child, .summary-item:nth-last-child(2):nth-child(odd) { border-bottom: none; }
  .summary-label { font-size: 10px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
  .summary-value { font-size: 13px; font-weight: 600; color: #111827; }
  .status-pill { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
  .pill-complete { background: #D1FAE5; color: #065F46; }
  .pill-progress { background: #FEF3C7; color: #92400E; }

  /* ── Sections ── */
  .section { margin-bottom: 24px; page-break-inside: avoid; }
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    border-left: 4px solid #1565C0;
    padding-left: 10px;
    margin-bottom: 10px;
  }
  .section-icon { font-size: 14px; }
  .section-title { font-size: 13px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; }
  .section-body { padding-left: 14px; }

  /* ── Info tables ── */
  .info-table { width: 100%; border-collapse: collapse; border: 1px solid #E5E7EB; border-radius: 6px; overflow: hidden; }
  .info-table tr:nth-child(even) { background: #F9FAFB; }
  .info-table .row-highlight { background: #EFF6FF !important; }
  .cell-label {
    width: 36%;
    padding: 8px 12px;
    font-size: 10px;
    font-weight: 700;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    border-right: 1px solid #E5E7EB;
    vertical-align: top;
  }
  .cell-value { padding: 8px 12px; font-size: 12px; color: #111827; font-weight: 500; vertical-align: top; }

  /* ── Witness cards ── */
  .witness-card { margin-bottom: 12px; }
  .witness-num { font-size: 10px; font-weight: 700; color: #1565C0; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }

  /* ── Notes ── */
  .notes-box {
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    border-left: 4px solid #F59E0B;
    border-radius: 4px;
    padding: 14px 16px;
    font-size: 12px;
    line-height: 1.7;
    color: #1F2937;
    white-space: pre-wrap;
  }

  /* ── Photos ── */
  .photo-grid { display: flex; flex-wrap: wrap; gap: 14px; }
  .photo-card { width: 47%; border: 1px solid #E5E7EB; border-radius: 6px; overflow: hidden; page-break-inside: avoid; }
  .photo-index { background: #1565C0; color: #fff; font-size: 10px; font-weight: 700; padding: 5px 10px; letter-spacing: 0.3px; }
  .photo-card img { width: 100%; display: block; object-fit: cover; max-height: 220px; }
  .photo-meta { font-size: 10px; color: #9CA3AF; padding: 5px 10px; background: #F9FAFB; }

  /* ── Not recorded placeholder ── */
  .not-recorded { font-size: 11px; color: #9CA3AF; font-style: italic; padding: 8px 0; }

  /* ── Divider ── */
  .divider { border: none; border-top: 1px solid #E5E7EB; margin: 4px 0 24px; }

  /* ── Footer ── */
  .footer {
    background: #F9FAFB;
    border-top: 2px solid #E5E7EB;
    padding: 16px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-brand { font-size: 11px; font-weight: 700; color: #1565C0; }
  .footer-legal { font-size: 9px; color: #9CA3AF; max-width: 420px; line-height: 1.5; text-align: right; }
</style>
</head>
<body>

<!-- Cover Header -->
<div class="cover-header">
  <div>
    <div class="cover-brand">Crash<span>Safe</span></div>
    <div class="cover-subtitle">Vehicle Incident Documentation</div>
  </div>
  <div class="cover-meta">
    <strong>INCIDENT REPORT</strong>
    Report ID: CS-${reportId}<br/>
    Generated: ${formatDate(generatedAt)}<br/>
    Incident Date: ${formatDate(incidentDate)}
  </div>
</div>

<!-- Title Banner -->
<div class="title-banner">
  <div>
    <div class="title-banner-text">${incidentReportTitle}</div>
    <div class="title-banner-sub">Report ID: CS-${reportId} &nbsp;|&nbsp; ${formatDate(incidentDate)}</div>
  </div>
</div>

<!-- Body -->
<div class="body-content">

  <!-- Summary -->
  ${summaryCard}

  <!-- Claimant -->
  ${claimantSection}

  ${claimantSection ? '<hr class="divider"/>' : ''}

  <!-- Location -->
  ${locationSection}

  ${locationSection ? '<hr class="divider"/>' : ''}

  <!-- Third-Party Driver -->
  ${driverSection}

  ${driverSection ? '<hr class="divider"/>' : ''}

  <!-- Police -->
  ${policeSection}

  <hr class="divider"/>

  <!-- Witnesses -->
  ${witnessSection}

  ${witnessSection ? '<hr class="divider"/>' : ''}

  <!-- Notes -->
  ${notesSection}

  ${notesSection ? '<hr class="divider"/>' : ''}

  <!-- Photos -->
  ${photosSection}

  ${photosSection ? '<hr class="divider"/>' : ''}

  <!-- Medical -->
  ${medicalSection}

</div>

<!-- Footer -->
<div class="footer">
  <div class="footer-brand">CrashSafe &mdash; Incident Documentation</div>
  <div class="footer-legal">
    This report was generated by CrashSafe on ${formatDate(generatedAt)}. All information was
    provided by the incident reporter and has not been independently verified. Report ID: CS-${reportId}.
    For insurance, legal, and claims purposes only.
  </div>
</div>

</body>
</html>`;

  const { uri } = await Print.printToFileAsync({ html, width: 612, height: 792 });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Save or Share Incident Report',
    UTI: 'com.adobe.pdf',
  });
}
