document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadLocations();
    document.getElementById('travelDate').valueAsDate = new Date();
});

// Load Bus Locations into Dropdowns
async function loadLocations() {
    const res = await apiGet('/BusBooking/GetBusLocations');
    if (res.result && Array.isArray(res.data)) {
        const options = res.data
            .map(loc => `<option value="${loc.locationId}">${loc.locationName}</option>`)
            .join('');
        document.getElementById('fromLoc').innerHTML += options;
        document.getElementById('toLoc').innerHTML += options;
    }
}

// Search Buses via Endpoint
document.getElementById('searchForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const from = document.getElementById('fromLoc').value;
    const to = document.getElementById('toLoc').value;
    const date = document.getElementById('travelDate').value;

    const res = await apiGet(`/BusBooking/searchBus?fromLocation=${from}&toLocation=${to}&travelDate=${date}`);
    const container = document.getElementById('resultsContainer');

    if (res.result && res.data.length > 0) {
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
                        <h4 class="text-success mb-2">Rs. ${bus.price.toFixed(2)}</h4>
                        <button class="btn btn-outline-primary" onclick="proceedToBooking(${bus.scheduleId})">
                            Select Seats
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = `<div class="alert alert-warning">No schedules found for the selected route and date.</div>`;
    }
});

function proceedToBooking(scheduleId) {
    sessionStorage.setItem('selectedScheduleId', scheduleId);
    window.location.href = 'booking.html';
}