// Menu toggle
function toggleMenu() {
    console.log('Toggling menu');
    const menu = document.querySelector('.nav-menu');
    menu.classList.toggle('active');
    if (menu.classList.contains('active')) {
        menu.querySelector('a').focus();
    }
}

// Modal handling
function openModal(modalId) {
    console.log('Opening modal:', modalId);
    document.getElementById(modalId).style.display = 'flex';
    // Close hamburger menu when opening modal on mobile
    document.querySelector('.nav-menu').classList.remove('active');
}

function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    document.getElementById(modalId).style.display = 'none';
}

// Partner modal
let currentPartnerUrl = '';
function openPartnerModal(partnerName, url) {
    console.log('Opening partner modal for:', partnerName);
    currentPartnerUrl = url;
    const modal = document.getElementById('partnerModal');
    modal.style.display = 'flex';
    document.getElementById('visitButton').onclick = () => {
        window.open(url, '_blank');
        closePartnerModal();
    };
    // Close hamburger menu when opening partner modal
    document.querySelector('.nav-menu').classList.remove('active');
}

function closePartnerModal() {
    console.log('Closing partner modal');
    document.getElementById('partnerModal').style.display = 'none';
    currentPartnerUrl = '';
}

// Format API date (YYYY-MM-DD to DD-MM-YYYY)
function formatApiDate(apiDate) {
    console.log('Formatting date:', apiDate);
    if (!apiDate) return 'Unknown Date';
    const [year, month, day] = apiDate.split('-');
    return `${day}-${month}-${year}`;
}

