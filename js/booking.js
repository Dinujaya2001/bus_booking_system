let selectedSeats = [];
let currentSchedule = null;

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    const scheduleId = sessionStorage.getItem('selectedScheduleId');
    if (!scheduleId) {
        window.location.href = 'index.html';
        return;
    }
    await loadSeatInformation(scheduleId);
    initBookingForm();
});

async function loadSeatInformation(scheduleId) {
    const [schedRes, bookedRes] = await Promise.all([
        apiGet(`/BusBooking/GetBusScheduleById?id=${scheduleId}`),
        apiGet(`/BusBooking/getBookedSeats?scheduleId=${scheduleId}`)
    ]);

    if (!schedRes || !schedRes.result || !schedRes.data) {
        showAlert('bookingAlert', 'danger', 'Unable to retrieve schedule information.');
        return;
    }

    currentSchedule = schedRes.data;
    document.getElementById('scheduleTitle').innerText = `${currentSchedule.busName} (${currentSchedule.busVehicleNo})`;

    const bookedSeatNumbers = (bookedRes && bookedRes.result && Array.isArray(bookedRes.data)) ? bookedRes.data : [];
    renderSeats(currentSchedule.totalSeats || 40, bookedSeatNumbers);
}

function renderSeats(total, bookedList) {
    const grid = document.getElementById('seatGrid');
    grid.innerHTML = '';

    for (let i = 1; i <= total; i++) {
        const isBooked = bookedList.includes(i);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = i;
        btn.className = `btn btn-sm ${isBooked ? 'btn-danger disabled' : 'btn-outline-secondary'}`;

        if (!isBooked) {
            btn.onclick = () => toggleSeat(i, btn);
        }
        grid.appendChild(btn);
    }
}

function toggleSeat(seatNum, btn) {
    if (selectedSeats.includes(seatNum)) {
        selectedSeats = selectedSeats.filter(s => s !== seatNum);
        btn.classList.replace('btn-primary', 'btn-outline-secondary');
    } else {
        selectedSeats.push(seatNum);
        btn.classList.replace('btn-outline-secondary', 'btn-primary');
    }
    renderPassengerInputs();
}

function renderPassengerInputs() {
    const container = document.getElementById('passengerContainer');
    const checkout = document.getElementById('checkoutBox');
    const status = document.getElementById('selectionStatus');

    if (selectedSeats.length === 0) {
        container.innerHTML = '';
        checkout.classList.add('d-none');
        status.innerText = 'Select available seats from the layout to proceed.';
        return;
    }

    status.innerText = `Selected Seats: ${selectedSeats.join(', ')}`;
    checkout.classList.remove('d-none');
    
    const totalPrice = (selectedSeats.length * currentSchedule.price);
    document.getElementById('lblTotalPrice').innerText = `Rs. ${totalPrice.toFixed(2)}`;

    container.innerHTML = selectedSeats.map(seat => `
        <div class="border rounded p-3 mb-3 bg-light">
            <span class="badge bg-primary mb-2">Seat #${seat}</span>
            <div class="row g-2">
                <div class="col-md-5">
                    <input type="text" class="form-control form-control-sm" placeholder="Passenger Name" id="name_${seat}" required>
                </div>
                <div class="col-md-3">
                    <input type="number" class="form-control form-control-sm" placeholder="Age" id="age_${seat}" min="1" max="100" required>
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

function initBookingForm() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = checkAuth();
        const btn = document.getElementById('btnConfirmBooking');
        btn.disabled = true;
        btn.innerText = 'Reserving Seats...';

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
        btn.disabled = false;
        btn.innerText = 'Confirm & Reserve';

        if (res && res.result === true) {
            alert('Reservation completed successfully!');
            sessionStorage.removeItem('selectedScheduleId');
            window.location.href = 'my-bookings.html';
        } else {
            showAlert('bookingAlert', 'danger', (res && res.message) ? res.message : 'Reservation failed.');
        }
    });
}