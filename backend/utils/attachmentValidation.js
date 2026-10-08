const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const validateBase64Attachment = (data) => {
  if (!data) return null;
  if (typeof data !== 'string') return 'The attachment data is invalid.';

  const separator = data.indexOf(',');
  if (separator < 0 || !/^data:[^;,]+;base64$/i.test(data.slice(0, separator))) {
    return 'The attachment must be a valid Base64 file.';
  }

  const encoded = data.slice(separator + 1);
  const maxEncodedLength = Math.ceil(MAX_ATTACHMENT_BYTES / 3) * 4;
  if (encoded.length > maxEncodedLength) {
    return 'Attachments must be under 10 MB.';
  }
  const padding = encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0;
  const content = padding ? encoded.slice(0, -padding) : encoded;
  if (
    encoded.length % 4 !== 0 ||
    /[^A-Za-z0-9+/]/.test(content) ||
    (padding === 2 && content.length % 4 !== 2) ||
    (padding === 1 && content.length % 4 !== 3) ||
    (!padding && content.length % 4 !== 0)
  ) {
    return 'The attachment must be a valid Base64 file.';
  }

  const decodedBytes = (encoded.length / 4) * 3 - padding;
  if (decodedBytes >= MAX_ATTACHMENT_BYTES) {
    return 'Attachments must be under 10 MB.';
  }
  return null;
};

module.exports = { validateBase64Attachment };
