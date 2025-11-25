
export const disposableDomains = [
    "10minutemail.com",
    "10minutemail.net",
    "10minutemail.org",
    "guerrillamail.com",
    "guerrillamailblock.com",
    "guerrillamail.net",
    "guerrillamail.org",
    "sharklasers.com",
    "grr.la",
    "guerrillamail.biz",
    "guerrillamail.de",
    "temp-mail.org",
    "temp-mail.ru",
    "temp-mail.net",
    "tempmail.com",
    "tempmail.net",
    "tempmail.org",
    "fake-email.com",
    "fakeinbox.com",
    "fakermail.com",
    "mailinator.com",
    "maildrop.cc",
    "yopmail.com",
    "yopmail.fr",
    "yopmail.net",
    "cool.fr.nf",
    "jetable.fr.nf",
    "courriel.fr.nf",
    "moncourrier.fr.nf",
    "monemail.fr.nf",
    "monmail.fr.nf",
    "hide-my-email.com",
    "temp-mail.io",
    "tempmail.io",
    "throwawaymail.com",
    "dispostable.com",
    "getairmail.com",
    "incognitomail.org",
    "33mail.com",
    "anonbox.net",
    "antichef.com",
    "antichef.net",
    "boun.cr",
    "boxymail.com",
    "byom.de",
    "clrmail.com",
    "contactroot.com",
    "deadaddress.com",
    "discard.email",
    "discardmail.com",
    "discardmail.de",
    "disposable.com",
    "disposable-email.com",
    "dppmail.com",
    "eml.monster",
    "eml.pro",
    "eml.tmp",
    "filzmail.com",
    "fleckens.hu",
    "getnada.com",
    "gishpuppy.com",
    "inbox.si",
    "inboxalias.com",
    "inboxclean.com",
    "inboxproxy.com",
    "jetable.org",
    "lortemail.dk",
    "mailcatch.com",
    "mailcreations.com",
    "mailforce.net",
    "mailforspam.com",
    "mailgolem.com",
    "mailimate.com",
    "mailnesia.com",
    "mailnull.com",
    "mailprox.com",
    "mailsac.com",
    "mailscrap.com",
    "mailtemp.net",
    "mailu.me",
    "mailv.net",
    "mintemail.com",
    "moakt.com",
    "my10minutemail.com",
    "mytemp.email",
    "nada.email",
    "nada.ltd",
    "nopmail.com",
    "nowmymail.com",
    "nospam.today",
    "nospamfor.us",
    "nospam4.us",
    "owlymail.com",
    "pookmail.com",
    "r.789.st",
    "s.789.st",
    "safetymail.info",
    "shortmail.net",
    "spambog.com",
    "spambox.us",
    "spamgourmet.com",
    "spamhole.com",
    "spaml.de",
    "spammotel.com",
    "spamthis.co.uk",
    "spamtrap.ro",
    "superrito.com",
    "teleworm.us",
    "temp.email",
    "tempail.com",
    "tempinbox.com",
    "tempmail.de",
    "tempr.email",
    "tmail.ws",
    "trbvm.com",
    "trash-mail.com",
    "trashmail.com",
    "trashmail.net",
    "trashmail.org",
    "u.789.st",
    "unmail.com",
    "v.789.st",
    "verifymail.org",
    "vkcode.ru",
    "warts.com",
    "wmail.club",
    "yomail.info",
    "zalap.com"
];

// Local check (Fast)
export function isDisposableEmailLocal(email: string): boolean {
    if (!email) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return disposableDomains.includes(domain);
}

// Remote check using DeBounce API (Comprehensive)
export async function isDisposableEmailRemote(email: string): Promise<boolean> {
    try {
        // First check local list to save API calls/time
        if (isDisposableEmailLocal(email)) {
            return true;
        }

        const response = await fetch(`https://disposable.debounce.io/?email=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            // Set a timeout to avoid hanging if the API is slow
            signal: AbortSignal.timeout(3000)
        });

        if (!response.ok) {
            console.warn('DeBounce API error:', response.status);
            return false; // Fail open if API is down
        }

        const data = await response.json();
        // The API returns { disposable: "true" } (string) or boolean, handle both
        return data.disposable === 'true' || data.disposable === true;
    } catch (error) {
        console.error('Disposable email check failed:', error);
        return false; // Fail open
    }
}
