const goTopBtn = document.querySelector(".go-top");

if(goTopBtn){
    
    goTopBtn.addEventListener("click", goTop);
    window.addEventListener("scroll", trackScroll);
    function trackScroll() {
        const scrolled = window.pageYOffset;

        if (scrolled > 200) {
            goTopBtn.classList.add("go-top--show");
        } else {
            goTopBtn.classList.remove("go-top--show");
        }
    }

    function goTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

const TELEGRAM_WEB_ORIGIN = "https://t.me/";
const TELEGRAM_APP_PREFIX = "tg://resolve?domain=";
const TELEGRAM_FALLBACK_DELAY_MS = 500;

function buildTelegramAppUrl(webUrl) {
    const telegramUrl = new URL(webUrl);
    const username = telegramUrl.pathname.replace(/^\/+/, "").trim();

    if (!username) {
        return null;
    }

    const appUrl = new URL(`${TELEGRAM_APP_PREFIX}${username}`);
    telegramUrl.searchParams.forEach((value, key) => {
        appUrl.searchParams.set(key, value);
    });

    return appUrl.toString();
}

function enhanceTelegramLinks() {
    const telegramLinks = document.querySelectorAll('a[href^="https://t.me/"]');

    telegramLinks.forEach((link) => {
        const webUrl = link.getAttribute("href");
        if (!webUrl || !webUrl.startsWith(TELEGRAM_WEB_ORIGIN)) {
            return;
        }

        const appUrl = buildTelegramAppUrl(webUrl);
        if (!appUrl) {
            return;
        }

        link.setAttribute("href", appUrl);
        link.addEventListener("click", () => {
            window.setTimeout(() => {
                window.location.href = webUrl;
            }, TELEGRAM_FALLBACK_DELAY_MS);
        });
    });
}

enhanceTelegramLinks();
