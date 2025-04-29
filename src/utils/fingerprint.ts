import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function getFingerprint() {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId; // This is the unique fingerprint
}