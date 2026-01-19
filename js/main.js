
// Prices, deposits & installments fully synced with HTML pages (realistic 2026 Kenyan market)

const phonesData = {
    // ── INFINIX SMART SERIES ───────────────────────────────────────────────
    "infinix-smart-10-hd": {
        model: "Infinix Smart 10 HD",
        storage: "2GB RAM / 64GB Storage",
        cash: 10000,
        deposit: 1500,
        daily: 85,
        period: 120
    },
    "infinix-smart-10": {
        model: "Infinix Smart 10",
        storage: "4GB RAM / 64GB Storage",
        cash: 11500,
        deposit: 1500,
        daily: 90,
        period: 130
    },
    "infinix-smart-9": {
        model: "Infinix Smart 9",
        storage: "4GB RAM / 128GB Storage",
        cash: 11500,
        deposit: 1500,
        daily: 90,
        period: 140
    },
    "infinix-smart-10-128gb": {
        model: "Infinix Smart 10 (128GB)",
        storage: "4GB RAM / 128GB Storage",
        cash: 12000,
        deposit: 1500,
        daily: 95,
        period: 145
    },
    "infinix-smart-8": {
        model: "Infinix Smart 8",
        storage: "3GB RAM / 64GB Storage",
        cash: 13500,
        deposit: 1500,
        daily: 105,
        period: 125
    },
    "infinix-smart-8-hd": {
        model: "Infinix Smart 8 HD",
        storage: "3GB RAM / 64GB Storage",
        cash: 10600,
        deposit: 1500,
        daily: 85,
        period: 128
    },
    "infinix-smart-7": {
        model: "Infinix Smart 7",
        storage: "3GB RAM / 64GB Storage",
        cash: 12500,
        deposit: 1500,
        daily: 95,
        period: 120
    },
    "infinix-smart-7-hd": {
        model: "Infinix Smart 7 HD",
        storage: "2GB RAM / 64GB Storage",
        cash: 12500,
        deposit: 1500,
        daily: 95,
        period: 115
    },
    "infinix-smart-6": {
        model: "Infinix Smart 6",
        storage: "2GB RAM / 32GB Storage",
        cash: 9600,
        deposit: 1500,
        daily: 80,
        period: 110
    },
    "infinix-smart-6-hd": {
        model: "Infinix Smart 6 HD",
        storage: "2GB RAM / 32GB Storage",
        cash: 11300,
        deposit: 1500,
        daily: 90,
        period: 105
    },

    // ── INFINIX HOT SERIES ─────────────────────────────────────────────────
    "infinix-hot-50i": {
        model: "Infinix Hot 50i",
        storage: "6GB RAM / 128GB Storage",
        cash: 12700,
        deposit: 1500,
        daily: 100,
        period: 140
    },
    "infinix-hot-40i": {
        model: "Infinix Hot 40i",
        storage: "4GB RAM / 128GB Storage",
        cash: 12700,
        deposit: 1500,
        daily: 100,
        period: 150
    },
    "infinix-hot-60i": {
        model: "Infinix Hot 60i",
        storage: "6GB RAM / 128GB Storage",
        cash: 13000,
        deposit: 1500,
        daily: 100,
        period: 160
    },
    "infinix-hot-60i-256gb": {
        model: "Infinix Hot 60i (256GB)",
        storage: "8GB RAM / 256GB Storage",
        cash: 15000,
        deposit: 1850,
        daily: 115,
        period: 170
    },
    "infinix-hot-40": {
        model: "Infinix Hot 40",
        storage: "8GB RAM / 256GB Storage",
        cash: 23500,
        deposit: 2100,
        daily: 165,
        period: 190
    },
    "infinix-hot-30i": {
        model: "Infinix Hot 30i",
        storage: "4GB RAM / 128GB Storage",
        cash: 18300,
        deposit: 1850,
        daily: 135,
        period: 145
    },
    "infinix-hot-30": {
        model: "Infinix Hot 30",
        storage: "8GB RAM / 256GB Storage",
        cash: 14500,
        deposit: 1850,
        daily: 110,
        period: 165
    },
    "infinix-hot-20i": {
        model: "Infinix Hot 20i",
        storage: "4GB RAM / 64GB Storage",
        cash: 13000,
        deposit: 1500,
        daily: 100,
        period: 135
    },
    "infinix-hot-20": {
        model: "Infinix Hot 20",
        storage: "6GB RAM / 128GB Storage",
        cash: 20000,
        deposit: 2100,
        daily: 145,
        period: 148
    },
    "infinix-hot-12i": {
        model: "Infinix Hot 12i",
        storage: "4GB RAM / 64GB Storage",
        cash: 13200,
        deposit: 1500,
        daily: 100,
        period: 130
    },
    "infinix-hot-12": {
        model: "Infinix Hot 12",
        storage: "6GB RAM / 128GB Storage",
        cash: 20199,
        deposit: 2100,
        daily: 145,
        period: 150
    },
    "infinix-hot-11": {
        model: "Infinix Hot 11",
        storage: "4GB RAM / 64GB Storage",
        cash: 18000,
        deposit: 1850,
        daily: 135,
        period: 140
    },
    "infinix-hot-10i": {
        model: "Infinix Hot 10i",
        storage: "2GB RAM / 32GB Storage",
        cash: 12500,
        deposit: 1500,
        daily: 95,
        period: 120
    },
    "infinix-hot-10": {
        model: "Infinix Hot 10",
        storage: "4GB RAM / 128GB Storage",
        cash: 14200,
        deposit: 1850,
        daily: 105,
        period: 145
    },
    "infinix-hot-9": {
        model: "Infinix Hot 9",
        storage: "3GB RAM / 64GB Storage",
        cash: 13300,
        deposit: 1500,
        daily: 100,
        period: 135
    },
    "infinix-hot-8": {
        model: "Infinix Hot 8",
        storage: "2GB RAM / 32GB Storage",
        cash: 12900,
        deposit: 1500,
        daily: 100,
        period: 120
    },

    // ── INFINIX NOTE SERIES ────────────────────────────────────────────────
    "infinix-note-30": {
        model: "Infinix Note 30",
        storage: "8GB RAM / 256GB Storage",
        cash: 21000,
        deposit: 2100,
        daily: 150,
        period: 210
    },
    "infinix-note-40-pro-plus": {
        model: "Infinix Note 40 Pro+",
        storage: "12GB RAM / 256GB Storage",
        cash: 36500,
        deposit: 3100,
        daily: 265,
        period: 230
    },
    "infinix-note-40": {
        model: "Infinix Note 40",
        storage: "8GB RAM / 256GB Storage",
        cash: 23800,
        deposit: 2100,
        daily: 170,
        period: 205
    },
    "infinix-note-30-pro": {
        model: "Infinix Note 30 Pro",
        storage: "8GB RAM / 256GB Storage",
        cash: 23500,
        deposit: 2100,
        daily: 165,
        period: 220
    },
    "infinix-note-12": {
        model: "Infinix Note 12",
        storage: "6GB RAM / 128GB Storage",
        cash: 27200,
        deposit: 2100,
        daily: 190,
        period: 180
    },
    "infinix-note-11": {
        model: "Infinix Note 11",
        storage: "6GB RAM / 128GB Storage",
        cash: 21900,
        deposit: 2100,
        daily: 155,
        period: 175
    },
    "infinix-note-10": {
        model: "Infinix Note 10",
        storage: "4GB RAM / 128GB Storage",
        cash: 18000,
        deposit: 1850,
        daily: 135,
        period: 160
    },
    "infinix-note-8": {
        model: "Infinix Note 8",
        storage: "6GB RAM / 128GB Storage",
        cash: 21800,
        deposit: 2100,
        daily: 155,
        period: 170
    },
    "infinix-note-7": {
        model: "Infinix Note 7",
        storage: "4GB RAM / 64GB Storage",
        cash: 21000,
        deposit: 2100,
        daily: 150,
        period: 150
    },

    // ── INFINIX GT SERIES ──────────────────────────────────────────────────
    "infinix-gt-30-pro": {
        model: "Infinix GT 30 Pro",
        storage: "12GB RAM / 512GB Storage",
        cash: 38000,
        deposit: 3100,
        daily: 275,
        period: 230
    },
    "infinix-gt-20-pro": {
        model: "Infinix GT 20 Pro",
        storage: "12GB RAM / 256GB Storage",
        cash: 40000,
        deposit: 3100,
        daily: 290,
        period: 215
    },
    "infinix-gt-10-pro": {
        model: "Infinix GT 10 Pro",
        storage: "8GB RAM / 256GB Storage",
        cash: 38000,
        deposit: 3100,
        daily: 275,
        period: 190
    },

    // ── INFINIX ZERO SERIES ────────────────────────────────────────────────
    "infinix-zero-30": {
        model: "Infinix Zero 30",
        storage: "8GB RAM / 256GB Storage",
        cash: 39400,
        deposit: 3100,
        daily: 285,
        period: 235
    },
    "infinix-zero-20": {
        model: "Infinix Zero 20",
        storage: "8GB RAM / 256GB Storage",
        cash: 37500,
        deposit: 3100,
        daily: 270,
        period: 210
    },
    "infinix-zero-x-pro": {
        model: "Infinix Zero X Pro",
        storage: "8GB RAM / 256GB Storage",
        cash: 34500,
        deposit: 2700,
        daily: 250,
        period: 180
    },
    "infinix-zero-8": {
        model: "Infinix Zero 8",
        storage: "8GB RAM / 128GB Storage",
        cash: 28500,
        deposit: 2100,
        daily: 200,
        period: 170
    },

    // ── TECNO POP SERIES ───────────────────────────────────────────────────
    "tecno-pop-7-pro": {
        model: "Tecno Pop 7 Pro",
        storage: "4GB RAM / 64GB Storage",
        cash: 11500,
        deposit: 1500,
        daily: 90,
        period: 130
    },
    "tecno-pop-8": {
        model: "Tecno Pop 8",
        storage: "4GB RAM / 64GB Storage",
        cash: 10800,
        deposit: 1500,
        daily: 85,
        period: 125
    },
    "tecno-pop-7": {
        model: "Tecno Pop 7",
        storage: "2GB RAM / 64GB Storage",
        cash: 9800,
        deposit: 1500,
        daily: 80,
        period: 115
    },
    "tecno-pop-6-go": {
        model: "Tecno Pop 6 Go",
        storage: "2GB RAM / 32GB Storage",
        cash: 8200,
        deposit: 1500,
        daily: 70,
        period: 100
    },
    "tecno-pop-5-go": {
        model: "Tecno Pop 5 Go",
        storage: "1GB RAM / 16GB Storage",
        cash: 7500,
        deposit: 1500,
        daily: 65,
        period: 95
    },
    "tecno-pop-5": {
        model: "Tecno Pop 5",
        storage: "2GB RAM / 32GB Storage",
        cash: 8500,
        deposit: 1500,
        daily: 70,
        period: 105
    },

    // ── TECNO SPARK SERIES ─────────────────────────────────────────────────
    "tecno-spark-40": {
        model: "Tecno Spark 40",
        storage: "4GB RAM / 128GB Storage",
        cash: 14200,
        deposit: 1850,
        daily: 110,
        period: 150
    },
    "tecno-spark-30": {
        model: "Tecno Spark 30",
        storage: "4GB RAM / 128GB Storage",
        cash: 13800,
        deposit: 1850,
        daily: 105,
        period: 145
    },
    "tecno-spark-20": {
        model: "Tecno Spark 20",
        storage: "8GB RAM / 256GB Storage",
        cash: 21000,
        deposit: 2100,
        daily: 150,
        period: 185
    },
    "tecno-spark-10": {
        model: "Tecno Spark 10",
        storage: "4GB RAM / 128GB Storage",
        cash: 16500,
        deposit: 1850,
        daily: 125,
        period: 160
    },
    "tecno-spark-9": {
        model: "Tecno Spark 9",
        storage: "4GB RAM / 64GB Storage",
        cash: 13500,
        deposit: 1500,
        daily: 105,
        period: 140
    },
    "tecno-spark-8": {
        model: "Tecno Spark 8",
        storage: "4GB RAM / 64GB Storage",
        cash: 12800,
        deposit: 1500,
        daily: 100,
        period: 135
    },
    "tecno-spark-7": {
        model: "Tecno Spark 7",
        storage: "3GB RAM / 64GB Storage",
        cash: 11200,
        deposit: 1500,
        daily: 90,
        period: 130
    },
    "tecno-spark-6": {
        model: "Tecno Spark 6",
        storage: "4GB RAM / 64GB Storage",
        cash: 10500,
        deposit: 1500,
        daily: 85,
        period: 125
    },
    "tecno-spark-go-2023": {
        model: "Tecno Spark Go 2023",
        storage: "3GB RAM / 64GB Storage",
        cash: 10200,
        deposit: 1500,
        daily: 85,
        period: 120
    },
    "tecno-spark-go-2022": {
        model: "Tecno Spark Go 2022",
        storage: "2GB RAM / 32GB Storage",
        cash: 9000,
        deposit: 1500,
        daily: 75,
        period: 110
    },

    // ── TECNO CAMON SERIES ─────────────────────────────────────────────────
    "tecno-camon-30s": {
        model: "Tecno Camon 30S",
        storage: "6GB RAM / 128GB Storage",
        cash: 24500,
        deposit: 2100,
        daily: 175,
        period: 220
    },
    "tecno-camon-20": {
        model: "Tecno Camon 20",
        storage: "8GB RAM / 256GB Storage",
        cash: 25000,
        deposit: 2100,
        daily: 180,
        period: 210
    },
    "tecno-camon-19": {
        model: "Tecno Camon 19",
        storage: "6GB RAM / 128GB Storage",
        cash: 23000,
        deposit: 2100,
        daily: 165,
        period: 195
    },
    "tecno-camon-18": {
        model: "Tecno Camon 18",
        storage: "4GB RAM / 128GB Storage",
        cash: 20500,
        deposit: 2100,
        daily: 150,
        period: 180
    },
    "tecno-camon-17": {
        model: "Tecno Camon 17",
        storage: "4GB RAM / 128GB Storage",
        cash: 18500,
        deposit: 1850,
        daily: 135,
        period: 160
    },

    // ── SAMSUNG GALAXY A SERIES ────────────────────────────────────────────
    "samsung-galaxy-a04": {
        model: "Samsung Galaxy A04",
        storage: "3GB RAM / 32GB Storage",
        cash: 13500,
        deposit: 1500,
        daily: 105,
        period: 140
    },
    "samsung-galaxy-a05": {
        model: "Samsung Galaxy A05",
        storage: "4GB RAM / 64GB Storage",
        cash: 12500,
        deposit: 1500,
        daily: 100,
        period: 145
    },
    "samsung-galaxy-a14": {
        model: "Samsung Galaxy A14",
        storage: "4GB RAM / 64GB Storage",
        cash: 15000,
        deposit: 1850,
        daily: 115,
        period: 150
    },
    "samsung-galaxy-a15": {
        model: "Samsung Galaxy A15",
        storage: "6GB RAM / 128GB Storage",
        cash: 19500,
        deposit: 1850,
        daily: 145,
        period: 165
    },
    "samsung-galaxy-a24": {
        model: "Samsung Galaxy A24",
        storage: "6GB RAM / 128GB Storage",
        cash: 22000,
        deposit: 2100,
        daily: 160,
        period: 185
    },
    "samsung-galaxy-a04s": {
        model: "Samsung Galaxy A04s",
        storage: "3GB RAM / 32GB Storage",
        cash: 14000,
        deposit: 1850,
        daily: 110,
        period: 140
    },
    "samsung-galaxy-a13": {
        model: "Samsung Galaxy A13",
        storage: "4GB RAM / 64GB Storage",
        cash: 16500,
        deposit: 1850,
        daily: 125,
        period: 150
    },
    "samsung-galaxy-a23": {
        model: "Samsung Galaxy A23",
        storage: "4GB RAM / 64GB Storage",
        cash: 20500,
        deposit: 2100,
        daily: 150,
        period: 175
    },
    "samsung-galaxy-a03": {
        model: "Samsung Galaxy A03",
        storage: "3GB RAM / 32GB Storage",
        cash: 11000,
        deposit: 1500,
        daily: 90,
        period: 130
    },
    "samsung-galaxy-a12": {
        model: "Samsung Galaxy A12",
        storage: "4GB RAM / 64GB Storage",
        cash: 14500,
        deposit: 1850,
        daily: 110,
        period: 145
    },
    "samsung-galaxy-a22": {
        model: "Samsung Galaxy A22",
        storage: "4GB RAM / 64GB Storage",
        cash: 18000,
        deposit: 1850,
        daily: 135,
        period: 165
    },
    "samsung-galaxy-a02": {
        model: "Samsung Galaxy A02",
        storage: "2GB RAM / 32GB Storage",
        cash: 10500,
        deposit: 1500,
        daily: 85,
        period: 120
    },
    "samsung-galaxy-a11": {
        model: "Samsung Galaxy A11",
        storage: "2GB RAM / 32GB Storage",
        cash: 11500,
        deposit: 1500,
        daily: 90,
        period: 130
    },
    "samsung-galaxy-a21s": {
        model: "Samsung Galaxy A21s",
        storage: "3GB RAM / 32GB Storage",
        cash: 16000,
        deposit: 1850,
        daily: 120,
        period: 155
    },

    // ── SAMSUNG M & F SERIES ───────────────────────────────────────────────
    "samsung-galaxy-m14": {
        model: "Samsung Galaxy M14",
        storage: "4GB RAM / 64GB Storage",
        cash: 15500,
        deposit: 1850,
        daily: 115,
        period: 160
    },
    "samsung-galaxy-f13": {
        model: "Samsung Galaxy F13",
        storage: "4GB RAM / 64GB Storage",
        cash: 16500,
        deposit: 1850,
        daily: 125,
        period: 150
    },
    "samsung-galaxy-m13": {
        model: "Samsung Galaxy M13",
        storage: "4GB RAM / 64GB Storage",
        cash: 17000,
        deposit: 1850,
        daily: 130,
        period: 145
    },
    "samsung-galaxy-f12": {
        model: "Samsung Galaxy F12",
        storage: "4GB RAM / 64GB Storage",
        cash: 14000,
        deposit: 1850,
        daily: 110,
        period: 140
    },
    "samsung-galaxy-m12": {
        model: "Samsung Galaxy M12",
        storage: "3GB RAM / 32GB Storage",
        cash: 13000,
        deposit: 1500,
        daily: 100,
        period: 130
    }
};

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

  // ---------- Smooth Scroll ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  const path = window.location.pathname.toLowerCase();

  // ================= FORM PAGE =================
  if (path.includes("form.html")) {
    const params = new URLSearchParams(window.location.search);
    const phoneId = params.get("id");
    const phone = phonesData[phoneId];

    const summaryDiv = document.getElementById("phone-summary");
    const form = document.getElementById("application-form");

    if (!summaryDiv || !form) return;

    if (!phone) {
      summaryDiv.innerHTML = `<p style="color:red;">Phone not found.</p>`;
      return;
    }

    summaryDiv.innerHTML = `
      <h3>Selected Phone</h3>
      <p><strong>Model:</strong> ${phone.model}</p>
      <p><strong>Storage:</strong> ${phone.storage}</p>
      <p><strong>Cash Price:</strong> KES ${phone.cash.toLocaleString()}</p>
      <p><strong>Deposit:</strong> KES ${phone.deposit.toLocaleString()}</p>
      <p><strong>Daily:</strong> KES ${phone.daily} × ${phone.period} days</p>
    `;

    form.addEventListener("submit", e => {
      e.preventDefault();

      const orderData = {
        phoneId,
        fullName: document.getElementById("full-name").value.trim(),
        idNumber: document.getElementById("id-number").value.trim(),
        phoneNumber: document.getElementById("phone-number").value.trim(),
        guarantorPhone: document.getElementById("guarantor-phone").value.trim(),
        pickupTown: document.getElementById("pickup-town").value
      };

      if (Object.values(orderData).some(v => !v)) {
        alert("Please fill in all fields.");
        return;
      }

      localStorage.setItem("orderData", JSON.stringify(orderData));
      window.location.href = "payment.html";
    });
  }

  // ================= PAYMENT PAGE =================
  if (path.includes("payment.html")) {
    const summaryDiv = document.getElementById("payment-summary");
    const payBtn = document.getElementById("pay-deposit-btn");

    if (!summaryDiv || !payBtn) return;

    const orderData = JSON.parse(localStorage.getItem("orderData"));
    if (!orderData) {
      summaryDiv.innerHTML = `<p style="color:red;">Order missing.</p>`;
      return;
    }

    const phone = phonesData[orderData.phoneId];
    if (!phone) {
      summaryDiv.innerHTML = `<p style="color:red;">Phone missing.</p>`;
      return;
    }

    summaryDiv.innerHTML = `
      <h3>Order Summary</h3>
      <p><strong>Phone:</strong> ${phone.model}</p>
      <p><strong>Deposit:</strong> KES ${phone.deposit}</p>
      <hr>
      <p><strong>Name:</strong> ${orderData.fullName}</p>
      <p><strong>Phone:</strong> ${orderData.phoneNumber}</p>
    `;

    payBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("https://workback-c5j2.onrender.com/api/payments/stk-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: orderData.phoneNumber,
            amountKES: phone.deposit,
            phoneModel: phone.model
          })
        });

        const data = await res.json();
        if (!data.paymentId) throw new Error();

        alert("STK Push sent. Enter M-PESA PIN.");
        pollPaymentStatus(data.paymentId);

      } catch {
        alert("Payment initiation failed.");
      }
    });
  }
});

// ================= POLL PAYMENT STATUS =================
function pollPaymentStatus(paymentId) {
  let attempts = 0;
  const MAX_ATTEMPTS = 15;

  const interval = setInterval(async () => {
    attempts++;

    if (attempts >= MAX_ATTEMPTS) {
      clearInterval(interval);
      alert("Payment timeout. Please check M-PESA.");
      return;
    }

    const res = await fetch(
      `https://workback-c5j2.onrender.com/api/payments/status/${paymentId}`
    );
    const data = await res.json();

    if (data.status === "success") {
      clearInterval(interval);
      alert("Payment successful!");
      localStorage.removeItem("orderData");
    }

    if (data.status === "failed") {
      clearInterval(interval);
      alert("Payment failed.");
    }
  }, 4000);
}


// ================= HAMBURGER MENU TOGGLE =================
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.main-nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            nav.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                nav.classList.remove('active');
            }
        });

        // Optional: Highlight current page
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === '../index.html')) {
                link.classList.add('active');
            }
        });
    }
});