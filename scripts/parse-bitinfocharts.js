/**
 * Script pour parser les données de BitInfoCharts Rich List
 * 
 * Usage:
 * 1. Allez sur https://bitinfocharts.com/bitcoin/rich-list
 * 2. Copiez le tableau HTML ou les données
 * 3. Exécutez ce script avec les données
 * 
 * Ou utilisez directement les données fournies ci-dessous
 */

// Données extraites du Top 100 Bitcoin Rich List
const bitinfochartsData = `
1	34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo	wallet: Binance-coldwallet	248,598 BTC
2	3M219KR5vEneNb47ewrPfWyb5jQ2DjxRP6	wallet: Binance-coldwallet	147,123 BTC
3	bc1ql49ydapnjafl5t2cp9zqpjwe6pdgmxy98859v2	wallet: Robinhood-coldwallet	140,575 BTC
4	bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97	wallet: Bitfinex-coldwallet	130,010 BTC
5	bc1qazcm763858nkj2dj986etajv6wquslv8uxwczt	wallet: Bitfinex-Hack-Recovery	94,643 BTC
6	bc1qd4ysezhmypwty5dnw7c8nqy5h5nxg0xqsvaefd0qn5kq32vwnwqqgv4rzr	91,850 BTC
7	bc1qjasf9z3h7w3jspkhtgatgpyvvzgpa2wwd2lr0eh5tx44reyn2k7sfc27a4	wallet: Tether	87,296 BTC
8	1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF	wallet: MtGox-Hack	79,957 BTC
9	bc1q8yj0herd4r4yxszw3nkfvt53433thk0f5qst4g	78,317 BTC
10	bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6	wallet: SilkRoad-FBI-Confiscated	69,370 BTC
11	3LYJfcfHPXYJreMsASk2jkn69LWEYKzexb	wallet: Binance-BTCB-Reserve	68,200 BTC
12	1Ay8vMC7R1UbyCCZRVULMV7iQpHSAbguJP	wallet: Mr.100	61,374 BTC
13	3MgEAFWu1HKSnZ5ZsC8qf61ZW18xrP5pgd	wallet: OKEx	56,110 BTC
19	bc1q4j7fcl8zx5yl56j00nkqez9zf3f6ggqchwzzcs5hjxwqhsgxvavq3qfgpr	wallet: Coincheck	41,808 BTC
21	3LQUu4v9z6KNch71j7kbj8GPeAGUo1FW6a	wallet: Binance-coldwallet	37,927 BTC
22	bc1q7ydrtdn8z62xhslqyqtyt38mm4e2c4h3mxjkug	wallet: UK-Gov-Confiscated	36,000 BTC
25	bc1qx9t2l3pyny2spqpqlye8svce70nppwtaxwdrp4	wallet: Binance-Pool	31,643 BTC
27	3FHNBLobJnbCTFTVakh5TXmEneyf5PT61B	wallet: Binance-coldwallet	31,275 BTC
43	bc1qr4dl5wa7kl8yu792dceg9z5knl2gkn220lk7a9	wallet: Crypto.com-coldwallet	19,594 BTC
44	bc1qx2x5cqhymfcnjtg902ky6u5t5htmt7fvqztdsm028hkrvxcl4t2sjtpd9l	wallet: Bitbank-coldwallet	19,528 BTC
47	bc1q32lyrhp9zpww22phqjwwmelta0c8a5q990ghs6	wallet: Ceffu-coldwallet	16,845 BTC
49	1PJiGp2yDLvUgqeBsuZVCBADArNsk6XEiw	wallet: Binance-coldwallet	16,391 BTC
50	34HpHYiyQwg69gFmCq2BGHjF1DZnZnBeBP	wallet: Binance-coldwallet	16,307 BTC
51	3JZq4atUahhuA9rLhXLMhhTo133J9rF97j	wallet: Bitfinex-coldwallet	16,000 BTC
53	3FM9vDYsN2iuMPKWjAcqgyahdwdrUxhbJ3	wallet: OKEx	15,718 BTC
54	bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h	wallet: Binance-wallet	15,083 BTC
60	bc1qchctnvmdva5z9vrpxkkxck64v7nmzdtyxsrq64	wallet: BitMEX	13,315 BTC
62	bc1q4vxn43l44h30nkluqfxd9eckf45vr2awz38lwa	wallet: UK-Gov-Confiscated	13,003 BTC
64	bc1qkmk4v2xn29yge68fq6zh7gvfdqrvpq3v3p3y0s	wallet: Bitfinex-Hack-Recovery	12,267 BTC
74	1Q8QR5k32hexiMQnRgkJ6fmmjn5fMWhdv9	wallet: Binance-Pool	10,217 BTC
91	1DcT5Wij5tfb3oVViF8mA8p4WrG98ahZPT	wallet: OKX	10,000 BTC
92	1CY7fykRLWXeSbKB885Kr4KjQxmDdvW923	wallet: OKX	10,000 BTC
`;

