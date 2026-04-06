'use strict';

// ── Mock driver pool (mirrors data.py VEHICLE_MAKE_MAPPING + Faker output) ──
const DRIVERS = [
  { name: 'Pradeep Kumara', initials: 'PK', car: 'Toyota Camry · Silver',     plate: 'KZT-4821', license: 'NY-DRV-881', rating: '4.92', color: '#c8f135', trips: '2,847' },
  { name: 'Sandra Kim',    initials: 'SK', car: 'Honda Accord · Black',       plate: 'PLM-2934', license: 'NY-DRV-442', rating: '4.87', color: '#93c5fd', trips: '1,203' },
  { name: 'Raj Patel',     initials: 'RP', car: 'Ford Explorer · Gray',       plate: 'TXQ-8810', license: 'NY-DRV-773', rating: '4.95', color: '#fca5a5', trips: '4,512' },
  { name: 'Leila Novak',   initials: 'LN', car: 'Chevrolet Tahoe · White',    plate: 'ZBW-5521', license: 'NY-DRV-219', rating: '4.78', color: '#a7f3d0', trips: '987'   },
  { name: 'Carlos Reyes',  initials: 'CR', car: 'Nissan Altima · Blue',       plate: 'MXR-3347', license: 'NY-DRV-558', rating: '4.91', color: '#fde68a', trips: '3,101' },
];

// ── State ──
let selectedType  = 'UberX';
let selectedPrice = 18.50;
let selectedEta   = 3;
let driverIdx     = 0;

// ── DOM refs ──
const rideCards     = document.querySelectorAll('.ride-card');
const bookBtn       = document.getElementById('bookBtn');
const btnPrice      = document.getElementById('btnPrice');
const totalFare     = document.getElementById('totalFare');
const statusMsg     = document.getElementById('statusMsg');
const overlay       = document.getElementById('confirmedOverlay');

// Map driver card
const mapAvatar     = document.getElementById('mapDriverAvatar');
const mapName       = document.getElementById('mapDriverName');
const mapCar        = document.getElementById('mapDriverCar');
const mapRating     = document.getElementById('mapDriverRating');
const mapPlate      = document.getElementById('mapPlate');
const mapEta        = document.getElementById('mapEta');
const mapTrips      = document.getElementById('mapTrips');
const mapLicense    = document.getElementById('mapLicense');

// Modal
const mSub          = document.getElementById('modalSub');
const mConf         = document.getElementById('modalConf');
const mFare         = document.getElementById('mFare');
const mEta          = document.getElementById('mEta');
const mDuration     = document.getElementById('mDuration');
const mAvatar       = document.getElementById('mAvatar');
const mDriverName   = document.getElementById('mDriverName');
const mDriverCar    = document.getElementById('mDriverCar');
const mEtaVal       = document.getElementById('mEtaVal');

// ── Helpers ──
function pickDriver() {
  driverIdx = Math.floor(Math.random() * DRIVERS.length);
  return DRIVERS[driverIdx];
}

function applyDriver(d) {
  mapAvatar.textContent       = d.initials;
  mapAvatar.style.background  = d.color;
  mapName.textContent         = d.name;
  mapCar.textContent          = d.car;
  mapRating.textContent       = d.rating;
  mapPlate.textContent        = d.plate;
  mapEta.textContent          = selectedEta + ' min';
  mapTrips.textContent        = d.trips;
  mapLicense.textContent      = d.license;
}

function showStatus(msg, type) {
  statusMsg.textContent  = msg;
  statusMsg.className    = `status-msg ${type}`;
}

function hideStatus() {
  statusMsg.className = 'status-msg hidden';
}

function openModal(ride) {
  const d = DRIVERS[driverIdx];

  mSub.textContent       = `${d.name.split(' ')[0]} is on the way — arriving in ${selectedEta} minutes.`;
  mConf.textContent      = `CONF: ${ride.confirmation_number || '——'}`;
  mFare.textContent      = `$${selectedPrice.toFixed(2)}`;
  mEta.textContent       = `${selectedEta} min`;
  mDuration.textContent  = `${ride.duration_minutes || 28} min`;
  mEtaVal.textContent    = `${selectedEta} min`;

  mAvatar.textContent         = d.initials;
  mAvatar.style.background    = d.color;
  mDriverName.textContent     = d.name;
  mDriverCar.textContent      = `${d.car} · ${d.plate}`;

  overlay.classList.add('show');
}

function closeModal() {
  overlay.classList.remove('show');
}

// ── Ride type selection ──
rideCards.forEach(card => {
  card.addEventListener('click', () => {
    rideCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');

    selectedType  = card.dataset.type;
    selectedPrice = parseFloat(card.dataset.price);
    selectedEta   = parseInt(card.dataset.eta, 10);

    if (totalFare) {
      totalFare.textContent = `$${selectedPrice.toFixed(2)}`;
    }
    btnPrice.textContent  = `— $${selectedPrice.toFixed(2)}`;
    hideStatus();

    applyDriver(pickDriver());
  });
});

// ── Book button ──
bookBtn.addEventListener('click', async () => {
  bookBtn.disabled = true;
  bookBtn.querySelector('span').textContent = 'Confirming…';
  hideStatus();

  try {
    const res  = await fetch('/book', { method: 'POST' });
    const data = await res.json();

    if (data.success || data.ride) {
      openModal(data.ride || {});
    } else {
      showStatus('Something went wrong. Please try again.', 'error');
    }
  } catch (err) {
    // Fallback for local dev without a running server
    console.warn('API unavailable, using mock data:', err.message);
    openModal({ confirmation_number: mockConf(), duration_minutes: 28 });
  } finally {
    bookBtn.disabled = false;
    bookBtn.querySelector('span').textContent = 'Confirm booking';
  }
});

// ── Modal close ──
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('doneBtn').addEventListener('click', closeModal);
document.getElementById('cancelRideBtn').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

// ── Track button ──
document.getElementById('trackBtn').addEventListener('click', () => {
  alert(`Tracking ${DRIVERS[driverIdx].name} — live tracking coming soon.`);
});

// ── Mock confirmation number (fallback) ──
function mockConf() {
  const chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '0123456789';
  const r = (s, n) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join('');
  return `${r(chars,2)}${r(digits,1)}-${r(digits,4)}-${r(chars,2)}${r(digits,2)}`;
}

// ── Init ──
applyDriver(DRIVERS[0]);
