export type CopyrightStatus = 'public_domain' | 'licensed' | 'contemporary' | 'verified_artist';
export interface BaseArtist {
    id: string;
    name: string;
    nameKo?: string;
    birthYear?: number;
    deathYear?: number;
    nationality: string;
    nationalityKo?: string;
    bio: string;
    bioKo?: string;
    copyrightStatus: CopyrightStatus;
    followCount: number;
    isFollowing?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface PublicDomainArtist extends BaseArtist {
    copyrightStatus: 'public_domain';
    images: {
        portrait?: string;
        works: PublicDomainWork[];
    };
    sources: {
        wikidata?: string;
        metMuseum?: string;
        rijksmuseum?: string;
        wikimedia?: string;
    };
}
export interface LicensedArtist extends BaseArtist {
    copyrightStatus: 'licensed';
    licenseInfo: {
        licenseType: string;
        licenseHolder: string;
        licensedUntil?: Date;
        usageRights: string[];
    };
    images: {
        portrait?: string;
        thumbnails: LicensedWork[];
    };
    purchaseLinks?: {
        gallery?: string;
        website?: string;
        marketplace?: string;
    };
}
export interface ContemporaryArtist extends BaseArtist {
    copyrightStatus: 'contemporary';
    officialLinks: {
        instagram?: string;
        website?: string;
        gallery?: string;
        twitter?: string;
        facebook?: string;
    };
    representation?: {
        gallery: string;
        gallerySite?: string;
        agent?: string;
    };
    recentExhibitions: {
        title: string;
        venue: string;
        year: number;
        city: string;
        link?: string;
    }[];
    mediaLinks: {
        interviews: MediaLink[];
        articles: MediaLink[];
        reviews: MediaLink[];
    };
}
export interface VerifiedArtist extends BaseArtist {
    copyrightStatus: 'verified_artist';
    isVerified: true;
    verificationDate: Date;
    verificationMethod: 'email' | 'gallery' | 'institution';
    artistManaged: {
        profileImage?: string;
        allowedWorks: VerifiedWork[];
        customBio?: string;
        socialLinks: Record<string, string>;
    };
    permissions: {
        canShareImages: boolean;
        allowCommercialUse: boolean;
        allowDerivativeWorks: boolean;
        customLicense?: string;
    };
}
export type Artist = PublicDomainArtist | LicensedArtist | ContemporaryArtist | VerifiedArtist;
export interface BaseWork {
    id: string;
    title: string;
    titleKo?: string;
    year?: number;
    medium: string;
    mediumKo?: string;
    dimensions?: string;
    description?: string;
    descriptionKo?: string;
    artistId: string;
}
export interface PublicDomainWork extends BaseWork {
    images: {
        thumbnail: string;
        medium: string;
        large: string;
        source: string;
    };
    metadata: {
        museum?: string;
        accessionNumber?: string;
        creditLine?: string;
        rights: 'Public Domain' | 'CC0' | 'CC BY';
    };
    downloadable: true;
}
export interface LicensedWork extends BaseWork {
    images: {
        thumbnail: string;
        watermarked: string;
    };
    licenseInfo: {
        holder: string;
        restrictions: string[];
        purchaseLink?: string;
    };
    downloadable: false;
}
export interface VerifiedWork extends BaseWork {
    images?: {
        original?: string;
        thumbnail?: string;
    };
    uploadedBy: 'artist' | 'gallery' | 'representative';
    uploadDate: Date;
    visibility: 'public' | 'followers' | 'private';
    price?: {
        amount: number;
        currency: string;
        isForSale: boolean;
    };
    allowSharing: boolean;
}
export interface MediaLink {
    title: string;
    url: string;
    date: Date;
    source: string;
    language: 'ko' | 'en' | 'other';
}
export declare function isPublicDomainArtist(artist: Artist): artist is PublicDomainArtist;
export declare function isLicensedArtist(artist: Artist): artist is LicensedArtist;
export declare function isContemporaryArtist(artist: Artist): artist is ContemporaryArtist;
export declare function isVerifiedArtist(artist: Artist): artist is VerifiedArtist;
export interface SimpleArtist {
    id: string;
    name: string;
    nameKo?: string;
    bio?: string;
    bioKo?: string;
    birthYear?: number;
    deathYear?: number;
    nationality?: string;
    nationalityKo?: string;
    artMovements?: string[];
    notableWorks?: string[];
    imageUrl?: string;
    images?: string[] | {
        portrait?: string;
        works?: any[];
    };
    followCount?: number;
    copyrightStatus?: CopyrightStatus;
    isFollowing?: boolean;
    artistManaged?: boolean | any;
    palette?: string[];
}
export interface ArtistColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    palette?: string[];
}
//# sourceMappingURL=artist-types.d.ts.map