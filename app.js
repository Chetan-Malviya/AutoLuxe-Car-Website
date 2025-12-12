/* --- Data & State --- */
// Default cars if localStorage is empty
const defaultCars = [
    { id: 1, model: "Tesla Model S", price: 89990, year: 2024, fuel: "Electric", img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80" },
    { id: 2, model: "BMW M4 Competition", price: 79000, year: 2023, fuel: "Petrol", img: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=600&q=80" },
    { id: 3, model: "Mercedes AMG GT", price: 115000, year: 2023, fuel: "Hybrid", img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80" },
    { id: 4, model: "Audi e-tron GT", price: 104000, year: 2024, fuel: "Electric", img: "https://www.cnet.com/a/img/resize/49b18b2384224aabf25d5ce3c49ffe7c86b4a91f/hub/2021/02/08/76bc4d00-2c49-4afb-b97e-80cd4ab15eb7/audi-e-tron-gt-rs-15.jpg?auto=webp&fit=crop&height=675&width=1200" },
    { id: 5, model: "Porsche 911 Carrera", price: 120000, year: 2022, fuel: "Petrol", img: "https://res.cloudinary.com/unix-center/image/upload/c_limit,dpr_3.0,f_auto,fl_progressive,g_center,h_580,q_75,w_906/kpjpk6syexcbruz7gasd.jpg" },
    { id: 6, model: "Ford Mustang Mach-E", price: 45000, year: 2024, fuel: "Electric", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80" }
];

let cars = JSON.parse(localStorage.getItem('cars')) || defaultCars;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let compareList = [];
let currentUser = JSON.parse(sessionStorage.getItem('user'));

/* --- Authentication (login.html logic) --- */
function initAuth() {
    const form = document.getElementById('auth-form');
    const toggleBtn = document.getElementById('toggle-auth');
    const formTitle = document.getElementById('form-title');
    const nameGroup = document.getElementById('name-group');
    const errorMsg = document.getElementById('error-msg');
    
    let isLogin = true;

    // Hardcoded users for demo
    const users = [
        { email: 'user@example.com', password: 'password123', name: 'Demo User' }
    ];

    if(toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isLogin = !isLogin;
            formTitle.innerText = isLogin ? 'Welcome Back' : 'Create Account';
            toggleBtn.innerText = isLogin ? 'New here? Create an account' : 'Already have an account? Login';
            nameGroup.style.display = isLogin ? 'none' : 'block';
            errorMsg.style.display = 'none';
        });
    }

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (isLogin) {
                const user = users.find(u => u.email === email && u.password === password);
                if (user) {
                    sessionStorage.setItem('user', JSON.stringify(user));
                    window.location.href = 'index.html';
                } else {
                    errorMsg.style.display = 'block';
                }
            } else {
                // Mock Signup
                const name = document.getElementById('fullname').value;
                const newUser = { email, password, name };
                sessionStorage.setItem('user', JSON.stringify(newUser));
                window.location.href = 'index.html';
            }
        });
    }
}

/* --- Main App (index.html logic) --- */
function initApp() {
    // Check Auth
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('user-display').innerText = `Hello, ${currentUser.name}`;
    
    // Initial Render
    renderCars(cars);
    updateContactDropdown();

    // Search Listener
    document.getElementById('search-input').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = cars.filter(c => c.model.toLowerCase().includes(term));
        renderCars(filtered);
    });

    // Admin Form Listener
    document.getElementById('admin-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newCar = {
            id: Date.now(),
            model: document.getElementById('admin-model').value,
            price: Number(document.getElementById('admin-price').value),
            year: Number(document.getElementById('admin-year').value),
            fuel: document.getElementById('admin-fuel').value,
            img: document.getElementById('admin-img').value
        };
        cars.push(newCar);
        localStorage.setItem('cars', JSON.stringify(cars));
        renderCars(cars);
        alert('Car added successfully!');
        e.target.reset();
    });

    // Test Drive Form
    document.getElementById('test-drive-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert(`Request Sent! We will contact you shortly.`);
        e.target.reset();
        router('home');
    });
}

function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}

/* --- Routing System --- */
function router(viewName) {
    const views = ['home', 'inventory', 'contact', 'favorites', 'admin', 'comparison'];
    views.forEach(v => {
        const el = document.getElementById(`view-${v}`);
        if(v === viewName) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });

    if (viewName === 'inventory') renderCars(cars);
    if (viewName === 'favorites') renderFavorites();
    if (viewName === 'comparison') renderComparisonTable();
    window.scrollTo(0,0);
}

