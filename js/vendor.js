const VENDOR_ID = 1;

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    await loadVendorLocations();
    await fetchVendorSchedules();
    setupScheduleForm();
});

async function loadVendorLocations() {
    const res = await apiGet('/BusBooking/GetBusLocations');
    if (res && res.result && Array.isArray(res.data)) {
        const options = res.data.map(l => `<option value="${l.locationId}">${l.locationName}</option>`).join('');
        document.getElementById('vFrom').innerHTML = options;
        document.getElementById('vTo').innerHTML = options;
    }
}

async function fetchVendorSchedules() {
    const res = await apiGet(`/BusBooking/GetBusSchedules?vendorId=${VENDOR_ID}`);
    const tbody = document.getElementById('tblVendorSchedules');

    if (res && res.result && Array.isArray(res.data) && res.data.length > 0) {
        tbody.innerHTML = res.data.map(s => `
            <tr>
                <td><strong>${s.busName}</strong></td>
                <td>${s.busVehicleNo}</td>
                <td>${s.fromLocation} &rarr; ${s.toLocation}</td>
                <td>${new Date(s.departureTime).toLocaleString()}</td>
                <td>Rs. ${Number(s.price).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeSchedule(${s.scheduleId})">Delete</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No schedules configured for this vendor.</td></tr>`;
    }
}

function setupScheduleForm() {
    const form = document.getElementById('vendorScheduleForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSaveSchedule');
        btn.disabled = true;
        btn.innerText = 'Saving...';

        const payload = {
            vendorId: VENDOR_ID,
            busName: document.getElementById('vBusName').value.trim(),
            busVehicleNo: document.getElementById('vVehicleNo').value.trim(),
            fromLocation: parseInt(document.getElementById('vFrom').value),
            toLocation: parseInt(document.getElementById('vTo').value),
            departureTime: new Date(document.getElementById('vDeparture').value).toISOString(),
            arrivalTime: new Date(document.getElementById('vArrival').value).toISOString(),
            scheduleDate: new Date(document.getElementById('vDeparture').value).toISOString(),
            price: parseFloat(document.getElementById('vPrice').value),
            totalSeats: parseInt(document.getElementById('vSeats').value)
        };

        const res = await apiPost('/BusBooking/PostBusSchedule', payload);
        btn.disabled = false;
        btn.innerText = 'Add Schedule';

        if (res && res.result === true) {
            showAlert('vendorAlert', 'success', 'Schedule added successfully.');
            form.reset();
            fetchVendorSchedules();
        } else {
            showAlert('vendorAlert', 'danger', (res && res.message) ? res.message : 'Failed to create schedule.');
        }
    });
}

async function removeSchedule(id) {
    if (!confirm(`Remove schedule #${id}?`)) return;
    const res = await apiDelete(`/BusBooking/DeleteBusSchedule?id=${id}`);
    if (res && res.result === true) {
        showAlert('vendorAlert', 'success', 'Schedule removed.');
        fetchVendorSchedules();
    } else {
        showAlert('vendorAlert', 'danger', (res && res.message) ? res.message : 'Failed to delete schedule.');
    }
}