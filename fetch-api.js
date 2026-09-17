/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  // Fetch products
  const products = JSON.parse(await fetch('https://fakestoreapi.com/products'));
  console.log(`Total products: ${products.length}`);

  // Fetch categories
  const categories = JSON.parse(await fetch('https://fakestoreapi.com/products/categories'));
  console.log(`Categories: ${categories.join(', ')}`);

  // Show sample
  console.log('\nSample product:');
  console.log(JSON.stringify(products[0], null, 2));
}

main().catch(e => console.error(e.message));
