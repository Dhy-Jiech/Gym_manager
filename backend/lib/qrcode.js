import QRCode from 'qrcode'

export async function generateQRCode(data) {
  try {
    const url = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 2,
    })
    return url
  } catch (err) {
    throw new Error('Failed to generate QR code')
  }
}

export async function generateQRCodeBuffer(data) {
  return QRCode.toBuffer(data, {
    errorCorrectionLevel: 'M',
    width: 300,
    margin: 2,
  })
}
