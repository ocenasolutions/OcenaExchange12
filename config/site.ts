export const siteConfig = {
  name: "Ocena Exchange",
  description: "Trade Crypto with Confidence",
  mainNav: [
    {
      title: "Markets",
      href: "/markets",
    },
    {
      title: "Trade",
      href: "/trade",
      submenu: [
        { title: "Spot Trading", href: "/trade" },
        { title: "Margin Trading", href: "/trade/margin" },
        { title: "P2P Trading", href: "/p2p" },
      ],
    },
    {
      title: "Futures",
      href: "/futures",
      submenu: [
        { title: "USDⓈ-M Futures", href: "/futures" },
        { title: "COIN-M Futures", href: "/futures/coin" },
        { title: "Options", href: "/futures/options" },
      ],
    },
    {
      title: "Earn",
      href: "/earn",
      submenu: [
        { title: "Staking", href: "/earn" },
        { title: "Launchpad", href: "/earn?tab=launchpad" },
        { title: "Savings", href: "/earn/savings" },
      ],
    },
    {
      title: "NFT",
      href: "/nft",
      submenu: [
        { title: "Marketplace", href: "/nft" },
        { title: "Create", href: "/nft/create" },
        { title: "My Collection", href: "/nft/collection" },
      ],
    },
    {
      title: "Portfolio",
      href: "/portfolio",
    },
  ],
  links: {
    twitter: "https://twitter.com/ocenaexchange",
    github: "https://github.com/ocenaexchange",
    docs: "https://docs.ocenaexchange.com",
  },
}
