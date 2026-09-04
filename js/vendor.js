const CURRENT_VENDOR_ID = 1;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    populateVendorLocations();
    loadVendorSchedules();
});

async function populateVendorLocations() {
    const res = await apiGet('/BusBooking/GetBusLocations');
    if (res.result && Array.isArray(res.data)) {
        const options = res.data.map(l => `<option value="${l.locationId}">${l.locationName}</option>`).join('');
        document.getElementById('vFromLoc').innerHTML = options;
        document.getElementById('vToLoc').innerHTML = options;
    }
}

async function loadVendorSchedules() {
    const res = await apiGet(`/BusBooking/GetBusSchedules?vendorId=${CURRENT_VENDOR_ID}`);
    const tbody = document.getElementById('vendorScheduleTable');

    if (res.result && Array.isArray(res.data) && res.data.length > 0) {
        tbody.innerHTML = res.data.map(s => `
            <tr>
                <td><strong>${s.busName}</strong></td>
                <td>${s.busVehicleNo}</td>
                <td>${s.fromLocation} &rarr; ${s.toLocation}</td>
                <td>${new Date(s.departureTime).toLocaleString()}</td>
                <td>Rs. ${s.price.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSchedule(${s.scheduleId})">Delete</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No schedules found.</td></tr>`;
    }
}

document.getElementById('scheduleForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        vendorId: CURRENT_VENDOR_ID,
        busName: document.getElementById('busName').value.trim(),
        busVehicleNo: document.getElementById('busVehicleNo').value.trim(),
        fromLocation: parseInt(document.getElementById('vFromLoc').value),
        toLocation: parseInt(document.getElementById('vToLoc').value),
        departureTime: new Date(document.getElementById('departureTime').value).toISOString(),
        arrivalTime: new Date(document.getElementById('arrivalTime').value).toISOString(),
        scheduleDate: new Date(document.getElementById('departureTime').value).toISOString(),
        price: parseFloat(document.getElementById('price').value),
        totalSeats: parseInt(document.getElementById('totalSeats').value)
    };

    const res = await apiPost('/BusBooking/PostBusSchedule', payload);
    if (res.result) {
        showAlert('vendorAlert', 'success', 'Schedule added successfully.');
        document.getElementById('scheduleForm').reset();
        loadVendorSchedules();
    } else {
        showAlert('vendorAlert', 'danger', res.message || 'Failed to save schedule.');
    }
});

async function deleteSchedule(id) {
    if (!confirm(`Delete schedule #${id}?`)) return;
    const res = await apiDelete(`/BusBooking/DeleteBusSchedule?id=${id}`);
    if (res.result) {
        showAlert('vendorAlert', 'success', 'Schedule deleted.');
        loadVendorSchedules();
    } else {
        showAlert('vendorAlert', 'danger', res.message || 'Deletion failed.');
    }
}