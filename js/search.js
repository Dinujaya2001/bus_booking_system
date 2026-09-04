document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    
    // Set default travel date to today
    const dateInput = document.getElementById('travelDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    
    await populateLocations();
    setupSearchForm();
});

async function populateLocations() {
    const fromSelect = document.getElementById('fromLoc');
    const toSelect = document.getElementById('toLoc');

    const res = await apiGet('/BusBooking/GetBusLocations');
    if (res && res.result && Array.isArray(res.data)) {
        const options = res.data.map(item => `<option value="${item.locationId}">${item.locationName}</option>`).join('');
        fromSelect.innerHTML = `<option value="" disabled selected>Select Origin</option>${options}`;
        toSelect.innerHTML = `<option value="" disabled selected>Select Destination</option>${options}`;
    } else {
        fromSelect.innerHTML = '<option value="" disabled>Failed to load locations</option>';
        toSelect.innerHTML = '<option value="" disabled>Failed to load locations</option>';
    }
}

function setupSearchForm() {
    const form = document.getElementById('searchForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const from = document.getElementById('fromLoc').value;
        const to = document.getElementById('toLoc').value;
        const date = document.getElementById('travelDate').value;

        const container = document.getElementById('resultsContainer');
        container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></div>';

        const res = await apiGet(`/BusBooking/searchBus?fromLocation=${from}&toLocation=${to}&travelDate=${date}`);

        if (res && res.result && Array.isArray(res.data) && res.data.length > 0) {
            container.innerHTML = res.data.map(bus => `
                <div class="card shadow-sm border-0 mb-3">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title text-primary mb-1">${bus.busName}</h5>
                            <span class="badge bg-secondary mb-2">${bus.busVehicleNo}</span>
                            <div class="text-muted small">
                                Departure: <strong>${new Date(bus.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong> |
                                Arrival: <strong>${new Date(bus.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>
                            </div>
                        </div>
                        <div class="text-end">
                            <h4 class="text-success mb-2">Rs. ${Number(bus.price).toFixed(2)}</h4>
                            <button class="btn btn-outline-primary px-4" onclick="selectBus(${bus.scheduleId})">
                                Select Seats
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="alert alert-warning text-center">
                    No active bus schedules found for this selected route and date.
                </div>`;
        }
    });
}

function selectBus(scheduleId) {
    sessionStorage.setItem('selectedScheduleId', scheduleId);
    window.location.href = 'booking.html';
}