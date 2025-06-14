const brands = [
    { id: 1, name: "Innova", image: "assets/images/Innova/" }
];

const discs = [
    {
        brand: 1,
        sn: 1,
        name: "",
        image: "assets/images/Innova/",
        condition: "",
        price: 1,
        weight: 1, 
        speed: 1,
        glide: 1,
        turn: 1,
        fade: 1
    }
];

let selectedDiscs = [];

const container = document.getElementById("content");
const itemsPerPage = 5;

function getDiscBrand(id) {
    const brand = brands.find(b => b.id === id);
    return brand ? brand.name : "Unknown Brand";
}

function showBrands() {
    container.innerHTML = `<h3 id="header">Select a Brand</h3>`;

    // Render selected discs list (if any)
    if (selectedDiscs.length > 0) {
        const list = document.createElement("div");
        list.id = "selected-list";
        const totalPrice = selectedDiscs.reduce((sum, disc) => sum + disc.price, 0);
        const discountNote = selectedDiscs.length > 2
            ? `<p style="color:#00b894; margin-top: 0.5rem;">Discount will be given for multiple disc purchase!</p>`
            : '';
        const selectedIds = selectedDiscs.map(d => d.sn).join(", ");
        list.innerHTML = `
            <h3>Selected Discs</h3>
            <div id="selected-ids">
                <strong>IDs:</strong> <span id="disc-ids">${selectedIds}</span>
                </br>
                <button id="copy-ids">Copy</button>
            </div>
            </br>
            <div id="total-price" style="margin-bottom: 1rem; font-size: 1.2rem;">
                Total: <strong>$${totalPrice.toFixed(2)}</strong>
                ${discountNote}
            </div>
        `;
        
        selectedDiscs.forEach(disc => {
            const item = document.createElement("div");
            item.className = "selected-item";
            item.innerHTML = `
                <img src="${disc.image}" alt="${disc.name}" width="80">
                <span>${disc.name}</span>
                <strong>$${disc.price}</strong>
                <button class="remove" data-sn="${disc.sn}" data-brand="${disc.brand}">Remove</button>
            `;
            list.appendChild(item);
        });

        container.appendChild(list);

        // Attach remove handlers
        container.querySelectorAll(".remove").forEach(btn => {
            const copyBtn = document.getElementById("copy-ids");
            if (copyBtn) {
                copyBtn.addEventListener("click", () => {
                    const idsText = document.getElementById("disc-ids").textContent;
                    navigator.clipboard.writeText(idsText).then(() => {
                        copyBtn.textContent = "Copied!";
                        setTimeout(() => copyBtn.textContent = "Copy", 1500);
                    });
                });
            }

            btn.addEventListener("click", (e) => {
            const confirmRemove = confirm("Are you sure?");
            if (!confirmRemove) return;

            const sn = parseInt(e.target.getAttribute("data-sn"));
            const brand = parseInt(e.target.getAttribute("data-brand"));
            selectedDiscs = selectedDiscs.filter(d => !(d.sn === sn && d.brand === brand));
            showBrands();
        });
        });
    }

    // Render brands
    brands.forEach(brand => {
        const div = document.createElement("div");
        div.className = "brand";
        div.innerHTML = `<a href="#" data-id="${brand.id}">${brand.name}</a>`;
        container.appendChild(div);
    });

    document.querySelectorAll(".brand a").forEach(anchor => {
        anchor.addEventListener("click", (e) => {
            e.preventDefault();
            const brandId = parseInt(e.target.getAttribute("data-id"));
            showDiscsByBrand(brandId, 1);
        });
    });
}


function showDiscsByBrand(brandId, page) {
    container.innerHTML = `
        <button id="back">← Back to Brands</button>
        <h3 id="header">${getDiscBrand(brandId)}</h3>
        <div id="sort-controls">
            <label for="sort-select">Sort by:</label>
            <select id="sort-select">
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
                <option value="price-asc">Price (Low → High)</option>
                <option value="price-desc">Price (High → Low)</option>
            </select>
        </div>
    `;

    const renderSortedDiscs = () => {
        let sortedDiscs = discs.filter(d => d.brand === brandId);
        const sortValue = document.getElementById("sort-select").value;

        sortedDiscs.sort((a, b) => {
            switch (sortValue) {
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                case "price-asc":
                    return a.price - b.price;
                case "price-desc":
                    return b.price - a.price;
                default:
                    return 0;
            }
        });

        const start = (page - 1) * itemsPerPage;
        const paginatedDiscs = sortedDiscs.slice(start, start + itemsPerPage);
        const totalPages = Math.ceil(sortedDiscs.length / itemsPerPage);

        // Clear previous results
        const existingCards = container.querySelectorAll(".disc-card, .pagination, #empty");
        existingCards.forEach(el => el.remove());

        if (sortedDiscs.length === 0) {
            const div = document.createElement("div");
            div.innerHTML = `<h1 id="empty">Nothing Available</h1>`;
            container.appendChild(div);
        } else {
            paginatedDiscs.forEach(disc => {
                const div = document.createElement("div");
                div.className = "disc-card";
                div.innerHTML = `
                    <h3 id="h3">#${disc.sn}</h3>
                    <img src="${disc.image}" alt="${disc.name}">
                    <div class="disc-info">
                        <div>
                            <h3>${disc.name}</h3>
                            <p>Condition: <strong>${disc.condition}</strong></p>
                            <h3><strong>$${disc.price}</strong></h3>
                        </div>
                        <div>
                            <p>Weight: <strong>${disc.weight}g</strong></p>
                            </br>
                            <p>Flight Numbers</p>
                            <p><strong>${disc.speed}/${disc.glide}/${disc.turn}/${disc.fade}</strong></p>
                        </div>
                    </div>
                    <label>
                        <input type="checkbox" class="disc-check" data-sn="${disc.sn}" data-brand="${disc.brand}" ${selectedDiscs.some(d => d.sn === disc.sn && d.brand === disc.brand) ? 'checked' : ''}>
                        WANT IT!
                    </label>
                `;
                container.appendChild(div);
            });

            const pagination = document.createElement("div");
            pagination.className = "pagination";
            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement("button");
                btn.textContent = i;
                if (i === page) btn.disabled = true;
                btn.addEventListener("click", () => {
                    page = i;
                    renderSortedDiscs();
                });
                pagination.appendChild(btn);
            }
            container.appendChild(pagination);
        }
        document.querySelectorAll(".disc-check").forEach(box => {
        box.addEventListener("change", (e) => {
        const sn = parseInt(e.target.getAttribute("data-sn"));
        const brand = parseInt(e.target.getAttribute("data-brand"));
        const disc = discs.find(d => d.sn === sn && d.brand === brand);

        if (e.target.checked) {
            if (!selectedDiscs.some(d => d.sn === sn && d.brand === brand)) {
                selectedDiscs.push(disc);
            }
        } else {
            selectedDiscs = selectedDiscs.filter(d => !(d.sn === sn && d.brand === brand));
        }
    });
});

    };

    // Sort change handler
    container.querySelector("#sort-select").addEventListener("change", () => {
        page = 1;
        renderSortedDiscs();
    });

    document.getElementById("back").addEventListener("click", showBrands);

    renderSortedDiscs(); // initial render



  // Pagination Controls
    const pagination = document.createElement("div");
    pagination.className = "pagination";
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === page) btn.disabled = true;
        btn.addEventListener("click", () => showDiscsByBrand(brandId, i));
        pagination.appendChild(btn);
    }
    container.appendChild(pagination);

    document.getElementById("back").addEventListener("click", showBrands);
}

showBrands();
