const QRCode = require('qrcode');
const jsQR = require('jsqr');

function drawQR(data) {
  const canvas = document.createElement('canvas');
  return QRCode.toCanvas(canvas, data).then(() => canvas);
}

test('encode and decode QR code', async () => {
  const data = 'hello QR';
  const canvas = await drawQR(data);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, canvas.width, canvas.height);
  expect(code.data).toBe(data);
});
