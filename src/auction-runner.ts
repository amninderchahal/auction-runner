import * as fs from 'fs';
import { Bid, BidderConfig, Config, ObjectMap, SiteBids, SiteConfig } from './interfaces';

const configData: Config = JSON.parse(fs.readFileSync('/auction/config.json', 'utf8'));
const inputData: SiteBids[] = JSON.parse(fs.readFileSync(0, 'utf8'));

const validSitesMap: ObjectMap<SiteConfig> = {};
const validBiddersMap: ObjectMap<BidderConfig> = {};
const outputData: Bid[][] = [];

configData.sites.forEach(site => validSitesMap[site.name] = site);
configData.bidders.forEach(bidder => validBiddersMap[bidder.name] = bidder);

function processSiteBids(siteBids: SiteBids, unitBidMap: ObjectMap<Bid>) {
    siteBids.bids.forEach(bid => {
        if (isBidValid(siteBids, unitBidMap, bid)) {
            const adjustedHighestBid = getAdjustedBid(unitBidMap[bid.unit]);
            unitBidMap[bid.unit] = bid.bid > adjustedHighestBid ? bid : unitBidMap[bid.unit];
        }
    });
}

function isBidValid(siteBids: SiteBids, unitBidMap: ObjectMap<Bid>, bid: Bid): boolean {
    const adjustedBid = getAdjustedBid(bid);
    const siteConfig = validSitesMap[siteBids.site];
    const bidderConfig = validBiddersMap[bid.bidder];

    return siteConfig != null
        && bidderConfig != null
        && unitBidMap[bid.unit] != null
        && siteConfig.bidders.includes(bid.bidder)
        && siteBids.units.includes(bid.unit)
        && bid.bid >= siteConfig.floor;
}

function addBidsToOutput(unitBidMap: ObjectMap<Bid>) {
    const bids = [];
    Object.values(unitBidMap).forEach(bid => {
        if (Object.keys(bid).length > 0) {
            bids.push(bid);
        }
    });
    outputData.push(bids);
}

function getAdjustedBid(bidObj: Bid): number {
    const bidderConfig = validBiddersMap[bidObj.bidder];
    const adjustmentFactor = bidderConfig && bidderConfig.adjustment || 0;
    const bid = bidObj.bid || 0;

    return bid + bid * adjustmentFactor;
}

// Process input
inputData.forEach(siteBids => {
    const siteConfig = validSitesMap[siteBids.site];
    const unitBidMap: ObjectMap<Bid> = {};
    siteBids.units.forEach(unit => unitBidMap[unit] = {} as any);

    if (siteConfig == null) {
        outputData.push([]);
        return;
    }

    processSiteBids(siteBids, unitBidMap);
    addBidsToOutput(unitBidMap);
});

// Print output
console.log(JSON.stringify(outputData, null, 2));