export interface SiteConfig {
    name: string;
    bidders: string[];
    floor: number;
}

export interface BidderConfig {
    name: string;
    adjustment: number;
}

export interface Config {
    sites: SiteConfig[];
    bidders: BidderConfig[];
}

export interface Bid {
    bidder: string;
    unit: string;
    bid: number;
}

export interface SiteBids {
    site: string;
    units: string[];
    bids: Bid[];
}

export interface ObjectMap<T> {
    [key: string]: T
}