function parseBitInfoChartsData(data) {
  const lines = data.trim().split('\n').filter(line => line.trim());
  const whales = [];
  
  lines.forEach(line => {
    // Format: rank address label balance
    const parts = line.split('\t');
    if (parts.length >= 3) {
      const rank = parts[0].trim();
      const address = parts[1].trim();
      let label = parts[2].trim();
      const balance = parts[3] ? parts[3].trim() : '';
      
      // Nettoyer le label (enlever "wallet: ")
      if (label.startsWith('wallet: ')) {
        label = label.replace('wallet: ', '');
      }
      
      // Déterminer le type
      let type = 'Unknown';
      if (label.includes('Binance') || label.includes('Coinbase') || label.includes('Kraken') || 
          label.includes('Bitfinex') || label.includes('OKEx') || label.includes('OKX') || 
          label.includes('Crypto.com') || label.includes('Bitbank') || label.includes('Coincheck') ||
          label.includes('BitMEX') || label.includes('Robinhood') || label.includes('Ceffu')) {
        type = 'Exchange';
      } else if (label.includes('Gov') || label.includes('FBI') || label.includes('UK-Gov') || 
                 label.includes('Confiscated') || label.includes('Seizure')) {
        type = 'Government';
      } else if (label.includes('Tether') || label.includes('USDC')) {
        type = 'Stablecoin';
      } else if (label.includes('Hack') || label.includes('MtGox')) {
        type = 'Hack';
      } else if (label.includes('Pool')) {
        type = 'Mining';
      } else if (label.includes('Mr.100')) {
        type = 'Trader';
      } else if (address && !label) {
        type = 'Unknown';
      }
      
      if (address && (address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1'))) {
        whales.push({
          name: label || `Bitcoin Whale #${rank}`,
          type: type,
          chain: 'BTC',
          address: address,
          notes: `Source: BitInfoCharts Rich List - Rank #${rank}${balance ? ` - ${balance}` : ''}`,
        });
      }
    }
  });
  
  return whales;
}

// Parser les données
const parsedWhales = parseBitInfoChartsData(bitinfochartsData);

// Générer le format pour cryptoWhales.js
console.log('\n🐋 Baleines extraites de BitInfoCharts:\n');
console.log(`Total: ${parsedWhales.length} baleines\n`);

console.log('📋 Format pour cryptoWhales.js:\n');
parsedWhales.forEach((whale, index) => {
  console.log(`
{
  name: "${whale.name}",
  type: "${whale.type}",
  chain: "${whale.chain}",
  address: "${whale.address}",
  notes: "${whale.notes}",
},`);
});

// Exporter pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseBitInfoChartsData, parsedWhales };
}

// Fonction helper pour ajouter manuellement
function addWhaleFromBitInfo(name, address, type = 'Exchange', balance = '') {
  return `
{
  name: "${name}",
  type: "${type}",
  chain: "BTC",
  address: "${address}",
  notes: "Source: BitInfoCharts Rich List${balance ? ` - ${balance}` : ''}",
},`;
}

console.log('\n✅ Utilisation:');
console.log('1. Copiez le format ci-dessus');
console.log('2. Ajoutez dans config/cryptoWhales.js');
console.log('3. Ou utilisez: addWhaleFromBitInfo("Nom", "adresse", "Type", "balance")');