// Fetch rates from backend (replace with your backend URL)
async function fetchRates() {
    console.log('Fetching rates...');
    try {
        const cached = sessionStorage.getItem('rates');
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < 30 * 60 * 1000) { // Cache valid for 30 minutes
                console.log('Using cached rates');
                return data;
            }
        }

        const response = await fetch('https://your-backend-domain.com/api/rates');
        const data = await response.json();
        console.log('Rates API response:', data);
        if (data.success) {
            const result = {
                rates: {
                    USD_NGN: data.rates.NGN / data.rates.USD,
                    EUR_XOF: data.rates.XOF / data.rates.EUR,
                    GBP_GHS: data.rates.GHS / data.rates.GBP,
                    USD_XOF: data.rates.XOF / data.rates.USD,
                    USD_GHS: data.rates.GHS / data.rates.USD,
                    EUR_NGN: data.rates.NGN / data.rates.EUR,
                    EUR_GHS: data.rates.GHS / data.rates.EUR,
                    GBP_NGN: data.rates.NGN / data.rates.GBP,
                    GBP_XOF: data.rates.XOF / data.rates.GBP
                },
                date: data.date
            };
            sessionStorage.setItem('rates', JSON.stringify({
                data: result,
                timestamp: Date.now()
            }));
            console.log('Rates cached:', result);
            return result;
        } else {
            throw new Error('API error: ' + (data.error?.info || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error fetching rates:', error.message);
        console.warn('Using mock rates due to API failure. To use live rates, set up a backend at https://your-backend-domain.com/api/rates with ExchangeRate-API or similar. See backend setup instructions.');
        // Log error to backend (if available)
        fetch('/api/log-error', {
            method: 'POST',
            body: JSON.stringify({ error: 'Rate fetch failed', details: error.message }),
            headers: { 'Content-Type': 'application/json' }
        }).catch(() => console.log('Error logging disabled due to missing backend'));
        // Return mock rates
        const mockRates = {
            rates: {
                USD_NGN: 1600.50,
                EUR_XOF: 655.96,
                GBP_GHS: 17.25,
                USD_XOF: 600.00,
                USD_GHS: 13.50,
                EUR_NGN: 1750.75,
                EUR_GHS: 14.80,
                GBP_NGN: 2000.25,
                GBP_XOF: 780.10
            },
            date: '2025-04-29'
        };
        sessionStorage.setItem('rates', JSON.stringify({
            data: mockRates,
            timestamp: Date.now()
        }));
        return mockRates;
    }
}

// Fetch news from backend (replace with your backend URL)
async function fetchNews() {
    console.log('Fetching news...');
    try {
        const cached = sessionStorage.getItem('news');
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < 15 * 60 * 1000) { // Cache valid for 15 minutes
                console.log('Using cached news:', data);
                return data;
            }
        }

        let response = await fetch('https://your-backend-domain.com/api/news?category=business&country=ng,gh');
        let data = await response.json();
        console.log('News API response:', data);

        if (data.status === 'ok' && data.articles && data.articles.length > 0) {
            const articles = data.articles.map(article => ({
                title: article.title,
                source: article.source.name,
                publishedAt: article.publishedAt.split('T')[0]
            })).slice(0, 4);
            sessionStorage.setItem('news', JSON.stringify({
                data: articles,
                timestamp: Date.now()
            }));
            console.log('News cached:', articles);
            return articles;
        } else {
            console.log('No articles for ng,gh business. Trying broader query...');
            response = await fetch('https://your-backend-domain.com/api/news?category=business');
            data = await response.json();

            if (data.status === 'ok' && data.articles && data.articles.length > 0) {
                const articles = data.articles.map(article => ({
                    title: article.title,
                    source: article.source.name,
                    publishedAt: article.publishedAt.split('T')[0]
                })).slice(0, 4);
                sessionStorage.setItem('news', JSON.stringify({
                    data: articles,
                    timestamp: Date.now()
                }));
                console.log('Fallback news cached:', articles);
                return articles;
            } else {
                console.log('No articles in fallback. Using mock data.');
                const mockArticles = [
                    { title: 'Nigerian Economy Grows 3.5%', source: 'Reuters', publishedAt: '2025-04-25' },
                    { title: 'Ghana Central Bank Holds Rates', source: 'BBC', publishedAt: '2025-04-24' },
                    { title: 'West African Markets Rally', source: 'Bloomberg', publishedAt: '2025-04-23' }
                ];
                sessionStorage.setItem('news', JSON.stringify({
                    data: mockArticles,
                    timestamp: Date.now()
                }));
                return mockArticles;
            }
        }
    } catch (error) {
        console.error('Error fetching news:', error.message);
        console.warn('Using mock news due to API failure. To use live news, set up a backend at https://your-backend-domain.com/api/news with NewsAPI or similar. See backend setup instructions.');
        // Log error to backend
        fetch('/api/log-error', {
            method: 'POST',
            body: JSON.stringify({ error: 'News fetch failed', details: error.message }),
            headers: { 'Content-Type': 'application/json' }
        }).catch(() => console.log('Error logging disabled due to missing backend'));
        const cached = sessionStorage.getItem('news');
        if (cached) {
            const { data } = JSON.parse(cached);
            console.log('Using cached news due to error:', data);
            return data;
        }
        console.log('No cached news. Using mock data.');
        return [
            { title: 'Nigerian Economy Grows 3.5%', source: 'Reuters', publishedAt: '2025-04-25' },
            { title: 'Ghana Central Bank Holds Rates', source: 'BBC', publishedAt: '2025-04-24' },
            { title: 'West African Markets Rally', source: 'Bloomberg', publishedAt: '2025-04-23' }
        ];
    }
}

// Update rates display
async function updateRates() {
    console.log('Updating rates...');
    sessionStorage.removeItem('rates'); // Clear cache for fresh data
    const result = await fetchRates();
    const ratesContainer = document.getElementById('rates-container');
    ratesContainer.innerHTML = '';
    if (result && result.rates) {
        const formattedDate = formatApiDate(result.date);
        const pairs = [
            { base: 'USD', name: 'USD → NGN', value: result.rates.USD_NGN },
            { base: 'EUR', name: 'EUR → XOF', value: result.rates.EUR_XOF },
            { base: 'GBP', name: 'GBP → GHS', value: result.rates.GBP_GHS }
        ];
        pairs.forEach(pair => {
            const card = document.createElement('div');
            card.className = 'rate-card';
            card.innerHTML = `
                <h3>${formattedDate} 1 ${pair.base} → ${pair.name.split(' → ')[1]} Rate</h3>
                <p>${pair.value ? pair.value.toFixed(2) : 'Unavailable'}</p>
            `;
            ratesContainer.appendChild(card);
        });
    } else {
        ratesContainer.innerHTML = '<p>Sorry, we couldn’t load rates. Please try again later.</p>';
    }
}

