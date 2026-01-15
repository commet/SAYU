"use strict";
// 🎨 SAYU Artist Types - 저작권 안전 구조
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPublicDomainArtist = isPublicDomainArtist;
exports.isLicensedArtist = isLicensedArtist;
exports.isContemporaryArtist = isContemporaryArtist;
exports.isVerifiedArtist = isVerifiedArtist;
// Helper type guards
function isPublicDomainArtist(artist) {
    return artist.copyrightStatus === 'public_domain';
}
function isLicensedArtist(artist) {
    return artist.copyrightStatus === 'licensed';
}
function isContemporaryArtist(artist) {
    return artist.copyrightStatus === 'contemporary';
}
function isVerifiedArtist(artist) {
    return artist.copyrightStatus === 'verified_artist';
}
