const utmSource = new URLSearchParams(window.location.search).get('utm_source');

function addUtmSource(href) {
    let url;
    try {
        url = new URL(href, window.location.href);
    } catch {
        return href;
    }

    const isTelegramBot = url.protocol === 'tg:'
        && url.hostname === 'resolve'
        && url.searchParams.get('domain') === 'vpn_time_pro_bot';
    const isWebBot = url.protocol === 'https:'
        && url.hostname === 't.me'
        && url.pathname === '/vpn_time_pro_bot';
    const start = url.searchParams.get('start');

    if ((isTelegramBot || isWebBot) && start) {
        const prefix = `${utmSource}__`;
        if (!start.startsWith(prefix)) {
            url.searchParams.set('start', `${prefix}${start}`);
        }
        return url.href;
    }

    // Only carry attribution between pages on this site, never to proxy URLs.
    if (['http:', 'https:'].includes(url.protocol)
        && url.origin === window.location.origin) {
        url.searchParams.set('utm_source', utmSource);
        return url.href;
    }

    return href;
}

if (utmSource) {
    document.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || link.hasAttribute('download')) {
            return;
        }

        link.setAttribute('href', addUtmSource(href));
        if (link.dataset.telegramFallback) {
            link.dataset.telegramFallback = addUtmSource(link.dataset.telegramFallback);
        }
    });
}

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