// Update news display
async function updateNews() {
    console.log('Updating news...');
    sessionStorage.removeItem('news'); // Clear cache for fresh data
    const news = await fetchNews();
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '';
    if (news && news.length > 0) {
        news.forEach(article => {
            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                <h3>${article.title}</h3>
                <p>Source: ${article.source} | Date: ${article.publishedAt}</p>
            `;
            newsContainer.appendChild(card);
        });
    } else {
        newsContainer.innerHTML = '<p>Sorry, we couldn’t load news. Please try again later.</p>';
    }
}

// Calculate currency conversion
async function calculateConversion() {
    console.log('Calculating conversion...');
    const amountInput = document.getElementById('amount');
    const amount = parseFloat(amountInput.value);
    const from = document.getElementById('fromCurrency').value;
    const to = document.getElementById('toCurrency').value;
    const resultElement = document.getElementById('result');

    // Validate amount
    if (isNaN(amount) || amount <= 0 || amount > 1000000) {
        resultElement.innerText = 'Error: Please enter a valid amount between 0.01 and 1,000,000';
        return;
    }

    const result = await fetchRates();
    if (result && result.rates) {
        const rate = result.rates[`${from}_${to}`];
        if (rate) {
            const converted = amount * rate;
            resultElement.innerText = `Result: ${converted.toFixed(2)} ${to}`;
        } else {
            resultElement.innerText = 'Error: Conversion not supported';
        }
    } else {
        resultElement.innerText = 'Error: Unable to fetch rates. Please try again later.';
    }
}

// Input validation for contact form
function validateContactForm(form) {
    const name = form.name.value;
    const email = form.email.value;
    const message = form.message.value;

    if (!/^[a-zA-Z\s]{1,50}$/.test(name)) {
        alert('Invalid name (letters and spaces only, max 50 chars)');
        return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Invalid email');
        return false;
    }
    if (message.length > 500) {
        alert('Message too long (max 500 chars)');
        return false;
    }
    return true;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu
    document.querySelector('.hamburger').addEventListener('click', toggleMenu);

    // Modal buttons
    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', () => openModal(button.dataset.modal));
    });

    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => closeModal(button.closest('.modal').id));
    });

    // Partner cards
    document.querySelectorAll('.partner-card').forEach(card => {
        card.addEventListener('click', () => {
            openPartnerModal(card.dataset.partner, card.dataset.url);
        });
    });

    // Calculator form
    document.getElementById('calculatorForm').addEventListener('submit', e => {
        e.preventDefault();
        calculateConversion();
    });

    // Contact form
    document.getElementById('contactForm').addEventListener('submit', e => {
        e.preventDefault();
        if (validateContactForm(e.target)) {
            console.log('Contact form submitted');
            alert('Message sent! (Connect to your backend here)');
            e.target.reset();
        }
    });

    // Login form (mock)
    document.getElementById('loginForm').addEventListener('submit', e => {
        e.preventDefault();
        console.log('Login form submitted');
        alert('Login submitted! (Connect to your backend here)');
        closeModal('loginModal');
    });

    // Register form (mock)
    document.getElementById('registerForm').addEventListener('submit', e => {
        e.preventDefault();
        console.log('Register form submitted');
        alert('Register submitted! (Connect to your backend here)');
        closeModal('registerModal');
    });

    // Fetch CSRF token (requires backend)
    /*
    fetch('/api/csrf-token')
        .then(res => res.json())
        .then(data => {
            document.getElementById('calcCsrfToken').value = data.csrfToken;
            document.getElementById('contactCsrfToken').value = data.csrfToken;
            document.getElementById('loginCsrfToken').value = data.csrfToken;
            document.getElementById('registerCsrfToken').value = data.csrfToken;
        });
    */

    // Initialize
    console.log('Initializing app');
    updateRates();
    updateNews();

    // Auto-refresh rates every 30 minutes (ExchangeRate-API free tier: ~1500 requests/month)
    setInterval(updateRates, 30 * 60 * 1000); // 1800000 ms

    // Auto-refresh news every 15 minutes (NewsAPI free tier: ~100 requests/day)
    setInterval(updateNews, 15 * 60 * 1000); // 900000 ms
});