/* --- Inventory & Cards --- */
function renderCars(carList) {
    const grid = document.getElementById('car-grid');
    grid.innerHTML = '';

    if (carList.length === 0) {
        grid.innerHTML = '<p>No cars found.</p>';
        return;
    }

    carList.forEach(car => {
        const isFav = favorites.some(f => f.id === car.id);
        const inCompare = compareList.some(c => c.id === car.id);
        
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFav(${car.id})">
                ${isFav ? '♥' : '♡'}
            </button>
            <img src="${car.img}" alt="${car.model}" onclick="showDetails(${car.id})">
            <div class="card-body">
                <div class="card-title">
                    <span>${car.model}</span>
                </div>
                <div class="card-price">$${car.price.toLocaleString()}</div>
                <div class="card-specs">
                    <span>${car.year}</span>
                    <span>${car.fuel}</span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="showDetails(${car.id})">Details</button>
                    <button class="btn btn-outline" style="color:#555; border:1px solid #ccc" onclick="toggleCompare(${car.id})">
                        ${inCompare ? 'Remove' : 'Compare'}
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(div);
    });
}

function updateContactDropdown() {
    const select = document.getElementById('contact-car-select');
    select.innerHTML = '';
    cars.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.model;
        opt.innerText = c.model;
        select.appendChild(opt);
    });
}

/* --- Comparison Feature --- */
function toggleCompare(id) {
    const car = cars.find(c => c.id === id);
    const index = compareList.findIndex(c => c.id === id);

    if (index > -1) {
        compareList.splice(index, 1);
    } else {
        if (compareList.length >= 3) {
            alert("You can only compare up to 3 cars.");
            return;
        }
        compareList.push(car);
    }
    
    updateCompareUI();
    renderCars(cars); // Re-render to update button state
}

function updateCompareUI() {
    const bar = document.getElementById('compare-bar');
    const count = document.getElementById('compare-count');
    
    if (compareList.length > 0) {
        bar.style.display = 'flex';
        count.innerText = compareList.length;
    } else {
        bar.style.display = 'none';
    }
}

function clearCompare() {
    compareList = [];
    updateCompareUI();
    renderCars(cars);
}

function renderComparisonTable() {
    const container = document.getElementById('comparison-container');
    if (compareList.length === 0) {
        container.innerHTML = '<p>No cars selected for comparison.</p>';
        return;
    }

    let html = '<table><thead><tr><th>Feature</th>';
    compareList.forEach(c => {
        html += `<th>${c.model}</th>`;
    });
    html += '</tr></thead><tbody>';

    const features = ['Price', 'Year', 'Fuel Type'];
    const keys = ['price', 'year', 'fuel'];

    keys.forEach((key, i) => {
        html += `<tr><td><strong>${features[i]}</strong></td>`;
        compareList.forEach(c => {
            let val = c[key];
            if(key === 'price') val = '$' + val.toLocaleString();
            html += `<td>${val}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

/* --- Favorites --- */
function toggleFav(id) {
    const car = cars.find(c => c.id === id);
    const index = favorites.findIndex(f => f.id === id);

    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(car);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderCars(cars);
    renderFavorites(); // Update fav view if active
}

function renderFavorites() {
    const grid = document.getElementById('fav-grid');
    const noFav = document.getElementById('no-favs');
    
    grid.innerHTML = '';
    
    if (favorites.length === 0) {
        noFav.style.display = 'block';
        return;
    }
    noFav.style.display = 'none';

    favorites.forEach(car => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <button class="fav-btn active" onclick="toggleFav(${car.id})">♥</button>
            <img src="${car.img}" alt="${car.model}">
            <div class="card-body">
                <div class="card-title">${car.model}</div>
                <div class="card-price">$${car.price.toLocaleString()}</div>
                <button class="btn btn-primary" style="width:100%; margin-top:10px;" onclick="showDetails(${car.id})">Details</button>
            </div>
        `;
        grid.appendChild(div);
    });
}

/* --- Modal --- */
function showDetails(id) {
    const car = cars.find(c => c.id === id);
    const modal = document.getElementById('details-modal');
    const body = document.getElementById('modal-body');

    body.innerHTML = `
        <img src="${car.img}" style="width:100%; border-radius: 8px; margin-bottom: 20px;">
        <h2>${car.model}</h2>
        <h3 style="color:var(--accent); margin: 10px 0;">$${car.price.toLocaleString()}</h3>
        <p><strong>Year:</strong> ${car.year}</p>
        <p><strong>Fuel:</strong> ${car.fuel}</p>
        <p style="margin-top: 10px; color: #666;">
            This ${car.year} ${car.model} offers top-tier performance and luxury. 
            Includes premium leather seats, advanced navigation, and a 5-year warranty.
        </p>
    `;
    
    modal.classList.add('open');
}

function closeModal() {
    document.getElementById('details-modal').classList.remove('open');
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('details-modal');
    if (event.target == modal) {
        closeModal();
    }
}