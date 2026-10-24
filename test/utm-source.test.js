import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const scriptPath = new URL('../src/js/main.js', import.meta.url);
const botHref = 'tg://resolve?domain=vpn_time_pro_bot&start=site_vtime';
const botFallback = 'https://t.me/vpn_time_pro_bot?start=site_vtime';

function renderPage(pageHref, definitions) {
    const location = new URL(pageHref);
    const links = definitions.map((definition) => {
        const attributes = new Map([['href', definition.href]]);
        if (definition.download) attributes.set('download', '');
        const dataset = {};
        if (definition.fallback !== undefined) {
            dataset.telegramFallback = definition.fallback;
        }

        return {
            dataset,
            get href() {
                return new URL(attributes.get('href'), location).href;
            },
            set href(value) {
                attributes.set('href', value);
            },
            getAttribute(name) {
                if (name === 'data-telegram-fallback') {
                    return dataset.telegramFallback ?? null;
                }
                return attributes.get(name) ?? null;
            },
            setAttribute(name, value) {
                if (name === 'data-telegram-fallback') {
                    dataset.telegramFallback = value;
                } else {
                    attributes.set(name, value);
                }
            },
            hasAttribute(name) {
                return name === 'data-telegram-fallback'
                    ? dataset.telegramFallback !== undefined
                    : attributes.has(name);
            },
        };
    });

    runInNewContext(readFileSync(scriptPath, 'utf8'), {
        URL,
        URLSearchParams,
        window: { location },
        document: {
            querySelector: () => null,
            querySelectorAll: (selector) => {
                assert.equal(selector, 'a[href]');
                return links;
            },
        },
    }, { filename: scriptPath.pathname });

    return links;
}

test('keeps default links when utm_source is absent or empty', () => {
    for (const pageHref of ['https://vtime.pro/', 'https://vtime.pro/?utm_source=']) {
        const [bot, internal] = renderPage(pageHref, [
            { href: botHref, fallback: botFallback },
            { href: '/instructions/?tab=devices#xray' },
        ]);
        assert.equal(bot.getAttribute('href'), botHref);
        assert.equal(bot.dataset.telegramFallback, botFallback);
        assert.equal(internal.getAttribute('href'), '/instructions/?tab=devices#xray');
    }
});

test('prefixes the bot deep link and its HTTPS fallback with utm_source', () => {
    const [bot, httpsBot] = renderPage('https://vtime.pro/?utm_source=youtube', [
        { href: botHref, fallback: botFallback },
        { href: botFallback },
    ]);
    assert.equal(bot.href, 'tg://resolve?domain=vpn_time_pro_bot&start=youtube__site_vtime');
    assert.equal(bot.dataset.telegramFallback, 'https://t.me/vpn_time_pro_bot?start=youtube__site_vtime');
    assert.equal(httpsBot.href, 'https://t.me/vpn_time_pro_bot?start=youtube__site_vtime');
});

test('retains the source across several internal page navigations', () => {
    const [instructions] = renderPage('https://vtime.pro/?utm_source=youtube', [
        { href: '/instructions/' },
    ]);
    assert.equal(new URL(instructions.href).searchParams.get('utm_source'), 'youtube');

    const [device] = renderPage(instructions.href, [{ href: 'xray/windows/' }]);
    assert.equal(new URL(device.href).pathname, '/instructions/xray/windows/');
    assert.equal(new URL(device.href).searchParams.get('utm_source'), 'youtube');

    const [home] = renderPage(device.href, [{ href: '/' }]);
    const [bot] = renderPage(home.href, [{ href: botHref, fallback: botFallback }]);
    assert.equal(new URL(bot.href).searchParams.get('start'), 'youtube__site_vtime');
    assert.equal(new URL(bot.dataset.telegramFallback).searchParams.get('start'), 'youtube__site_vtime');
});

test('preserves query parameters and hashes without duplicating utm_source', () => {
    const [relative, absolute] = renderPage('https://vtime.pro/?utm_source=youtube', [
        { href: '/faq/?topic=payments&utm_source=old#balance' },
        { href: 'https://vtime.pro/rules/?lang=ru#refunds' },
    ]);
    const relativeUrl = new URL(relative.href);
    assert.equal(relativeUrl.pathname, '/faq/');
    assert.equal(relativeUrl.searchParams.get('topic'), 'payments');
    assert.deepEqual(relativeUrl.searchParams.getAll('utm_source'), ['youtube']);
    assert.equal(relativeUrl.hash, '#balance');
    const absoluteUrl = new URL(absolute.href);
    assert.equal(absoluteUrl.searchParams.get('lang'), 'ru');
    assert.equal(absoluteUrl.searchParams.get('utm_source'), 'youtube');
    assert.equal(absoluteUrl.hash, '#refunds');
});

test('keeps Telegram proxy, support and third-party resource links unchanged', () => {
    const hrefs = [
        'tg://proxy?server=proxy.vtime.pro&port=443&secret=example',
        'tg://webproxy?server=proxy.vtime.pro%2Fpath&secret=example',
        'tg://resolve?domain=vpn_time_support',
        'tg://resolve?domain=another_bot&start=site_vtime',
        'tg://resolve?domain=vpn_time_pro_bot',
        'https://t.me/vpn_time_support?start=help',
        'https://t.me/proxy?server=proxy.vtime.pro&port=443&secret=example',
        'https://example.com/?start=site_vtime',
        'https://vtime.pro.example.com/faq/',
        'mailto:support@vtime.pro',
        'tel:+70000000000',
    ];
    const links = renderPage('https://vtime.pro/?utm_source=youtube', hrefs.map((href) => ({ href })));
    links.forEach((link, index) => assert.equal(link.getAttribute('href'), hrefs[index]));
});

test('keeps hash-only placeholders, empty anchors and downloads unchanged', () => {
    const definitions = [
        { href: '#' },
        { href: '#devices' },
        { href: '' },
        { href: '/downloads/setup.zip?version=2', download: true },
    ];
    const links = renderPage('https://vtime.pro/?utm_source=youtube', definitions);
    links.forEach((link, index) => assert.equal(link.getAttribute('href'), definitions[index].href));
});

test('encodes a source value safely and preserves other bot parameters', () => {
    const source = 'video&channel=two';
    const [bot, internal] = renderPage(`https://vtime.pro/?utm_source=${encodeURIComponent(source)}`, [
        {
            href: `${botHref}&profile=1#open`,
            fallback: `${botFallback}&profile=1#open`,
        },
        { href: '/faq/?topic=payments#balance' },
    ]);
    for (const href of [bot.href, bot.dataset.telegramFallback]) {
        const url = new URL(href);
        assert.deepEqual(url.searchParams.getAll('start'), [`${source}__site_vtime`]);
        assert.equal(url.searchParams.get('profile'), '1');
        assert.equal(url.searchParams.has('channel'), false);
        assert.equal(url.hash, '#open');
    }
    const internalUrl = new URL(internal.href);
    assert.equal(internalUrl.searchParams.get('utm_source'), source);
    assert.equal(internalUrl.searchParams.get('topic'), 'payments');
    assert.equal(internalUrl.hash, '#balance');
});
