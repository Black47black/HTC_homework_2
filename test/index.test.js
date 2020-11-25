const puppeteer = require('puppeteer');
const portscanner = require('portscanner');
const express = require('express');

const app = express();

let server = null;
let browser = null;
let document = null;

beforeAll(async () => {
  const port = await portscanner.findAPortNotInUse(8080, 9000);

  app.use(express.static('public'));
  server = app.listen(port);

  browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}`);
  document = page.mainFrame();
});

afterAll(async () => {
  await browser?.close();
  server?.close();
});

test('Документ должен содержать <!DOCTYPE html>', async () => {
  const html = await document.content();
  expect(html).toContain('<!DOCTYPE html>');
});

describe.each([
  'html', 'head', 'body',
  'title', 'meta', 'style',
  'h1', 'h2', 'p',
  'ul', 'ol', 'li',
  'table', 'caption', 'tr', 'th', 'td',
])('Документ должен содержать хотя бы один элемент типа', (type) => {
  test(`<${type}>`, async () => {
    const element = await document.$(type);
    expect(element).not.toBeNull();
  });
});

describe.each([
  'color', 'text-align', 'text-indent', 'text-shadow',
  'font-style', 'font-weight', 'font-size', 'font-family',
])('В стилях должно быть обозначено свойство', (property) => {
  test(`${property}`, async () => {
    const css = await document.$eval('style', (style) => style.innerHTML);
    expect(css).toContain(`${property}:`);
  });
});
