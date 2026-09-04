let selectedSeats = [];
let scheduleDetails = null;

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    const scheduleId = sessionStorage.getItem('selectedScheduleId');
    if (!scheduleId) {
        window.location.href = 'index.html';
        return;
    }
    await initSeatMap(scheduleId);
});

async function initSeatMap(scheduleId) {
    const [schedRes, bookedRes] = await Promise.all([
        apiGet(`/BusBooking/GetBusScheduleById?id=${scheduleId}`),
        apiGet(`/BusBooking/getBookedSeats?scheduleId=${scheduleId}`)
    ]);

    if (!schedRes.result) {
        showAlert('bookingAlert', 'danger', 'Unable to fetch schedule details.');
        return;
    }

    scheduleDetails = schedRes.data;
    const bookedSeats = bookedRes.result ? bookedRes.data : [];
    const grid = document.getElementById('seatGrid');
    grid.innerHTML = '';

    const totalSeats = scheduleDetails.totalSeats || 40;

    for (let i = 1; i <= totalSeats; i++) {
        const isBooked = bookedSeats.includes(i);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = i;
        btn.className = `btn btn-sm ${isBooked ? 'btn-danger disabled' : 'btn-outline-secondary'}`;
        
        if (!isBooked) {
            btn.onclick = () => toggleSeatSelection(i, btn);
        }
        grid.appendChild(btn);
    }
}

function toggleSeatSelection(seatNo, btn) {
    if (selectedSeats.includes(seatNo)) {
        selectedSeats = selectedSeats.filter(s => s !== seatNo);
        btn.classList.replace('btn-primary', 'btn-outline-secondary');
    } else {
        selectedSeats.push(seatNo);
        btn.classList.replace('btn-outline-secondary', 'btn-primary');
    }
    updatePassengerForm();
}

function updatePassengerForm() {
    const container = document.getElementById('passengerFields');
    const checkout = document.getElementById('checkoutSection');
    const summary = document.getElementById('selectionSummary');

    if (selectedSeats.length === 0) {
        container.innerHTML = '';
        checkout.classList.add('d-none');
        summary.innerText = 'Select a seat to add passenger info';
        return;
    }

    summary.innerText = `Selected Seats: ${selectedSeats.join(', ')}`;
    checkout.classList.remove('d-none');
    document.getElementById('totalPrice').innerText = `Rs. ${(selectedSeats.length * scheduleDetails.price).toFixed(2)}`;

    container.innerHTML = selectedSeats.map(seat => `
        <div class="border rounded p-3 mb-3 bg-light">
            <h6 class="text-primary mb-2">Passenger for Seat #${seat}</h6>
            <div class="row g-2">
                <div class="col-md-5">
                    <input type="text" class="form-control form-control-sm" placeholder="Full Name" id="name_${seat}" required>
                </div>
                <div class="col-md-3">
                    <input type="number" class="form-control form-control-sm" placeholder="Age" id="age_${seat}" required min="1" max="120">
                </div>
                <div class="col-md-4">
                    <select class="form-select form-select-sm" id="gender_${seat}">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
        </div>
    `).join('');
}

document.getElementById('bookingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = checkAuth();

    const passengers = selectedSeats.map(seat => ({
        passengerName: document.getElementById(`name_${seat}`).value.trim(),
        age: parseInt(document.getElementById(`age_${seat}`).value),
        gender: document.getElementById(`gender_${seat}`).value,
        seatNo: seat
    }));

    const payload = {
        custId: user.userId || 1,
        bookingDate: new Date().toISOString(),
        scheduleId: parseInt(sessionStorage.getItem('selectedScheduleId')),
        busBookingPassengers: passengers
    };

    const res = await apiPost('/BusBooking/PostBusBooking', payload);
    if (res.result) {
        alert('Booking successfully created!');
        sessionStorage.removeItem('selectedScheduleId');
        window.location.href = 'my-bookings.html';
    } else {
        showAlert('bookingAlert', 'danger', res.message || 'Booking submission failed.');
    }
});